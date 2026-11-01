/* layout responsivo das respostas (substitui estilos fixos que quebravam no celular) */
(function () {
  const st = document.createElement('style');
  st.textContent = `
  #fm-resp,#fm-resp .panel,#fm-resp .st{min-width:0}
  #fm-resp .top h1{overflow-wrap:anywhere}#fm-resp .top p{overflow-wrap:anywhere}
  #fm-resp .fm-stats3{grid-template-columns:repeat(3,minmax(0,1fr))}
  #fm-resp .fm-row{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
  #fm-resp .fm-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  #fm-resp .fm-tbl td{overflow-wrap:anywhere}
  #fm-resp .fm-tbl td:last-child,#fm-resp .fm-tbl th:last-child{white-space:nowrap}
  #fm-resp .fm-qa{overflow-wrap:anywhere}
  @media(max-width:900px){#fm-resp .fm-row{grid-template-columns:minmax(0,1fr)}}
  @media(max-width:700px){#fm-resp .fm-stats3{grid-template-columns:minmax(0,1fr)}#fm-resp .st{min-height:0}#fm-resp .top .acts{display:flex;flex-wrap:wrap;gap:8px}}
  `;
  document.head.appendChild(st);
})();
/* Aba "Formulários" do gerenciar. Usa sb, $, esc e toast de gerenciar.js. */
let fms = [], fmCounts = {}, fcur = null, fsteps = [];
const FM_TYPES = { text:'Texto curto', textarea:'Texto longo', email:'E-mail', tel:'Telefone', number:'Número', date:'Data', select:'Lista (escolher uma)', radio:'Opções (escolher uma)', checkbox:'Caixas (várias)' };
const fmUid = () => 'c' + Math.random().toString(36).slice(2, 8);
const fmSlug = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const fmUrl = s => `${location.origin}/formulario/${s}`;
const fmView = v => { ['list', 'edit', 'resp'].forEach(x => $('fm-' + x).hidden = x !== v); window.scrollTo(0, 0); };

