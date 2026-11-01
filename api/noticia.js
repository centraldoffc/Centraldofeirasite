// Página real de cada notícia: /noticia/<slug> (HTML pronto, com dados para o Google)
const { summary } = require('../assets/article-format');
const { q, esc, origin, clean } = require('./_lib');

const page = (title, body, head = '') => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${head}<link rel="icon" href="/mark.png">
<link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/leitura.css"><script defer src="/assets/leitura.js"></script>
</head><body data-reading="true" class="reading-page"><header class="news-header"><div class="news-header-inner"><a class="news-brand" href="/site" aria-label="Central do FFC — notícias"><img src="/mark.png" alt="Central do FFC"></a><details class="news-menu"><summary aria-label="Menu de navegação"><span></span><span></span><span></span></summary><nav aria-label="Navegação"><a href="/">Início</a><a href="/site">Todas as notícias</a><a href="/login">Entrar</a></nav></details></div></header><main class="w">${body}</main></body></html>`;

module.exports = async (req, res) => {
  const o = origin(req), slug = String(req.query.slug || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const [a] = await q(`articles?published=eq.true&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
    if (!a) return res.status(404).send(page('Notícia não encontrada', '<h1>Notícia não encontrada</h1><p><a href="/site">Voltar para as notícias</a></p>', '<meta name="robots" content="noindex">'));
    const url = `${o}/noticia/${a.slug}`, desc = summary(a.content, a.title);
    const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, description: desc, mainEntityOfPage: url,
      image: a.image_url ? [a.image_url] : undefined, datePublished: a.created_at, dateModified: a.updated_at || a.created_at,
      author: [{ '@type': 'Person', name: a.author || 'Redação Central do FFC' }],
      publisher: { '@type': 'Organization', name: 'Central do FFC', logo: { '@type': 'ImageObject', url: `${o}/mark.png` } } };
    const head = `<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(a.title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">
${a.image_url ? `<meta property="og:image" content="${esc(a.image_url)}"><meta name="twitter:card" content="summary_large_image">` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
    const text = /<[a-z][\s\S]*>/i.test(a.content || '') ? clean(a.content) : String(a.content || '').split(/\n{2,}/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
    const minutes = Math.max(1, Math.ceil(text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length / 200));
    const body = `<article class="news-article"><a class="news-back" href="/site">← Todas as notícias</a>
<div class="reading-tools" role="group" aria-label="Preferências de leitura"><button type="button" data-reading-action="size" aria-label="Aumentar texto. Tamanho padrão">Texto padrão</button><button type="button" data-reading-action="theme" aria-pressed="false">Leitura escura</button><span class="reading-status" role="status" aria-live="polite"></span></div>
<p class="news-category">FEIRA FUTEBOL CLUBE</p><h1>${esc(a.title)}</h1>${desc ? `<p class="lead">${esc(desc)}</p>` : ''}
<div class="news-meta"><time datetime="${esc(a.created_at)}">${new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Bahia' })}</time><span>${esc(a.author || 'Redação Central do FFC')}</span><span>${minutes} min de leitura</span></div>
${a.image_url ? `<img class="cover" src="${esc(a.image_url)}" alt="${esc(a.title)}">` : ''}<div class="t news-content">${text}</div></article><a class="news-back news-bottom" href="/site">← Voltar às notícias</a>`;
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(page(`${a.title} — Central do FFC`, body, head));
  } catch (e) {
    res.status(500).send(page('Erro', '<h1>Não foi possível carregar a notícia agora.</h1><p><a href="/site">Voltar</a></p>'));
  }
};
