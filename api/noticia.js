// Página real de cada notícia: /noticia/<slug> (HTML pronto, com dados para o Google)
const { q, esc, origin, clean } = require('./_lib');

const page = (title, body, head = '') => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${head}<link rel="icon" href="/mark.png">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
body{margin:0;background:radial-gradient(100% 45% at 0 100%,#10302a 0,transparent 60%),#050f0d;color:#EDF3F1;font:16.5px/1.75 Inter,sans-serif;min-height:100dvh}
a{color:#8CC4B9}.w{max-width:720px;margin:0 auto;padding:18px 16px 50px}
.top{display:flex;align-items:center;gap:9px;font:400 16px 'Archivo Black',sans-serif;color:#EDF3F1;text-decoration:none;margin-bottom:22px}.top img{width:32px;height:32px;border-radius:50%}
h1{font:400 clamp(26px,7vw,42px)/1.1 'Archivo Black',sans-serif;margin:0 0 12px}h2,h3{font-family:'Archivo Black',sans-serif;font-weight:400;margin:28px 0 10px}
.lead{color:rgba(237,243,241,.66);font-size:17px;margin:0 0 14px}.meta{font-size:13px;color:rgba(237,243,241,.45)}
.cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:16px;margin:18px 0 22px}
.t img{max-width:100%;height:auto;border-radius:12px;display:block;margin:8px auto 20px}.t p{margin:0 0 18px}
blockquote{margin:0 0 18px;padding-left:16px;border-left:3px solid #6FA89E;color:rgba(237,243,241,.66)}
</style></head><body><div class="w"><a class="top" href="/site"><img src="/mark.png" alt="">Central do FFC</a>${body}</div></body></html>`;

module.exports = async (req, res) => {
  const o = origin(req), slug = String(req.query.slug || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const [a] = await q(`articles?published=eq.true&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
    if (!a) return res.status(404).send(page('Notícia não encontrada', '<h1>Notícia não encontrada</h1><p><a href="/site">Voltar para as notícias</a></p>', '<meta name="robots" content="noindex">'));
    const url = `${o}/noticia/${a.slug}`, desc = a.summary || '';
    const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, description: desc, mainEntityOfPage: url,
      image: a.image_url ? [a.image_url] : undefined, datePublished: a.created_at, dateModified: a.updated_at || a.created_at,
      author: [{ '@type': 'Person', name: a.author || 'Redação Central do FFC' }],
      publisher: { '@type': 'Organization', name: 'Central do FFC', logo: { '@type': 'ImageObject', url: `${o}/mark.png` } } };
    const head = `<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(a.title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">
${a.image_url ? `<meta property="og:image" content="${esc(a.image_url)}"><meta name="twitter:card" content="summary_large_image">` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
    const text = /<[a-z][\s\S]*>/i.test(a.content || '') ? clean(a.content) : String(a.content || '').split(/\n{2,}/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
    const body = `<article><h1>${esc(a.title)}</h1>${desc ? `<p class="lead">${esc(desc)}</p>` : ''}
<div class="meta">Por ${esc(a.author || 'Redação Central do FFC')} · <time datetime="${esc(a.created_at)}">${new Date(a.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bahia' })}</time></div>
${a.image_url ? `<img class="cover" src="${esc(a.image_url)}" alt="${esc(a.title)}">` : ''}<div class="t">${text}</div></article><p><a href="/site">Voltar para as notícias</a></p>`;
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(page(`${a.title} — Central do FFC`, body, head));
  } catch (e) {
    res.status(500).send(page('Erro', '<h1>Não foi possível carregar a notícia agora.</h1><p><a href="/site">Voltar</a></p>'));
  }
};
