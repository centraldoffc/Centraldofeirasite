// Página real de cada notícia: /noticia/<slug> (HTML pronto, com dados para o Google)
const { summary } = require('../assets/article-format');
const { q, esc, origin, clean } = require('./_lib');

const page = (title, body, head = '') => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>${head}<link rel="icon" href="/assets/central-logo.svg">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/leitura.css"><script defer src="/assets/leitura.js"></script>
<link rel="stylesheet" href="/assets/brand.css">
</head><body data-reading="true" class="reading-page article-reader"><main class="w"><header class="reader-header"><a class="reader-icon" href="/site" aria-label="Voltar às notícias"><img src="/assets/reader-icons/arrow-left.svg" alt=""></a><a class="reader-brand" href="/site"><img class="ffc-logo" src="/assets/central-logo.svg" alt="Central do FFC" width="28" height="28"></a><button type="button" class="reader-icon" data-reading-action="share" aria-label="Compartilhar matéria"><img src="/assets/reader-icons/share-2.svg" alt=""></button></header>${body}</main></body></html>`;

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
      publisher: { '@type': 'Organization', name: 'Central do FFC', logo: { '@type': 'ImageObject', url: `${o}/assets/central-logo.svg` } } };
    const head = `<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Central do FFC"><meta property="article:published_time" content="${esc(a.created_at)}"><meta property="article:modified_time" content="${esc(a.updated_at || a.created_at)}"><meta property="og:title" content="${esc(a.title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">
${a.image_url ? `<meta property="og:image" content="${esc(a.image_url)}"><meta name="twitter:card" content="summary_large_image">` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
    const text = /<[a-z][\s\S]*>/i.test(a.content || '') ? clean(a.content) : String(a.content || '').split(/\n{2,}/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
    const minutes = Math.max(1, Math.ceil(text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length / 200));
    const date = new Date(a.created_at).toLocaleDateString('pt-BR', { day:'2-digit',month:'long',year:'numeric',timeZone:'America/Bahia' });
    const body = `<article class="news-article">
<div class="reader-heading"><div class="reader-kicker"><span>${esc(a.category || 'Feira FC')}</span><span>${minutes} min de leitura</span></div>
<h1>${esc(a.title)}</h1>
<div class="reader-byline"><div><span>Por <strong>${esc(a.author || 'Redação Central do FFC')}</strong></span><time datetime="${esc(a.created_at)}">${date}</time></div></div></div>
<div class="t news-content">${text}</div>
<footer class="reader-end"><span>Você leu na Central do FFC</span><a href="/site">Veja mais notícias do Feira FC</a></footer></article>
<nav class="reader-dock" aria-label="Ações da matéria">
<button type="button" data-reading-action="save" aria-pressed="false" aria-label="Salvar matéria neste aparelho"><img src="/assets/reader-icons/bookmark.svg" alt=""><span class="action-label">Salvar</span></button>
<button type="button" data-reading-action="size" aria-label="Aumentar tamanho do texto"><img src="/assets/reader-icons/type.svg" alt=""><span class="action-label">Texto</span></button>
<button type="button" data-reading-action="theme" aria-pressed="false"><img src="/assets/reader-icons/moon.svg" alt=""><span class="action-label">Escuro</span></button>
</nav><p class="reading-status reader-announcement" role="status" aria-live="polite"></p>`;
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(page(`${a.title} — Central do FFC`, body, head));
  } catch (e) {
    res.status(500).send(page('Erro', '<h1>Não foi possível carregar a notícia agora.</h1><p><a href="/site">Voltar</a></p>'));
  }
};
