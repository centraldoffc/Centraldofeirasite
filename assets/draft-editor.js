/* Editor de matérias da agência. HTML permitido também pelo publicador. */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = s => { try { const u=new URL(s); return /^https?:$/.test(u.protocol)?u.href:''; } catch { return ''; } };
  function clean(value) {
    const doc = new DOMParser().parseFromString(String(value || ''), 'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,svg,math,form,input,button').forEach(n=>n.remove());
    const allowed = new Set(['P','BR','B','STRONG','I','EM','U','A','H2','H3','UL','OL','LI','BLOCKQUOTE','IMG','FIGURE','FIGCAPTION']);
    for (const n of [...doc.body.querySelectorAll('*')]) {
      if (!allowed.has(n.tagName)) { n.replaceWith(...n.childNodes); continue; }
      const old = Object.fromEntries([...n.attributes].map(a=>[a.name,a.value]));
      [...n.attributes].forEach(a=>n.removeAttribute(a.name));
      if(n.tagName==='A' && url(old.href)) {n.href=url(old.href);n.target='_blank';n.rel='noopener noreferrer';}
      if(n.tagName==='IMG') {
        const src=url(old.src); if(!src || !src.startsWith('https:')) {n.remove();continue;}
        n.src=src;n.alt=old.alt||'';
        if(['50','75','100'].includes(old['data-width'])) n.dataset.width=old['data-width'];
        if(['left','center','right'].includes(old['data-align'])) n.dataset.align=old['data-align'];
      }
    }
    return doc.body.innerHTML;
  }
  const html = value => /<[a-z][\s\S]*>/i.test(value || '') ? clean(value) : String(value || '').split(/\n{2,}/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
  function text(value) { const d=new DOMParser().parseFromString(html(value),'text/html'); return d.body.textContent.replace(/\s+/g,' ').trim(); }
  function mount(root, draft, options) {
    const {sb,memberId,author} = options;
    let images=[...(draft.images||[])].filter(url), cover=url(draft.image_url), range=null, selected=null, busy=false;
    root.innerHTML=`<div class="ag-compose-grid"><div><p class="ag-meta">O resumo é gerado automaticamente a partir do texto.</p><label>Texto</label>
    <div class="ag-compose-tools" hidden role="toolbar" aria-label="Formatação">${[['bold','Negrito'],['italic','Itálico'],['underline','Sublinhado'],['h2','Subtítulo'],['quote','Citação'],['ul','Lista'],['link','Link'],['unlink','Sem link'],['clear','Limpar']].map(([c,t])=>`<button type="button" class="btn o s" data-cmd="${c}" aria-label="${t}" title="${t}" ${['bold','italic','underline','ul'].includes(c)?'aria-pressed="false"':''}><span aria-hidden="true">${({bold:'<b>N</b>',italic:'<i>I</i>',underline:'<u>S</u>',h2:'H₂',quote:'“ ”',ul:'☷',link:'Link',unlink:'−Link',clear:'Tx'})[c]}</span></button>`).join('')}</div>
    <div class="ag-rich-text" contenteditable="true" role="textbox" aria-label="Texto da matéria" aria-multiline="true" spellcheck="true"></div>
    <button type="button" class="btn o s" data-select-image>Selecionar imagem no texto</button>
    <div class="ag-image-controls" hidden><label>Tamanho<select data-width><option value="50">Pequena (50%)</option><option value="75">Média (75%)</option><option value="100">Largura total</option></select></label><label>Alinhamento<select data-align><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label><label>Descrição da imagem<input data-alt></label><div class="ag-btns l">${[['up','↑ Mover acima'],['down','↓ Mover abaixo'],['remove','Remover do texto'],['close','Concluir']].map(([a,t])=>`<button type="button" class="btn o s" data-img="${a}">${t}</button>`).join('')}</div></div></div>
    <aside><label>Assinatura no site<input data-author maxlength="120" value="${esc(draft.author_name || author)}"></label><p class="ag-meta">Este nome aparece no site. O crédito interno pertence ao seu perfil.</p><label class="ag-chk"><input type="checkbox" data-featured ${draft.featured?'checked':''}> Destaque na capa</label><div data-cover></div><label>Imagens</label><input type="file" accept="image/*" multiple data-files hidden><button type="button" class="btn o" data-upload>Enviar imagens</button><div class="ag-compose-gallery"></div><p class="ag-meta">“Capa” define a imagem principal. “No texto” insere a imagem onde estiver o cursor.</p></aside></div><p class="ag-compose-status" role="status"></p>`;
    const $=s=>root.querySelector(s), editor=$('.ag-rich-text'), status=$('.ag-compose-status'), controls=$('.ag-image-controls');
    editor.innerHTML=html(draft.body);
    const tools = $('.ag-compose-tools'), viewport = window.visualViewport;
    const mobile = matchMedia('(max-width:900px)'), controller = new AbortController();
    let frame = 0, revealCaret = false;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(positionTools); };
    function positionTools() {
      frame = 0;
      const active = root.isConnected && (editor.contains(document.activeElement) || tools.contains(document.activeElement));
      tools.hidden = !active;
      tools.classList.toggle('is-keyboard-toolbar', active && mobile.matches);
      if (!active || !mobile.matches) { tools.style.removeProperty('top'); return; }
      const bottom = (viewport?.offsetTop || 0) + (viewport?.height || innerHeight);
      tools.style.top = `${Math.max(viewport?.offsetTop || 0, bottom - tools.offsetHeight)}px`;
      const selection = getSelection();
      if (revealCaret && selection.rangeCount && editor.contains(selection.focusNode)) {
        const caret = selection.getRangeAt(0).cloneRange(); caret.collapse(false);
        const rect = caret.getBoundingClientRect(), toolbarTop = tools.getBoundingClientRect().top;
        const scroller = root.closest('.ag-article-editor');
        if (scroller && rect.height && rect.bottom > toolbarTop - 12) scroller.scrollTop += rect.bottom - toolbarTop + 12;
      }
      revealCaret = false;
    }
    const reveal = () => { revealCaret = true; schedule(); };
    editor.addEventListener('focus', reveal);
    document.addEventListener('focusin', schedule, {signal:controller.signal});
    document.addEventListener('focusout', schedule, {signal:controller.signal});
    window.addEventListener('resize', schedule, {signal:controller.signal});
    viewport?.addEventListener('resize', reveal, {signal:controller.signal});
    viewport?.addEventListener('scroll', schedule, {signal:controller.signal});
    editor.addEventListener('input', reveal);
    editor.addEventListener('keyup', reveal);
    const destroy = () => { controller.abort(); cancelAnimationFrame(frame); tools.hidden = true; };
    const remember=()=>{const s=getSelection();if(s.rangeCount && editor.contains(s.anchorNode))range=s.getRangeAt(0).cloneRange();};
    editor.addEventListener('keyup',remember);editor.addEventListener('mouseup',remember);editor.addEventListener('touchend',remember);editor.addEventListener('input',remember);editor.addEventListener('blur',remember);
    function restore(){editor.focus({preventScroll:true});const s=getSelection();if(!range||!editor.contains(range.commonAncestorContainer)){range=document.createRange();range.selectNodeContents(editor);range.collapse(false);}s.removeAllRanges();s.addRange(range);}
    function syncButtons() {
      if (!editor.contains(document.activeElement)) return;
      for (const cmd of ['bold','italic','underline','ul']) {
        tools.querySelector(`[data-cmd="${cmd}"]`).setAttribute('aria-pressed', String(document.queryCommandState(cmd === 'ul' ? 'insertUnorderedList' : cmd)));
      }
    }
    function format(c) {
      if (!c) return;
      const toggle = ['bold','italic','underline','ul'].includes(c);
      const btn = toggle ? tools.querySelector(`[data-cmd="${c}"]`) : null;
      const before = btn ? btn.getAttribute('aria-pressed') === 'true' : false;
      restore();
      if(toggle) {
        const nativeCmd = c === 'ul' ? 'insertUnorderedList' : c;
        // restore() pode zerar o estilo "pendente" do cursor; só alterna se o estado atual ainda é o de antes do clique
        if (document.queryCommandState(nativeCmd) === before) document.execCommand(nativeCmd, false);
        remember(); syncButtons(); schedule(); return;
      }
      if(c==='link') { let u=prompt('Endereço do link (https://…)'); if(!u)return; if(!/^https?:/i.test(u))u='https://'+u; if(!url(u))return; restore(); document.execCommand('createLink',false,url(u)); }
      else if(c==='h2'||c==='quote') document.execCommand('formatBlock',false,c==='h2'?'h2':'blockquote');
      else document.execCommand(({ul:'insertUnorderedList',clear:'removeFormat'})[c]||c,false);
      remember(); syncButtons(); schedule();
    }
    document.addEventListener('selectionchange', () => { remember(); syncButtons(); }, {signal:controller.signal});
    let gesture = null, lastPointerAction = 0;
    tools.onmousedown=e=>{if(e.target.closest('button'))e.preventDefault();};
    tools.onpointerdown=e=>{
      const button=e.target.closest('[data-cmd]'); if(!button || e.isPrimary===false || e.button>0)return;
      remember(); gesture={id:e.pointerId,x:e.clientX,y:e.clientY,button,moved:false};
      if(e.pointerType==='mouse')e.preventDefault();
    };
    tools.onpointermove=e=>{if(gesture && e.pointerId===gesture.id && Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8)gesture.moved=true;};
    tools.onpointercancel=()=>{gesture=null;lastPointerAction=performance.now();};
    tools.onpointerup=e=>{
      const tap=gesture; gesture=null;
      if(!tap || tap.id!==e.pointerId)return;
      lastPointerAction=performance.now();
      if(tap.moved || e.target.closest('[data-cmd]')!==tap.button)return;
      e.preventDefault(); format(tap.button.dataset.cmd);
    };
    tools.onclick=e=>{
      const button=e.target.closest('[data-cmd]');if(!button)return;
      e.preventDefault();
      if(e.detail!==0 && performance.now()-lastPointerAction<700)return;
      format(button.dataset.cmd);
    };
    editor.addEventListener('paste',e=>{e.preventDefault();const data=e.clipboardData;restore();document.execCommand('insertHTML',false,data.getData('text/html')?clean(data.getData('text/html')):html(data.getData('text/plain')));remember();});
    editor.addEventListener('drop',e=>e.preventDefault());
    function select(image){selected?.removeAttribute('data-selected');selected=image;controls.hidden=!image;if(image){image.dataset.selected='true';$('select[data-width]').value=image.dataset.width||'100';$('select[data-align]').value=image.dataset.align||'center';$('[data-alt]').value=image.alt;}}
    editor.onclick=e=>select(e.target.closest('img'));
    $('[data-select-image]').onclick=()=>{const imgs=[...editor.querySelectorAll('img')];if(!imgs.length){status.textContent='Adicione uma imagem no texto primeiro.';return;}select(imgs[(imgs.indexOf(selected)+1)%imgs.length]);};
    $('select[data-width]').onchange=e=>{if(selected)selected.dataset.width=e.target.value;};$('select[data-align]').onchange=e=>{if(selected)selected.dataset.align=e.target.value;};$('[data-alt]').oninput=e=>{if(selected)selected.alt=e.target.value;};
    controls.onclick=e=>{const a=e.target.closest('[data-img]')?.dataset.img;if(!a||!selected)return;if(a==='close'){select(null);return;}if(a==='remove'){selected.remove();select(null);return;}let block=selected;while(block.parentNode!==editor)block=block.parentNode;const neighbor=a==='up'?block.previousSibling:block.nextSibling;if(neighbor)editor.insertBefore(block,a==='up'?neighbor:neighbor.nextSibling);};
    const gallery=()=>{$('.ag-compose-gallery').innerHTML=images.map((u,i)=>`<div><img src="${esc(u)}" alt="Imagem enviada"><div class="ag-btns l"><button type="button" class="btn o s" data-cover-index="${i}">${u===cover?'✓ Capa':'Capa'}</button><button type="button" class="btn o s" data-insert="${i}">No texto</button><button type="button" class="btn o s" data-remove="${i}">Excluir</button></div></div>`).join('');$('[data-cover]').innerHTML=cover?`<label>Capa da notícia</label><img src="${esc(cover)}" alt="Prévia da capa"><button type="button" class="btn o s" data-crop-cover>Ajustar capa</button>`:'';};
    const setBusy=value=>{busy=value;root.querySelectorAll('[data-upload],[data-crop-cover]').forEach(b=>b.disabled=value);};
    async function upload(blob){const path=`agency/${memberId}/news/${crypto.randomUUID()}.jpg`;const r=await sb.storage.from('images').upload(path,blob,{contentType:'image/jpeg'});if(r.error)throw new Error('Não foi possível enviar a imagem. Verifique sua conexão e permissão.');return sb.storage.from('images').getPublicUrl(path).data.publicUrl;}
    async function crop(file){return FFCCrop.cropImage(file,{aspect:16/9,max:1600,title:'Recortar imagem',choices:[['16:9',16/9],['4:3',4/3],['1:1',1],['Original',0]]});}
    $('[data-upload]').onclick=()=> $('[data-files]').click();
    $('[data-files]').onchange=async e=>{setBusy(true);try{for(const f of e.target.files){status.textContent='Preparando imagem…';const blob=await crop(f);if(!root.isConnected)break;if(!blob)continue;const u=await upload(blob);images.push(u);if(!cover)cover=u;gallery();}status.textContent='Imagens prontas. Salve a matéria para guardar as alterações.';}catch(err){status.textContent=err.message;}finally{e.target.value='';setBusy(false);}};
    root.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-cover-index')){cover=images[+b.dataset.coverIndex];gallery();}if(b.hasAttribute('data-insert')){restore();document.execCommand('insertHTML',false,`<img src="${esc(images[+b.dataset.insert])}" alt="" data-width="100" data-align="center"><p><br></p>`);remember();}if(b.hasAttribute('data-remove')){const removed=images.splice(+b.dataset.remove,1)[0];if(cover===removed)cover=images[0]||'';gallery();}if(b.hasAttribute('data-crop-cover')&&!busy){setBusy(true);try{const r=await fetch(cover);if(!r.ok)throw new Error('Não foi possível abrir a capa.');const blob=await crop(await r.blob());if(blob&&root.isConnected){cover=await upload(blob);images.push(cover);gallery();}}catch(err){status.textContent=err.message;}finally{setBusy(false);}}});
    gallery();
    return {destroy,get busy(){return busy;},value:()=>({body:clean(editor.innerHTML),images,image_url:cover||null,author_name:$('[data-author]').value.trim(),featured:$('[data-featured]').checked})};
  }
  window.FFCDraftEditor={mount,html,clean,text};
})();
