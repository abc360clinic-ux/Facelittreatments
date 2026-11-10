// Receives the medifacials lead form and emails it via Resend.
// Env vars (Vercel -> Settings -> Environment Variables): RESEND_API_KEY, LEAD_TO_EMAIL, optional LEAD_FROM.
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill this
  const name = String(b.name || '').trim().slice(0, 80);
  const phone = String(b.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  const concern = String(b.concern || '').trim().slice(0, 80);
  if (!name || !/^[6-9]\d{9}$/.test(phone) || !concern || !b.consent) return res.status(400).json({ ok: false, error: 'invalid' });
  const key = process.env.RESEND_API_KEY, to = process.env.LEAD_TO_EMAIL;
  if (!key || !to) return res.status(500).json({ ok: false, error: 'not_configured', missing: [!key && 'RESEND_API_KEY', !to && 'LEAD_TO_EMAIL'].filter(Boolean) });
  let r, detail = '';
  try { r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.LEAD_FROM || 'Facelit Leads <onboarding@resend.dev>',
      to: to.split(',').map(s => s.trim()),
      subject: `New medifacial enquiry: ${name}`,
      html: `<p><b>Name:</b> ${esc(name)}<br><b>Phone:</b> +91 ${phone}<br><b>Concern:</b> ${esc(concern)}<br><b>Source:</b> medifacials landing page</p>`
    })
  }); } catch (e) { detail = String(e); }
  if (r && !r.ok) detail = (await r.text()).slice(0, 300);
  if (!r || !r.ok) console.error('resend failed', detail);
  return res.status(r && r.ok ? 200 : 502).json({ ok: !!(r && r.ok), error: r && r.ok ? undefined : 'send_failed', detail: r && r.ok ? undefined : detail }); // ponytail: detail is for debugging, drop once delivery works
};
