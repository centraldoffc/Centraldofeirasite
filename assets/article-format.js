// Mesmo resumo no painel, nos cards e nos metadados da notícia.
(function(root) {
  const entities = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”'};
  function summary(content, fallback = '') {
    const text = String(content || '').replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]*>/g, ' ').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code) => {
        if (code[0] !== '#') return entities[code.toLowerCase()] ?? all;
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2),16) : Number(code.slice(1));
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
      }).replace(/\s+/g, ' ').trim() || String(fallback || '').trim();
    if (text.length <= 180) return text;
    const part = text.slice(0, 179);
    return part.slice(0, part.lastIndexOf(' ') > 100 ? part.lastIndexOf(' ') : part.length).trimEnd() + '…';
  }
  // Recebe o HTML já sanitizado: compara a URL completa, sem confundir fotos diferentes.
  function hasInlineImage(content, cover) {
    if (!cover) return false;
    const normalize = value => {
      try { return new URL(String(value).replace(/&amp;/g, '&')).href; }
      catch { return null; }
    };
    const target = normalize(cover);
    if (!target) return false;
    return (String(content || '').match(/<img\b[^>]*>/gi) || []).some(tag => {
      const src = tag.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      return src && normalize(src[1] ?? src[2] ?? src[3]) === target;
    });
  }
  const api = {summary, hasInlineImage};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FFCArticle = api;
})(globalThis);
