(() => {
  const editor = document.getElementById('body');
  const panel = document.getElementById('image-tools');
  let selected = null;
  const width = document.getElementById('image-width');
  const align = document.getElementById('image-align');
  const alt = document.getElementById('image-alt');
  const status = document.getElementById('image-status');
  function select(image) {
    selected?.removeAttribute('data-selected');
    selected = image;
    panel.hidden = !image;
    if (!image) return;
    image.dataset.selected = 'true';
    width.value = image.dataset.width || '100';
    align.value = image.dataset.align || 'center';
    alt.value = image.alt || '';
  }
  editor.addEventListener('click', e => select(e.target.closest('img')));
  // Imagens também podem ser selecionadas pelo teclado, sem atributos salvos no conteúdo.
  document.getElementById('select-image').onclick = () => {
    const images = [...editor.querySelectorAll('img')];
    if (!images.length) { status.textContent = 'Adicione uma imagem no texto primeiro.'; return; }
    select(images[(images.indexOf(selected) + 1) % images.length]);
    width.focus();
  };
  function change() { editor.dispatchEvent(new Event('input', {bubbles:true})); }
  width.onchange = () => { if (selected) { selected.dataset.width = width.value; change(); } };
  align.onchange = () => { if (selected) { selected.dataset.align = align.value; change(); } };
  alt.oninput = () => { if (selected) { selected.alt = alt.value; change(); } };
  panel.addEventListener('click', e => {
    const action = e.target.closest('[data-image-action]')?.dataset.imageAction;
    if (!action || !selected || !editor.contains(selected)) return;
    if (action === 'close') { select(null); editor.focus(); return; }
    if (action === 'remove') { selected.remove(); select(null); change(); status.textContent = 'Imagem removida do texto. Continua disponível na galeria.'; return; }
    let block = selected;
    while (block.parentNode !== editor) block = block.parentNode;
    if (block !== selected) {
      editor.insertBefore(selected, action === 'up' ? block : block.nextSibling);
    } else {
      const neighbor = action === 'up' ? selected.previousSibling : selected.nextSibling;
      if (!neighbor) { status.textContent = action === 'up' ? 'A imagem já está no início.' : 'A imagem já está no fim.'; return; }
      editor.insertBefore(selected, action === 'up' ? neighbor : neighbor.nextSibling);
    }
    change(); status.textContent = action === 'up' ? 'Imagem movida para cima.' : 'Imagem movida para baixo.';
  });
  window.FFCImageEditor = {
    reset() { select(null); status.textContent = ''; },
    content() { const copy = editor.cloneNode(true); copy.querySelectorAll('[data-selected]').forEach(el => el.removeAttribute('data-selected')); return copy.innerHTML; }
  };
})();
