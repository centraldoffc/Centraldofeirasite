// Funções compartilhadas da API. Arquivos que começam com "_" não viram rota.
const BASE = process.env.SUPABASE_URL || 'https://yeegyogxrkucuvbarwag.supabase.co';
const KEY = process.env.SUPABASE_KEY || 'sb_publishable_l5ERavd22tp6b5HEMDLJaQ_GwUh_QOL'; // chave pública (somente leitura de notícias publicadas)

async function q(path) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error('db ' + r.status);
  return r.json();
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const origin = req => `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

const OK = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption']);
const attr = (s, n) => ((s.match(new RegExp(n + '\\s*=\\s*["\']([^"\']*)["\']', 'i')) || [])[1] || '').replace(/&amp;/g, '&');
function clean(html) {
  html = String(html || '').replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, '');
  return html.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (m, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!OK.has(tag)) return '';
    if (close) return `</${tag}>`;
    if (tag === 'a') { const h = attr(attrs, 'href'); return /^(https?:|mailto:)/i.test(h) ? `<a href="${esc(h)}" target="_blank" rel="noopener noreferrer">` : '<a>'; }
    if (tag === 'img') { const s = attr(attrs, 'src'); return /^https:/i.test(s) ? `<img src="${esc(s)}" alt="${esc(attr(attrs, 'alt'))}"${['50','75','100'].includes(attr(attrs, 'data-width')) ? ` data-width="${attr(attrs, 'data-width')}"` : ''}${['left','center','right'].includes(attr(attrs, 'data-align')) ? ` data-align="${attr(attrs, 'data-align')}"` : ''} loading="lazy">` : ''; }
    return `<${tag}>`;
  });
}
module.exports = { q, esc, origin, clean };
