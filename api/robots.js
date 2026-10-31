const { origin } = require('./_lib');
module.exports = (req, res) => {
  const o = origin(req);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *\nAllow: /\nDisallow: /gerenciar\nDisallow: /gerenciar.html\nDisallow: /painel-ffc.html\n\nSitemap: ${o}/sitemap.xml\nSitemap: ${o}/news-sitemap.xml\n`);
};
