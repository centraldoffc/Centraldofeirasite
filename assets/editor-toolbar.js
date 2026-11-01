(() => {
  const tools = document.getElementById('editor-tools');
  const editor = document.getElementById('body');
  const side = document.getElementById('editor-side');
  const section = document.getElementById('v-edit');
  const anchor = document.createComment('Ferramentas no celular');
  tools.before(anchor);
  const mobile = matchMedia('(max-width:900px)');
  const viewport = window.visualViewport;
  let baseline = window.innerHeight;
  let frame = 0;
  let revealCaret = false;

  // Evita que o toque na formatação feche o teclado ou perca a seleção.
  tools.querySelector('.tb').addEventListener('pointerdown', event => {
    if (event.target.closest('button')) event.preventDefault();
  });
  function update() {
    frame = 0;
    const editing = editor.contains(document.activeElement) || tools.contains(document.activeElement);
    const visibleHeight = viewport?.height || innerHeight;
    if (!editing) baseline = Math.max(baseline, innerHeight);
    const keyboard = Math.max(baseline, innerHeight) - visibleHeight > 100;
    const docked = mobile.matches && !section.hidden && !document.getElementById('app').hidden && editing && keyboard && (!viewport || viewport.scale === 1);
    tools.classList.toggle('is-docked', docked);
    editor.style.scrollMarginBottom = docked ? `${tools.offsetHeight + 24}px` : '';
    if (docked) {
      tools.style.top = `${Math.max(viewport?.offsetTop || 0, (viewport?.offsetTop || 0) + visibleHeight - tools.offsetHeight)}px`;
      if (revealCaret && editor.contains(document.activeElement)) {
        const selection = getSelection();
        if (selection.rangeCount && editor.contains(selection.focusNode)) {
          const caret = selection.getRangeAt(0).cloneRange();
          caret.collapse(false);
          const rect = caret.getBoundingClientRect();
          const bottom = tools.getBoundingClientRect().top - 12;
          if (rect.height && rect.bottom > bottom) window.scrollBy(0, rect.bottom - bottom);
        }
      }
    } else tools.style.removeProperty('top');
    revealCaret = false;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function place() {
    tools.classList.remove('is-docked');
    tools.style.removeProperty('top');
    if (mobile.matches) anchor.after(tools);
    else side.prepend(tools);
    baseline = innerHeight;
    schedule();
  }
  mobile.addEventListener('change', place);
  viewport?.addEventListener('resize', () => { revealCaret = true; schedule(); });
  viewport?.addEventListener('scroll', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', () => { baseline = innerHeight; schedule(); });
  document.addEventListener('focusin', () => { revealCaret = true; schedule(); });
  editor.addEventListener('input', () => { revealCaret = true; schedule(); });
  document.addEventListener('focusout', schedule);
  new ResizeObserver(schedule).observe(tools);
  new MutationObserver(schedule).observe(section, {attributes:true,attributeFilter:['hidden']});
  new MutationObserver(schedule).observe(document.getElementById('app'), {attributes:true,attributeFilter:['hidden']});
  place();
})();