/* integra com a navegação existente sem mexer em gerenciar.js */
const _show = show;
show = function (v) {
  $('v-forms').hidden = true; _show(v === 'forms' ? '__' : v);
  if (v === 'forms') {
    $('v-forms').hidden = false;
    document.querySelectorAll('aside .nav[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === 'forms'));
    fmView('list'); fmLoad();
  }
};

async function fmLoad() {
  const [f, r] = await Promise.all([sb.from('forms').select('*').order('created_at', { ascending: false }), sb.from('form_responses').select('form_id')]);
  if (f.error) return $('fm-items').innerHTML = '<p style="color:var(--dim)">Não foi possível carregar. Rode o arquivo formularios.sql no Supabase.</p>';
  fms = f.data || []; fmCounts = {}; (r.data || []).forEach(x => fmCounts[x.form_id] = (fmCounts[x.form_id] || 0) + 1);
  $('fm-items').innerHTML = fms.map(a => `<div class="fm-card"><div class="fm-n">${fmCounts[a.id] || 0}<small>respostas</small></div>
    <div class="tx"><b>${esc(a.title)}</b><small><span class="badge ${a.active ? '' : 'd'}">${a.active ? 'Aberto' : 'Encerrado'}</span> /formulario/${esc(a.slug)}</small></div>
    <div class="acts"><button class="btn g s" onclick="fmResp('${a.id}')">Ver respostas</button><button class="btn o s" onclick="fmCopy('${a.slug}')">Copiar link</button>
    <button class="btn o s" onclick="fmEdit('${a.id}')">Editar</button><button class="btn o s" onclick="fmToggle('${a.id}')">${a.active ? 'Encerrar' : 'Reabrir'}</button><button class="btn r s" onclick="fmDel('${a.id}')">Excluir</button></div></div>`).join('')
    || '<p style="color:var(--dim)">Nenhum formulário ainda. Clique em “Novo formulário”.</p>';
}
const fmCopy = s => navigator.clipboard.writeText(fmUrl(s)).then(() => toast('Link copiado'), () => prompt('Copie o link:', fmUrl(s)));
async function fmToggle(id) { const a = fms.find(x => x.id === id); const { error } = await sb.from('forms').update({ active: !a.active }).eq('id', id); error ? toast('Erro ao alterar') : fmLoad(); }
async function fmDel(id) { if (!confirm('Excluir este formulário e TODAS as respostas?')) return; const { error } = await sb.from('forms').delete().eq('id', id); error ? toast('Erro ao excluir') : (toast('Formulário excluído'), fmLoad()); }

/* construtor */
function fmEdit(id) {
  fcur = fms.find(a => a.id === id) || null;
  fsteps = JSON.parse(JSON.stringify(fcur?.steps || [{ title: 'Perguntas', fields: [{ id: fmUid(), label: '', type: 'text', required: false, options: [] }] }]));
  fmDraw(); fmView('edit');
}
function fmDraw() {
  const a = fcur || { title: '', description: '', slug: '', active: true };
  const hasOpt = t => ['select', 'radio', 'checkbox'].includes(t);
  $('fm-edit').innerHTML = `<div class="top"><div><h1>${fcur ? 'Editar formulário' : 'Novo formulário'}</h1><p>O nome e o e-mail de quem responde são pedidos automaticamente na 1ª etapa.</p></div>
    <div class="acts"><button class="btn o" onclick="fmView('list')">Cancelar</button><button class="btn g" onclick="fmSave()">Salvar</button></div></div>
    <div class="panel" style="margin-bottom:14px"><label>Título</label><input type="text" id="fm-t" value="${esc(a.title)}" maxlength="120">
      <label>Descrição (aparece no painel verde)</label><textarea id="fm-d" rows="2" maxlength="400">${esc(a.description)}</textarea>
      <label>Endereço do link</label><input type="text" id="fm-s" value="${esc(a.slug)}" placeholder="gerado a partir do título"></div>
    ${fsteps.map((s, i) => `<div class="fm-step"><div class="hd"><input type="text" value="${esc(s.title)}" placeholder="Nome da etapa" oninput="fsteps[${i}].title=this.value">
      <button class="btn o s" ${i ? '' : 'disabled'} onclick="fmMoveStep(${i},-1)">↑</button><button class="btn o s" ${i < fsteps.length - 1 ? '' : 'disabled'} onclick="fmMoveStep(${i},1)">↓</button>
      <button class="btn r s" onclick="fsteps.splice(${i},1);fmDraw()">Remover</button></div>
      ${s.fields.map((f, j) => `<div class="fm-field"><input type="text" placeholder="Pergunta" value="${esc(f.label)}" oninput="fsteps[${i}].fields[${j}].label=this.value">
        <select onchange="fsteps[${i}].fields[${j}].type=this.value;fmDraw()">${Object.entries(FM_TYPES).map(([k, n]) => `<option value="${k}" ${f.type === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <label class="chk"><input type="checkbox" ${f.required ? 'checked' : ''} onchange="fsteps[${i}].fields[${j}].required=this.checked">Obrigatória</label>
        <button class="btn r s" onclick="fsteps[${i}].fields.splice(${j},1);fmDraw()">✕</button>
        ${hasOpt(f.type) ? `<textarea placeholder="Uma opção por linha" oninput="fsteps[${i}].fields[${j}].options=this.value.split('\\n').map(x=>x.trim()).filter(Boolean)">${esc((f.options || []).join('\n'))}</textarea>` : ''}</div>`).join('')}
      <button class="btn o s" onclick="fsteps[${i}].fields.push({id:fmUid(),label:'',type:'text',required:false,options:[]});fmDraw()">+ Pergunta</button></div>`).join('')}
    <button class="btn o" onclick="fsteps.push({title:'Nova etapa',fields:[{id:fmUid(),label:'',type:'text',required:false,options:[]}]});fmDraw()">+ Nova etapa</button>`;
}
function fmMoveStep(i, d) { const [s] = fsteps.splice(i, 1); fsteps.splice(i + d, 0, s); fmDraw(); }
async function fmSave() {
  const title = $('fm-t').value.trim(); if (!title) return toast('Escreva um título');
  const steps = fsteps.map(s => ({ title: s.title.trim() || 'Etapa', fields: s.fields.filter(f => f.label.trim()).map(f => ({ ...f, label: f.label.trim() })) })).filter(s => s.fields.length);
  if (!steps.length) return toast('Adicione ao menos uma pergunta');
  if (steps.some(s => s.fields.some(f => ['select', 'radio', 'checkbox'].includes(f.type) && !(f.options || []).length))) return toast('Preencha as opções das perguntas de escolha');
  const slug = fmSlug($('fm-s').value) || fmSlug(title) + '-' + Math.random().toString(36).slice(2, 5);
  const p = { title, description: $('fm-d').value.trim(), slug, steps };
  const { error } = fcur ? await sb.from('forms').update(p).eq('id', fcur.id) : await sb.from('forms').insert(p);
  if (error) return toast(error.code === '23505' ? 'Esse endereço já existe' : 'Erro: ' + error.message);
  toast('Formulário salvo'); fmView('list'); fmLoad();
}

/* respostas */
let fresp = [];
async function fmResp(id) {
  const a = fms.find(x => x.id === id), { data, error } = await sb.from('form_responses').select('*').eq('form_id', id).order('created_at', { ascending: false });
  if (error) return toast('Erro ao carregar respostas'); fresp = data || [];
  const last = fresp[0] ? new Date(fresp[0].created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  $('fm-resp').innerHTML = `<div class="top"><div><h1>${esc(a.title)}</h1><p>/formulario/${esc(a.slug)}</p></div><div class="acts"><button class="btn o" onclick="fmView('list')">Voltar</button><button class="btn o" onclick="fmCopy('${a.slug}')">Copiar link</button><button class="btn g" onclick="fmCsv('${id}')">Baixar CSV</button></div></div>
    <div class="stats fm-stats3"><div class="st hl"><small>Pessoas que responderam</small><b>${fresp.length}</b></div><div class="st"><small>Última resposta</small><b style="font-size:20px;margin-top:22px">${last}</b></div><div class="st"><small>Situação</small><b style="font-size:24px;margin-top:20px">${a.active ? 'Aberto' : 'Encerrado'}</b></div></div>
    <div class="row fm-row"><div class="panel"><h3>Quem respondeu</h3>${fresp.length ? `<div class="fm-scroll"><table class="fm-tbl"><tr><th>Nome</th><th>E-mail</th><th>Data</th></tr>${fresp.map((r, i) => `<tr class="r" onclick="fmOne(${i})"><td><b>${esc(r.respondent_name)}</b></td><td>${esc(r.respondent_email) || '—'}</td><td>${new Date(r.created_at).toLocaleDateString('pt-BR')}</td></tr>`).join('')}</table></div>` : '<p style="color:var(--dim)">Ninguém respondeu ainda. Copie o link e compartilhe.</p>'}</div>
    <div class="panel" id="fm-one"><h3>Resposta</h3><p style="color:var(--dim)">Clique em uma pessoa para ver o que ela respondeu.</p></div></div>`;
  fmView('resp');
}
function fmOne(i) {
  const r = fresp[i], v = x => Array.isArray(x) ? x.join(', ') : x;
  $('fm-one').innerHTML = `<h3>${esc(r.respondent_name)}</h3><small style="color:var(--dim)">${esc(r.respondent_email) || 'sem e-mail'} · ${new Date(r.created_at).toLocaleString('pt-BR')}</small>
    ${(r.answers || []).map(a => `<div class="fm-qa"><small>${esc(a.label)}</small>${esc(v(a.value))}</div>`).join('') || '<p style="color:var(--dim)">Sem respostas às perguntas.</p>'}
    <div class="acts" style="margin-top:14px;justify-content:flex-start"><button class="btn r s" onclick="fmDelResp('${r.id}','${r.form_id}')">Excluir esta resposta</button></div>`;
}
async function fmDelResp(id, fid) { if (!confirm('Excluir esta resposta?')) return; const { error } = await sb.from('form_responses').delete().eq('id', id); error ? toast('Erro ao excluir') : (toast('Resposta excluída'), await fmLoad(), fmResp(fid)); }
function fmCsv(id) {
  const a = fms.find(x => x.id === id), cols = [...new Set(fresp.flatMap(r => (r.answers || []).map(x => x.label)))];
  const c = s => `"${String(s ?? '').replace(/"/g, '""')}"`, v = x => Array.isArray(x) ? x.join('; ') : x;
  const rows = [['Nome', 'E-mail', 'Data', ...cols], ...fresp.map(r => [r.respondent_name, r.respondent_email, new Date(r.created_at).toLocaleString('pt-BR'), ...cols.map(k => v((r.answers || []).find(x => x.label === k)?.value))])];
  const u = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(c).join(',')).join('\n')], { type: 'text/csv' }));
  Object.assign(document.createElement('a'), { href: u, download: (a.slug || 'respostas') + '.csv' }).click(); URL.revokeObjectURL(u);
}
