// /sitemap.xml (todas as notícias) e /news-sitemap.xml (formato Google Notícias, últimas 48 h)
const { q, esc, origin } = require('./_lib');

module.exports = async (req, res) => {
  const o = origin(req), news = req.query.news === '1';
  try {
    const rows = await q('articles?published=eq.true&slug=not.is.null&select=slug,title,created_at,updated_at&order=created_at.desc&limit=1000');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    if (news) {
      const min = Date.now() - 48 * 3600 * 1000;
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n' +
        rows.filter(a => new Date(a.created_at) >= min).map(a => `<url><loc>${esc(`${o}/noticia/${a.slug}`)}</loc><news:news><news:publication><news:name>Central do FFC</news:name><news:language>pt</news:language></news:publication><news:publication_date>${new Date(a.created_at).toISOString()}</news:publication_date><news:title>${esc(a.title)}</news:title></news:news></url>`).join('\n');
    } else {
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + `<url><loc>${o}/</loc></url>\n<url><loc>${o}/site</loc></url>\n` +
        rows.map(a => `<url><loc>${esc(`${o}/noticia/${a.slug}`)}</loc><lastmod>${new Date(a.updated_at || a.created_at).toISOString()}</lastmod></url>`).join('\n');
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(xml + '\n</urlset>');
  } catch (e) { res.status(500).send('erro'); }
};
