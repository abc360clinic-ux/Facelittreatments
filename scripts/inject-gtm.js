// Vercel build step: copies the site into dist/ and adds the Google Tag Manager snippet to EVERY .html file,
// so new pages get tracking automatically. Change the container id here (or set GTM_ID in Vercel).
const fs = require('fs'), path = require('path');
const GTM_ID = process.env.GTM_ID || 'GTM-WJNBNV6V';
const SKIP = new Set(['node_modules', '.git', 'api', 'scripts', 'dist', '.vercel']);
const head = `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script><!-- End Google Tag Manager -->`;
const body = `<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;

function inject(html) {
  if (html.includes(`id=${GTM_ID}`) || html.includes(`'${GTM_ID}'`)) return html; // already has it
  html = /<meta\s+charset[^>]*>/i.test(html) ? html.replace(/(<meta\s+charset[^>]*>)/i, `$1${head}`) : html.replace(/(<head[^>]*>)/i, `$1${head}`);
  return html.replace(/(<body[^>]*>)/i, `$1${body}`);
}
function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) && src === '.') continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d);
    else if (e.name.endsWith('.html')) fs.writeFileSync(d, inject(fs.readFileSync(s, 'utf8')));
    else fs.copyFileSync(s, d);
  }
}
fs.rmSync('dist', { recursive: true, force: true });
copy('.', 'dist');
console.log('dist built with GTM', GTM_ID);
