// GET /api/google-noticias -> últimas matérias que o Google Notícias mostra para a Central do FFC.
// Usa o feed RSS público de busca do Google Notícias (sem chave de API).
// Opcional: ?limit=10 (1 a 20). A busca é sempre pelo domínio do site + o nome "Central do FFC".
const { origin } = require('./_lib');

const dec = s => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')
  .replace(/<[^>]+>/g, '').trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, 'i')); return m ? dec(m[1]) : ''; };

function parse(xml, host) {
  return [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => {
    const x = m[1];
    const src = x.match(/<source\s+url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/i);
    const source = src ? dec(src[2]) : '';
    const srcUrl = src ? dec(src[1]) : '';
    let title = tag(x, 'title');
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    const d = new Date(tag(x, 'pubDate'));
    return {
      title, link: tag(x, 'link'), source,
      date: isNaN(d) ? null : d.toISOString(),
      ours: /central\s*do\s*(ffc|feira)/i.test(source) || (!!host && srcUrl.includes(host))
    };
  }).filter(i => i.title && /^https:/i.test(i.link));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  const host = (origin(req) || '').replace(/^https?:\/\//, '');
  const limit = Math.min(20, Math.max(1, +req.query.limit || 10));
  const query = `site:${host} OR "Central do FFC"`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CentralDoFFC/1.0)', Accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!r.ok) throw new Error('google ' + r.status);
    const items = parse(await r.text(), host).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, limit);
    res.json({ query, searchUrl: `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`, items });
  } catch (e) {
    res.status(502).json({ error: 'google_indisponivel' });
  }
};
module.exports.parse = parse;
