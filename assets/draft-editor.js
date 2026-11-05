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
    <div class="ag-compose-tools" role="toolbar" aria-label="Formatação">${[['bold','Negrito'],['italic','Itálico'],['underline','Sublinhado'],['h2','Subtítulo'],['quote','Citação'],['ul','Lista'],['link','Link'],['unlink','Sem link'],['clear','Limpar']].map(([c,t])=>`<button type="button" class="btn o s" data-cmd="${c}">${t}</button>`).join('')}</div>
    <div class="ag-rich-text" contenteditable="true" role="textbox" aria-label="Texto da matéria" aria-multiline="true" spellcheck="true"></div>
    <button type="button" class="btn o s" data-select-image>Selecionar imagem no texto</button>
    <div class="ag-image-controls" hidden><label>Tamanho<select data-width><option value="50">Pequena (50%)</option><option value="75">Média (75%)</option><option value="100">Largura total</option></select></label><label>Alinhamento<select data-align><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label><label>Descrição da imagem<input data-alt></label><div class="ag-btns l">${[['up','↑ Mover acima'],['down','↓ Mover abaixo'],['remove','Remover do texto'],['close','Concluir']].map(([a,t])=>`<button type="button" class="btn o s" data-img="${a}">${t}</button>`).join('')}</div></div></div>
    <aside><label>Autor<input data-author maxlength="120" value="${esc(draft.author_name || author)}"></label><label class="ag-chk"><input type="checkbox" data-featured ${draft.featured?'checked':''}> Destaque na capa</label><div data-cover></div><label>Imagens</label><input type="file" accept="image/*" multiple data-files hidden><button type="button" class="btn o" data-upload>Enviar imagens</button><div class="ag-compose-gallery"></div><p class="ag-meta">“Capa” define a imagem principal. “No texto” insere a imagem onde estiver o cursor.</p></aside></div><p class="ag-compose-status" role="status"></p>`;
    const $=s=>root.querySelector(s), editor=$('.ag-rich-text'), status=$('.ag-compose-status'), controls=$('.ag-image-controls');
    editor.innerHTML=html(draft.body);
    const remember=()=>{const s=getSelection();if(s.rangeCount && editor.contains(s.anchorNode))range=s.getRangeAt(0).cloneRange();};
    editor.addEventListener('keyup',remember);editor.addEventListener('mouseup',remember);editor.addEventListener('touchend',remember);editor.addEventListener('input',remember);editor.addEventListener('blur',remember);
    function restore(){editor.focus({preventScroll:true});const s=getSelection();if(!range||!editor.contains(range.commonAncestorContainer)){range=document.createRange();range.selectNodeContents(editor);range.collapse(false);}s.removeAllRanges();s.addRange(range);}
    $('.ag-compose-tools').onpointerdown=e=>{if(e.target.closest('button')){remember();e.preventDefault();}};
    $('.ag-compose-tools').onclick=e=>{const c=e.target.closest('[data-cmd]')?.dataset.cmd;if(!c)return;restore();if(c==='link'){let u=prompt('Endereço do link (https://…)');if(!u)return;if(!/^https?:/i.test(u))u='https://'+u;if(!url(u))return;document.execCommand('createLink',false,url(u));}else if(c==='h2'||c==='quote')document.execCommand('formatBlock',false,c==='h2'?'h2':'blockquote');else document.execCommand(({ul:'insertUnorderedList',clear:'removeFormat'})[c]||c,false);remember();};
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
    return {get busy(){return busy;},value:()=>({body:clean(editor.innerHTML),images,image_url:cover||null,author_name:$('[data-author]').value.trim(),featured:$('[data-featured]').checked})};
  }
  window.FFCDraftEditor={mount,html,clean,text};
})();
