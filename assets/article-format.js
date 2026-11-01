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
  const api = {summary};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FFCArticle = api;
})(globalThis);
