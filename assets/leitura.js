(() => {
  const key = 'ffc-reading';
  let size = 20, dark = false;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (Number.isFinite(saved.size)) size = Math.min(26, Math.max(16, saved.size));
    dark = saved.dark === true;
  } catch {}
  function apply(announce = false) {
    document.body.classList.toggle('reading-page', document.body.dataset.reading === 'true' || !!document.querySelector('#article:not([hidden]) .art'));
    document.body.classList.toggle('reading-dark', dark);
    document.body.style.setProperty('--reading-size', size + 'px');
    document.querySelectorAll('[data-reading-action]').forEach(button => {
      const action = button.dataset.readingAction;
      if (action === 'smaller') button.disabled = size <= 16;
      if (action === 'larger') button.disabled = size >= 26;
      if (action === 'size') {
        button.textContent = size <= 20 ? 'Texto padrão' : size <= 23 ? 'Texto ampliado' : 'Texto grande';
        button.setAttribute('aria-label', size >= 26 ? 'Restaurar tamanho padrão' : 'Aumentar texto. ' + button.textContent);
      }
      if (action === 'theme') {
        button.setAttribute('aria-pressed', String(dark));
        button.textContent = dark ? 'Leitura clara' : 'Leitura escura';
      }
    });
    if (announce) document.querySelectorAll('.reading-status').forEach(el => { el.textContent = `Texto em ${size} pixels. Leitura ${dark ? 'escura' : 'clara'}.`; });
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.news-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); }); });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-reading-action]');
    if (!button) return;
    const action = button.dataset.readingAction;
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
