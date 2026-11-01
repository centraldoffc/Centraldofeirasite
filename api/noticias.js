// GET /api/noticias            -> lista (page, limit, search)
// GET /api/noticias?slug=...   -> uma notícia completa (também aceita ?id=...)
const { summary } = require('../assets/article-format');
const { q, origin } = require('./_lib');

const COLS = 'id,slug,title,summary,image_url,author,featured,created_at,updated_at';
const shape = (a, o) => ({ ...a, summary: summary(a.content, a.title), url: a.slug ? `${o}/noticia/${a.slug}` : null });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const o = origin(req), { slug, id, page = '1', limit = '10', search } = req.query;
  try {
    if (slug || id) {
      const f = slug ? `slug=eq.${encodeURIComponent(slug)}` : `id=eq.${encodeURIComponent(id)}`;
      const rows = await q(`articles?published=eq.true&${f}&select=${COLS},content,images&limit=1`);
      return rows[0] ? res.json(shape(rows[0], o)) : res.status(404).json({ error: 'nao_encontrada' });
    }
    const l = Math.min(50, Math.max(1, +limit || 10)), p = Math.max(1, +page || 1);
    let path = `articles?published=eq.true&select=${COLS},content&order=created_at.desc&limit=${l + 1}&offset=${(p - 1) * l}`;
    if (search) path += `&title=ilike.*${encodeURIComponent(String(search).replace(/[*%,()]/g, ' '))}*`;
    const rows = await q(path);
    res.json({ page: p, hasMore: rows.length > l, items: rows.slice(0, l).map(a => { const { content, ...item } = shape(a, o); return item; }) });
  } catch (e) {
    res.status(500).json({ error: 'erro_no_servidor' });
  }
};
