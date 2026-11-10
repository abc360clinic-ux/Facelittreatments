// Vercel build step: copies the site into dist/ and adds the Google Tag Manager snippet to EVERY .html file,
// so new pages get tracking automatically. Change the container id here (or set GTM_ID in Vercel).
const fs = require('fs'), path = require('path');
const GTM_ID = process.env.GTM_ID || 'GTM-WJNBNV6V';
const SKIP = new Set(['node_modules', '.git', 'api', 'scripts', 'dist', '.vercel']);
const headNow = `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script><!-- End Google Tag Manager -->`;
// Deferred loader: Tag Manager loads on the first touch/scroll/key/mouse move, or 4s after the page has loaded,
// so it never competes with the first paint. dataLayer events pushed earlier are queued and processed once it loads.
const headLater = `<!-- Google Tag Manager (deferred) --><script>window.dataLayer=window.dataLayer||[];(function(){var l=0,ev=['scroll','touchstart','pointerdown','keydown','mousemove'];function g(){if(l)return;l=1;ev.forEach(function(e){removeEventListener(e,g)});dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';document.head.appendChild(s)}ev.forEach(function(e){addEventListener(e,g,{passive:true})});addEventListener('load',function(){setTimeout(g,4000)})})();</script><!-- End Google Tag Manager -->`;
const body = `<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;

function inject(html, immediate) {
  const head = immediate ? headNow : headLater;
  if (html.includes(GTM_ID)) return html; // already has it
  html = /<meta\s+charset[^>]*>/i.test(html) ? html.replace(/(<meta\s+charset[^>]*>)/i, `$1${head}`) : html.replace(/(<head[^>]*>)/i, `$1${head}`);
  return html.replace(/(<body[^>]*>)/i, `$1${body}`);
}
function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) && src === '.') continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d);
    else if (e.name.endsWith('.html')) fs.writeFileSync(d, inject(fs.readFileSync(s, 'utf8'), /thank-you/.test(s)));
    else fs.copyFileSync(s, d);
  }
}
fs.rmSync('dist', { recursive: true, force: true });
copy('.', 'dist');
console.log('dist built with GTM', GTM_ID);
