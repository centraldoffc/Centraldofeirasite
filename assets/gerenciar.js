
  const sb = supabase.createClient(FFC_SUPABASE_URL, FFC_SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let articleCredits = [], editorialMembers = [], creditsError = false;
  let arts = [], cur = null, imgs = [], cover = '', filt = 'all', range = null;

  const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); };
  const ago = d => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });

  /* login */
  async function login(e){ e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: $('em').value, password: $('pw').value });
    $('lerr').textContent = error ? 'E-mail ou senha incorretos.' : ''; return false; }
  sb.auth.onAuthStateChange((_, s) => { $('login').hidden = !!s; $('app').hidden = !s; if (s) { $('user-email').textContent = s.user?.email || 'Painel editorial'; $('user-initials').textContent = (s.user?.email || 'CF').slice(0,2).toUpperCase(); load(); setTimeout(checkAdmin, 0); } });
  async function checkAdmin(){ const { data, error } = await sb.rpc('is_admin'); if (!error && data === false){ await sb.auth.signOut(); $('lerr').textContent = 'Esta conta não tem permissão de administrador. Entre com a conta do painel.'; } }
  sb.auth.getSession().then(({ data }) => { if (!data.session) $('login').hidden = false; });

  /* telas */
  function show(v){
    ['dash','list','edit','links','profile'].forEach(x => $('v-' + x).hidden = x !== v);
    document.querySelectorAll('aside .nav[data-v]').forEach(b => { b.classList.toggle('on', b.dataset.v === v); if (b.dataset.v === v) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    setMenu(false);
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('aside .nav[data-v]').forEach(b => b.onclick = () => b.dataset.v === 'edit' ? newArt() : show(b.dataset.v));

  async function load(){
    const { data, error } = await sb.from('articles').select('*').order('created_at', { ascending: false });
    if (error) return toast('Erro ao carregar as notícias');
    arts = data || [];
    const [credits, members] = await Promise.all([sb.from('article_credits').select('*'), sb.from('agency_members').select('id,code,name')]);
    articleCredits = credits.data || []; editorialMembers = members.data || []; creditsError = !!credits.error;
    draw(); loadBio();
  }

  const item = a => `<div class="it"><div class="th" style="${a.image_url ? `background-image:url('${esc(a.image_url)}')` : ''}"></div>
    <div class="tx"><b>${esc(a.title)}</b><small><span class="badge ${a.published ? '' : 'd'}">${a.published ? 'Publicada' : 'Rascunho'}</span>${a.featured ? '<span class="badge f">Destaque</span>' : ''}${ago(a.created_at)}</small></div>
    <div class="acts"><button class="btn o s" onclick="edit('${a.id}')">Editar</button>
      <button class="btn o s" onclick="toggle('${a.id}','published')">${a.published ? 'Despublicar' : 'Publicar'}</button>
      <button class="btn o s" onclick="toggle('${a.id}','featured')">${a.featured ? 'Tirar destaque' : 'Destacar'}</button>
      <button class="btn r s" onclick="del('${a.id}')">Excluir</button></div></div>`;

  function draw(){
    const pub = arts.filter(a => a.published).length;
    $('stats').innerHTML = [['Total de notícias', arts.length, 'hl'], ['Publicadas', pub, ''], ['Rascunhos', arts.length - pub, ''], ['Em destaque', arts.filter(a => a.featured).length, '']]
      .map(([l, n, c]) => `<div class="st ${c}"><span class="stat-arrow" aria-hidden="true"><svg class="icon"><use href="#i-out"/></svg></span><small>${l}</small><b>${n}</b><div class="stat-note">${['Todo o seu conteúdo','Disponíveis no site','Prontas para continuar','Na capa do site'][['Total de notícias','Publicadas','Rascunhos','Em destaque'].indexOf(l)]}</div></div>`).join('');
    $('nav-count').textContent = arts.length;
    const percent = arts.length ? Math.round(pub / arts.length * 100) : 0;
    $('publication-percent').textContent = percent + '%';
    $('publication-ring').style.setProperty('--progress', percent + '%');
    $('draft-note').textContent = arts.length - pub ? `${arts.length - pub} rascunho(s) esperando o seu próximo passo.` : 'Leve as novidades do Feira à torcida.';
    document.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === filt)));
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const cnt = days.map(d => arts.filter(a => new Date(a.created_at).toDateString() === d.toDateString()).length), mx = Math.max(1, ...cnt);
    $('bars').innerHTML = days.map((d, i) => `<div class="bar" data-empty="${cnt[i] === 0}" title="${d.toLocaleDateString('pt-BR')}: ${cnt[i]} notícia(s)">${cnt[i]}<i style="height:${6 + cnt[i] / mx * 84}%"></i>${d.toLocaleDateString('pt-BR', { weekday:'short' }).slice(0, 3)}</div>`).join('');
    $('recent').innerHTML = arts.slice(0, 4).map(item).join('') || '<p style="color:var(--dim)">Nenhuma notícia ainda. Clique em “Nova notícia”.</p>';
    const q = $('q').value.toLowerCase();
    const l = arts.filter(a => (filt === 'all' || (filt === 'pub') === a.published) && a.title.toLowerCase().includes(q));
    $('all').innerHTML = l.map(item).join('') || '<p style="color:var(--dim)">Nada encontrado.</p>';
    $('cnt').textContent = `${l.length} de ${arts.length} notícias`;
  }
  /* links da bio */
  let links = [], lcur = null, licon = '', prof = null, socs = [], pav = '';
  async function loadBio(){
    const [l, p, so] = await Promise.all([sb.from('links').select('*').order('position'), sb.from('profile').select('*').eq('id', 1).maybeSingle(), sb.from('socials').select('*').order('position')]);
    links = l.data || []; prof = p.data; socs = so.data || []; drawLinks(); drawProfile();
  }
  function drawLinks(){
    $('llist').innerHTML = links.map((a, i) => `<div class="it"><div class="th" style="${a.icon_url ? `background-image:url('${esc(a.icon_url)}')` : ''}"></div>
      <div class="tx"><b>${esc(a.title)}</b><small><span class="badge ${a.active ? '' : 'd'}">${a.active ? 'Ativo' : 'Oculto'}</span><span class="badge d">${esc(a.group_name)}</span>${esc(a.url)}</small></div>
      <div class="acts"><button class="btn o s" ${i ? '' : 'disabled'} onclick="moveLink(${i},-1)">↑</button><button class="btn o s" ${i < links.length - 1 ? '' : 'disabled'} onclick="moveLink(${i},1)">↓</button>
        <button class="btn o s" onclick="editLink('${a.id}')">Editar</button>
        <button class="btn o s" onclick="toggleLink('${a.id}')">${a.active ? 'Ocultar' : 'Mostrar'}</button>
        <button class="btn r s" onclick="delLink('${a.id}')">Excluir</button></div></div>`).join('') || '<p style="color:var(--dim)">Nenhum link ainda.</p>';
  }
  function editLink(id){
    lcur = links.find(a => a.id === id) || null; const a = lcur || { title:'', desc_text:'', url:'', group_name:'Links', active:true, icon_url:'' };
    $('lfT').textContent = lcur ? 'Editar link' : 'Novo link'; $('lt').value = a.title; $('ld').value = a.desc_text; $('lu').value = a.url; $('lg').value = a.group_name; $('la').checked = a.active;
    licon = a.icon_url || ''; $('lprev').style.backgroundImage = licon ? `url('${licon}')` : ''; $('lform').hidden = false; show('links'); $('lform').scrollIntoView({ behavior:'smooth' });
  }
  async function saveLink(){
    const t = $('lt').value.trim(), u = $('lu').value.trim(); if (!t || !u) return toast('Preencha título e endereço');
    const p = { title: t, desc_text: $('ld').value.trim(), url: /^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u, group_name: $('lg').value.trim() || 'Links', active: $('la').checked, icon_url: licon || null };
    const { error } = lcur ? await sb.from('links').update(p).eq('id', lcur.id) : await sb.from('links').insert({ ...p, position: Math.max(0, ...links.map(a => a.position)) + 1 });
    if (error) return toast('Erro: ' + error.message); $('lform').hidden = true; toast('Link salvo'); loadBio();
  }
  async function toggleLink(id){ const a = links.find(x => x.id === id); const { error } = await sb.from('links').update({ active: !a.active }).eq('id', id); error ? toast('Erro ao alterar') : loadBio(); }
  async function delLink(id){ if (!confirm('Excluir este link?')) return; const { error } = await sb.from('links').delete().eq('id', id); error ? toast('Erro ao excluir') : loadBio(); }
  async function moveLink(i, d){
    const a = links[i], b = links[i + d]; if (!b) return;
    const r = await Promise.all([sb.from('links').update({ position: b.position }).eq('id', a.id), sb.from('links').update({ position: a.position }).eq('id', b.id)]);
    if (a.position === b.position) await sb.from('links').update({ position: a.position + d }).eq('id', a.id);
    r.some(x => x.error) ? toast('Erro ao mover') : loadBio();
  }
  const upErr = e => /row-level|security|policy|403|unauthor/i.test((e && (e.message || e.error || e.statusCode)) + '') ? 'Sem permissão para enviar imagens. Entre com a conta de administrador.' : 'Falha ao enviar a imagem' + (e && e.message ? ': ' + e.message : '');
  async function up(f, folder, max, title){
    const blob = await cropImage(f, { aspect: 1, max, title: title || 'Recortar imagem' }); if (!blob) return '';
    const path = `${folder}/${Date.now()}.jpg`, { error } = await sb.storage.from('images').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) { toast(upErr(error)); return ''; } return sb.storage.from('images').getPublicUrl(path).data.publicUrl;
  }
  $('lfile').onchange = async e => { const f = e.target.files[0]; if (!f) return; const u = await up(f, 'icons', 512, 'Recortar ícone'); if (u){ licon = u; $('lprev').style.backgroundImage = `url('${u}')`; } e.target.value = ''; };

  /* perfil e redes */
  function drawProfile(){
    if (prof){ $('ph').value = prof.handle; $('pb').value = prof.bio; pav = prof.avatar_url || ''; $('pprev').style.backgroundImage = pav ? `url('${pav}')` : ''; }
    $('slist').innerHTML = socs.map(a => `<div class="it"><div class="tx"><b>${a.type === 'x' ? 'X' : 'Instagram'}</b><small>${esc(a.url)}</small></div><button class="btn r s" onclick="delSocial('${a.id}')">Remover</button></div>`).join('') || '<p style="color:var(--dim)">Nenhuma rede ainda.</p>';
  }
  async function saveProfile(){
    const { error } = await sb.from('profile').update({ handle: $('ph').value.trim(), bio: $('pb').value.trim(), avatar_url: pav || null, updated_at: new Date().toISOString() }).eq('id', 1);
    error ? toast('Erro: ' + error.message) : toast('Perfil salvo');
  }
  $('pfile').onchange = async e => { const f = e.target.files[0]; if (!f) return; const u = await up(f, 'avatar', 512, 'Recortar foto'); if (u){ pav = u; $('pprev').style.backgroundImage = `url('${u}')`; } e.target.value = ''; };
  async function addSocial(){
    let u = $('surl').value.trim(); if (!u) return toast('Cole o endereço da rede'); if (!/^https?:/i.test(u)) u = 'https://' + u;
    const { error } = await sb.from('socials').insert({ type: $('stype').value, url: u, position: Math.max(0, ...socs.map(a => a.position)) + 1 });
    error ? toast('Erro: ' + error.message) : ($('surl').value = '', loadBio());
  }
  async function delSocial(id){ if (!confirm('Remover esta rede?')) return; const { error } = await sb.from('socials').delete().eq('id', id); error ? toast('Erro ao remover') : loadBio(); }

  $('q').oninput = () => { $('global-search').value = $('q').value; draw(); };
  document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filt = b.dataset.f; draw(); });

  async function toggle(id, k){ const a = arts.find(x => x.id === id);
    const now = new Date().toISOString();
    const changes = { [k]: !a[k], updated_at: now };
    if (k === 'published' && !a.published) changes.created_at = now;
    const { error } = await sb.from('articles').update(changes).eq('id', id);
    error ? toast('Não foi possível alterar') : (a[k] = !a[k], draw()); }
  async function del(id){ if (!confirm('Excluir esta notícia para sempre?')) return;
    const { error } = await sb.from('articles').delete().eq('id', id);
    error ? toast('Não foi possível excluir') : (arts = arts.filter(x => x.id !== id), draw(), toast('Notícia excluída')); }

  /* editor */
  function newArt(){ cur = null; fill({ title:'', summary:'', content:'', images:[], image_url:'', published:false, featured:false, author:'Redação Central do FFC' }); $('etitle').textContent = 'Nova notícia'; }
  function edit(id){ cur = arts.find(a => a.id === id); fill(cur); $('etitle').textContent = 'Editar notícia'; }
  function fill(a){
    coverEditorVersion++;
    FFCImageEditor.reset(); range = null;
    $('t').value = a.title; $('au').value = a.author || '';
    $('body').innerHTML = /<[a-z][\s\S]*>/i.test(a.content || '') ? a.content : (a.content || '').split(/\n{2,}/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
    imgs = [...(a.images || [])]; cover = a.image_url || ''; $('pub').checked = a.published; $('ft').checked = a.featured;
    gal(); show('edit');
  }
  const slug = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) + '-' + Math.random().toString(36).slice(2, 6);

  async function save(publish){
    if (coverBusy) return toast('Aguarde o ajuste da capa terminar.');
    const title = $('t').value.trim(); if (!title) return toast('Escreva um título');
    const content = FFCImageEditor.content();
    const p = { title, summary: FFCArticle.summary(content, title), content, author: $('au').value.trim() || 'Redação Central do FFC',
      images: imgs, image_url: cover || null, featured: $('ft').checked, published: publish ? true : $('pub').checked,
      updated_at: new Date().toISOString() };
    if (cur && !cur.published && p.published) p.created_at = p.updated_at;
    const q = cur ? sb.from('articles').update(p).eq('id', cur.id) : sb.from('articles').insert({ ...p, slug: slug(title) });
    const { error } = await q;
    if (error) return toast('Erro ao salvar: ' + error.message);
    toast(p.published ? 'Notícia publicada' : 'Salvo como rascunho'); await load(); show('list');
  }

  document.querySelector('.tb').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const c = b.dataset.c; $('body').focus({ preventScroll: true });
    if (range && $('body').contains(range.commonAncestorContainer)){ const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); }
    if (c === 'link'){ let u = prompt('Endereço do link (ex.: https://...)'); if (!u) return; if (!/^(https?:|mailto:)/i.test(u)) u = 'https://' + u; document.execCommand('createLink', false, u); }
    else if (c === 'h2') document.execCommand('formatBlock', false, 'h2');
    else if (c === 'quote') document.execCommand('formatBlock', false, 'blockquote');
    else if (c === 'ul') document.execCommand('insertUnorderedList');
    else if (c === 'clear'){ document.execCommand('removeFormat'); document.execCommand('formatBlock', false, 'p'); }
    else document.execCommand(c);
  });
  document.addEventListener('selectionchange', () => { const s = getSelection(); if (s.rangeCount && $('body').contains(s.anchorNode)) range = s.getRangeAt(0); });

  let coverBusy = false, coverEditorVersion = 0;
  /* imagens */
  function gal(){
    const currentCover = cover || '';
    $('cover-editor').hidden = !currentCover;
    if (currentCover) $('cover-preview').src = currentCover;
    else $('cover-preview').removeAttribute('src');
    $('edit-cover').disabled = coverBusy; $('upload-cover').disabled = coverBusy; $('remove-cover').disabled = coverBusy;
    $('gal').innerHTML = imgs.map((u, i) => `<div class="gi ${u === cover ? 'cv' : ''}"><img src="${esc(u)}" alt=""><div><button onclick="inText(${i})">No texto</button><button onclick="rmImg(${i})">✕</button></div></div>`).join('');
  }
  async function editCover(){
    const source = cover;
    if (!source || coverBusy) return;
    const version = coverEditorVersion;
    coverBusy = true; gal();
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('Não foi possível carregar a capa.');
      const file = await response.blob();
      if (version !== coverEditorVersion) return;
      const blob = await cropImage(file, {aspect:9/10, max:1600, title:'Ajustar capa', coverTitle:$('t').value});
      if (!blob || version !== coverEditorVersion) return;
      const path = `news/cover-${crypto.randomUUID()}.jpg`;
      const { error } = await sb.storage.from('images').upload(path, blob, {contentType:'image/jpeg'});
      if (error) throw error;
      if (version !== coverEditorVersion) return;
      cover = sb.storage.from('images').getPublicUrl(path).data.publicUrl;

      toast('Capa ajustada. Salve a notícia para aplicar.');
    } catch (error) { toast(upErr(error)); }
    finally { coverBusy = false; gal(); }
  }
  function removeCover(){ if(coverBusy)return;cover='';gal(); }
  async function uploadCover(file){
    if(!file || coverBusy)return;const version=coverEditorVersion;coverBusy=true;gal();
    try { const blob=await cropImage(file,{aspect:9/10,max:1600,title:'Selecionar capa',coverTitle:$('t').value});
      if(!blob || version!==coverEditorVersion)return;
      const path=`news/cover-${crypto.randomUUID()}.jpg`;const {error}=await sb.storage.from('images').upload(path,blob,{contentType:'image/jpeg'});if(error)throw error;
      if(version===coverEditorVersion){cover=sb.storage.from('images').getPublicUrl(path).data.publicUrl;toast('Capa selecionada. Salve a notícia para aplicar.');}
    }catch(error){toast(upErr(error));}finally{coverBusy=false;gal();$('cover-file').value='';}
  }
  $('cover-file').onchange=e=>uploadCover(e.target.files[0]);
  const rmImg = i => { imgs.splice(i, 1); gal(); };
  function inText(i){
    const b = $('body'); b.focus();
    if (range && b.contains(range.commonAncestorContainer)){ const s = getSelection(); s.removeAllRanges(); s.addRange(range); } else { const r = document.createRange(); r.selectNodeContents(b); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    document.execCommand('insertHTML', false, `<img src="${esc(imgs[i])}" alt=""><p><br></p>`);
  }
  const cropImage = (...args) => FFCCrop.cropImage(...args);
  $('file').onchange = async e => {
    const fs = [...e.target.files]; if (!fs.length) return; toast('Enviando ' + fs.length + ' imagem(ns)…');
    for (const [i, f] of fs.entries()){
      try { const path = `news/${Date.now()}-${i}.jpg`;
        const blob = await cropImage(f, { aspect: 16 / 9, max: 1600, title: fs.length > 1 ? `Recortar imagem (${i + 1} de ${fs.length})` : 'Recortar imagem', choices: [['16:9', 16 / 9], ['4:3', 4 / 3], ['1:1', 1], ['Original', 0]] });
        if (!blob) continue;
        const { error } = await sb.storage.from('images').upload(path, blob, { contentType: 'image/jpeg' });
        if (error) throw error; imgs.push(sb.storage.from('images').getPublicUrl(path).data.publicUrl);
      } catch (err) { toast(upErr(err)); }
    }
    gal(); e.target.value = '';
  };

function setMenu(open){
  $('app').classList.toggle('menu-open',open);
  document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(open));
  if(open)document.querySelector('.mobile-close').focus();
  else if ($('sidebar').contains(document.activeElement) && matchMedia('(max-width:900px)').matches) document.querySelector('.menu-toggle').focus();
}
$('global-search').addEventListener('input',e=>{ $('q').value=e.target.value; filt='all'; draw(); show('list'); });
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!$('app').hidden){e.preventDefault();$('global-search').focus();}
 if(e.key==='Escape')setMenu(false);
});
// Associate existing form labels without changing integration field IDs.
document.querySelectorAll('label').forEach(label=>{
 const control=label.nextElementSibling;
 if(control?.matches('input,textarea,select')&&control.id)label.htmlFor=control.id;
});
