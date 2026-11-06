(() => {
  const key = 'ffc-reading';
  let size = 20, dark = false;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (Number.isFinite(saved.size)) size = Math.min(26, Math.max(16, saved.size));
    dark = saved.dark === true;
  } catch {}
  let noticeTimer;
  function notice(message) { document.querySelectorAll('.reading-status').forEach(el => el.textContent = message); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => document.querySelectorAll('.reading-status').forEach(el => el.textContent = ''), 2800); }
  const articleUrl = () => document.querySelector('link[rel=canonical]')?.href || location.href;
  function saved() { try { const list = JSON.parse(localStorage.getItem('ffc-saved-articles') || '[]'); return Array.isArray(list) ? list.filter(a => a && typeof a.url === 'string') : []; } catch { return []; } }
  function apply(announce = false) {
    document.body.classList.toggle('reading-page', document.body.dataset.reading === 'true' || !!document.querySelector('#article:not([hidden]) .art'));
    document.body.classList.toggle('reading-dark', dark);
    document.body.style.setProperty('--reading-size', size + 'px');
    document.querySelectorAll('[data-reading-action]').forEach(button => {
      const action = button.dataset.readingAction;
      if (action === 'save') { const active = saved().some(a => a.url === articleUrl()); button.setAttribute('aria-pressed',String(active)); button.querySelector('.action-label').textContent = active ? 'Salva' : 'Salvar'; }
      if (action === 'smaller') button.disabled = size <= 16;
      if (action === 'larger') button.disabled = size >= 26;
      if (action === 'size') {
        const label = button.querySelector('.action-label');
        if (label) label.textContent = size <= 20 ? 'Texto' : size <= 23 ? 'Texto +' : 'Texto ++';
        else button.textContent = size <= 20 ? 'Texto padrão' : size <= 23 ? 'Texto ampliado' : 'Texto grande';
        button.setAttribute('aria-label', size >= 26 ? 'Restaurar tamanho padrão' : 'Aumentar texto. ' + button.textContent);
      }
      if (action === 'theme') {
        button.setAttribute('aria-pressed', String(dark));
        const label = button.querySelector('.action-label');
        if (label) { label.textContent = dark ? 'Claro' : 'Escuro'; button.querySelector('img').src = '/assets/reader-icons/' + (dark ? 'sun' : 'moon') + '.svg'; button.setAttribute('aria-label', dark ? 'Ativar leitura clara' : 'Ativar leitura escura'); }
        else button.textContent = dark ? 'Leitura clara' : 'Leitura escura';
      }
    });
    if (announce) notice(`Texto em ${size} pixels. Leitura ${dark ? 'escura' : 'clara'}.`);
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-reading-action]');
    if (!button) return;
    const action = button.dataset.readingAction;
    if (action === 'save') {
      try { const list = saved(), url = articleUrl(), exists = list.some(a=>a.url===url); localStorage.setItem('ffc-saved-articles',JSON.stringify(exists ? list.filter(a=>a.url!==url) : [...list,{url,title:document.querySelector('h1')?.textContent || document.title}].slice(-100))); apply(); notice(exists ? 'Matéria removida dos salvos neste aparelho.' : 'Matéria salva neste aparelho.'); } catch { notice('Não foi possível salvar neste navegador.'); } return;
    }
    if (action === 'share') {
      try { if (navigator.share) await navigator.share({title:document.title,url:articleUrl()}); else { await navigator.clipboard.writeText(articleUrl()); notice('Link copiado para compartilhar.'); } } catch (error) { if (error.name !== 'AbortError') notice('Não foi possível compartilhar. Copie o endereço da página.'); } return;
    }
    if (action === 'smaller') size = Math.max(16, size - 2);
    if (action === 'larger') size = Math.min(26, size + 2);
    if (action === 'size') size = size < 23 ? 23 : size < 26 ? 26 : 20;
    if (action === 'theme') dark = !dark;
    try { localStorage.setItem(key, JSON.stringify({size, dark})); } catch {}
    apply(true);
  });
  new MutationObserver(() => apply()).observe(document.getElementById('article') || document.body, {childList:true, attributes:true, attributeFilter:['hidden']});
  apply();
})();
