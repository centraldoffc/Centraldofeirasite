/* Agência Central do FFC — módulo completo (usado por agencia.html e pelo menu "Agência" do gerenciar.html).
   Uso: AG.init({ sb, mount, onView, onBadges, onDenied }) e depois AG.go('inicio'). */
(function () {
  'use strict';
  const DOMAIN = 'membros.centraldoffc.app';
  const LV = { super: 'Super Administrador', lider: 'Líder', membro: 'Membro' };
  const ST = [['todo', 'A fazer'], ['doing', 'Fazendo'], ['review', 'Em revisão'], ['done', 'Entregue']];
  const PR = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
  const KINDS = { comemorativa: 'Data comemorativa', reuniao: 'Reunião', prazo: 'Prazo', outro: 'Outro' };
  const REQ = { corrigir: 'Corrigir uma informação', excluir: 'Excluir algo', ajuda: 'Pedir ajuda' };
  const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const COLORS = ['#1d754c', '#2f8f6b', '#103f2a', '#b8863b', '#5c65a0', '#bc4545', '#2d7f8f'];
  const TITLES = { inicio: 'Visão geral', avisos: 'Avisos', tarefas: 'Tarefas', calendario: 'Calendário', arquivos: 'Arquivos', chat: 'Conversas', equipe: 'Equipe', pedidos: 'Pedidos', atividade: 'Atividade', noticias: 'Notícias', modelos: 'Modelos de design', apuracao: 'Apuração' };
  const ICONS = {
    home: '<rect x="3.5" y="3.5" width="7" height="9" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="15.5" width="7" height="5" rx="2"/>',
    mega: '<path d="M4 10v4h3l7 4V6L7 10H4Z"/><path d="M17.5 9.5a4 4 0 0 1 0 5"/>',
    task: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    folder: '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.6l2 2.2H18a2.5 2.5 0 0 1 2.5 2.5V17a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17Z"/>',
    file: '<path d="M7 3.5h6.5l5 5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M13.5 3.5v5h5"/>',
    chat: '<path d="M5 18.5V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v6.5a2.5 2.5 0 0 1-2.5 2.5H8.5Z"/>',
    team: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3A6 6 0 0 1 21 20"/>',
    inbox: '<path d="M4 13.5 6.5 5.5h11l2.5 8V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    out: '<path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m14 7-5 5 5 5"/>', right: '<path d="m10 7 5 5-5 5"/>',
    cake: '<path d="M4 20h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7Z"/><path d="M4 16c2 1.5 3 1.5 4 0s2-1.5 4 0 3 1.5 4 0 2-1.5 4 0M12 11V7"/>',
    pin: '<path d="M9 4.5h6l-1 5 3 3H7l3-3Z"/><path d="M12 12.5V20"/>',
    send: '<path d="M20.5 4 3.5 11l6.5 2.5L12.5 20Z"/><path d="m10 13.5 4-4"/>',
    clip: '<path d="M15.5 7.5 9 14a2 2 0 0 0 2.8 2.8l7-7a4 4 0 0 0-5.6-5.6l-7 7a6 6 0 0 0 8.5 8.5l5.3-5.3"/>',
    trash: '<path d="M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7M10 11v5M14 11v5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    down: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    flag: '<path d="M6 21V4.5M6 5h11l-2.5 4L17 13H6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
    reply: '<path d="M10 7 4.5 12 10 17"/><path d="M5 12h9a5 5 0 0 1 5 5v1"/>',
    key: '<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8M15.5 7.5l2.5 2.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    news: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5Zm0 15A2.5 2.5 0 0 1 7.5 18H19v3H7.5"/><path d="M9 7.5h6M9 11h6"/>',
    layout: '<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M10 9.5V20"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
    radar: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 12l5.5-5.5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>'
  };
  const I = (n, s) => `<svg class="icon"${s ? ` style="width:${s}px;height:${s}px"` : ''} aria-hidden="true"><use href="#ag-${n}"/></svg>`;

  /* ---------- estado ---------- */
  let sb, mount, host = {}, layer, me = null, rt = null, token = 0, dbTimer = 0;
  const S = {
    view: 'inicio', arg: null, members: [], notices: [], tasks: [], events: [], notifs: [], chats: [], cmine: [], reqs: [], recent: [],
    tFilter: 'all', tStatus: 'todo', tQ: '', tCat: '', tMem: '', month: null, folder: null, fq: '', folders: [], files: [],
    drafts: [], tpls: [], mCat: '', mQ: '', isAdm: false,
    tg: [], agn: [], cl: [], igw: [], ap: { tab: 'painel', st: '', kind: '', tgt: '', mk: 'livres', q: '', nq: 'Feira FC', news: null, busy: false },
    chatId: null, msgs: [], reply: null, rFilter: 'aberto', aFilter: '', aMem: '', urls: {}, loadedAt: 0
  };

  /* ---------- utilidades ---------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = () => ds(new Date());
  const dmy = s => { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${+d} de ${MES[+m - 1]} de ${y}`; };
  const dm = s => { const [, m, d] = s.split('-'); return `${+d} de ${MES[+m - 1]}`; };
  const rel = d => { const m = Math.max(0, (Date.now() - new Date(d)) / 6e4); if (m < 1) return 'agora'; if (m < 60) return `há ${Math.floor(m)} min`; if (m < 1440) return `há ${Math.floor(m / 60)} h`; const k = Math.floor(m / 1440); return k < 30 ? `há ${k} dia${k > 1 ? 's' : ''}` : new Date(d).toLocaleDateString('pt-BR'); };
  const when = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const hhmm = d => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const first = n => String(n || '').split(' ')[0];
  const mem = id => S.members.find(m => m.id === id);
  const isLeader = () => !!me && (me.access_level === 'super' || me.access_level === 'lider');
  const norm = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const hasRole = k => !!me && (isLeader() || norm(me.role_title).includes(k));
  const isRedator = () => hasRole('redat'), isDesigner = () => hasRole('design');
  const canView = v => v === 'noticias' ? isRedator() : v === 'modelos' ? isDesigner() : v === 'atividade' ? isLeader() : true;
  const isSuper = () => !!me && me.access_level === 'super';
  const ini = n => { const w = String(n || '?').trim().split(/\s+/); return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
  const hue = n => COLORS[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  const av = (m, s = 40) => m && m.avatar_url ? `<img class="ag-av" style="width:${s}px;height:${s}px" src="${esc(m.avatar_url)}" alt="">` : `<span class="ag-av" style="width:${s}px;height:${s}px;font-size:${Math.round(s * .36)}px;background:${hue(m ? m.name : '?')}" aria-hidden="true">${esc(ini(m ? m.name : '?'))}</span>`;
  const isOver = t => t.due_date && t.status !== 'done' && t.due_date < todayStr();
  const fmtSize = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b > 1024 ? Math.round(b / 1024) + ' KB' : b + ' B';
  const safeName = n => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\-]+/g, '_').slice(-80);
  const shortName = p => String(p || '').split('/').pop().replace(/^\d+-/, '');
  const isImg = n => /\.(png|jpe?g|gif|webp|avif)$/i.test(n || '');
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  const seenKey = () => 'ag_seen_' + (me ? me.id : '');
  const lv = m => m.access_level === 'super' ? `<span class="badge f">${LV.super}</span>` : m.access_level === 'lider' ? '<span class="badge d">Líder</span>' : '';

  function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }
  const log = (action, detail = '', area = 'acesso') => me && sb.from('agency_activity').insert({ member_id: me.id, action, detail, area }).then(() => {});
  async function notify(ids, text, link = '') {
    ids = [...new Set(ids)].filter(i => i && i !== me.id && mem(i) && mem(i).active);
    if (ids.length) await sb.from('agency_notifications').insert(ids.map(member_id => ({ member_id, text, link })));
  }
  const leaderIds = () => S.members.filter(m => m.active && (m.access_level === 'super' || m.access_level === 'lider')).map(m => m.id);
  const allIds = () => S.members.filter(m => m.active).map(m => m.id);

  function head(title, sub, actions) { return `<div class="top"><div><h1>${title}</h1><p>${sub || ''}</p></div>${actions ? `<div class="acts">${actions}</div>` : ''}</div>`; }
  const b = (act, label, cls = '', extra = '') => `<button class="btn ${cls}" data-ag="${act}" ${extra}>${label}</button>`;
  const empty = t => `<p class="ag-empty">${t}</p>`;

  /* ---------- modal ---------- */
  function modal(title, html, cls = '') {
    layer.innerHTML = `<div class="ag ag-bg" data-ag="bg"><div class="ag-modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="ag-mh"><h3>${title}</h3><button class="ag-x" data-ag="close" aria-label="Fechar">${I('x')}</button></div><div class="ag-mb">${html}</div></div></div>`;
  }
  const closeModal = () => { layer.innerHTML = ''; };
  const confirmBox = (title, text, act, id, label = 'Confirmar', danger = true) => modal(title, `<p class="ag-p">${text}</p><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn ${danger ? 'rd' : 'g'}" data-ag="${act}" data-id="${esc(id || '')}">${label}</button></div>`, 'sm');

  /* ---------- dados ---------- */
  async function loadBase() {
    const rs = await Promise.all([
      sb.from('agency_members').select('*').order('created_at'),
      sb.from('agency_notices').select('*').order('created_at', { ascending: false }),
      sb.from('agency_tasks').select('*').order('created_at', { ascending: false }),
      sb.from('agency_events').select('*').order('event_date'),
      sb.from('agency_notifications').select('*').eq('member_id', me.id).order('created_at', { ascending: false }).limit(60),
      sb.from('agency_chats').select('*'),
      sb.from('agency_chat_members').select('*').eq('member_id', me.id),
      sb.from('agency_requests').select('*').order('created_at', { ascending: false }),
      sb.from('agency_messages').select('id,chat_id,sender_id,body,file_path,created_at').order('created_at', { ascending: false }).limit(300)
    ]);
    if (rs[0].error || rs[1].error || rs[2].error) toast('Erro ao carregar os dados da agência');
    [S.members, S.notices, S.tasks, S.events, S.notifs, S.chats, S.cmine, S.reqs, S.recent] = rs.map(r => r.data || []);
    S.tasks.forEach(t => { t.assignees = t.assignees || []; t.checklist = Array.isArray(t.checklist) ? t.checklist : []; });
    S.loadedAt = Date.now();
    me = mem(me.id) || me;
    badges();
  }
  async function refresh() { await loadBase(); render(); }

  function chatTitle(c) {
    if (c.kind === 'direct') { const o = S.dmOther && S.dmOther[c.id]; if (o) return o; return c.name || 'Conversa direta'; }
    return c.name || 'Grupo';
  }
  const lastRead = c => { const r = S.cmine.find(x => x.chat_id === c.id); return r ? r.last_read_at : (me.created_at || '1970-01-01'); };
  const unreadOf = c => (!S.cmine.find(x => x.chat_id === c.id) && !c.everyone) ? 0 : S.recent.filter(m => m.chat_id === c.id && m.sender_id !== me.id && m.created_at > lastRead(c)).length;
  const unreadChat = () => S.chats.reduce((a, c) => a + unreadOf(c), 0);
  const unseenNotices = () => { const s = localStorage.getItem(seenKey()) || '1970-01-01'; return S.notices.filter(n => n.created_at > s && n.author_id !== me.id); };
  const myOpen = () => S.tasks.filter(t => t.assignees.includes(me.id) && t.status !== 'done');
  function badges() {
    const o = {
      notifs: S.notifs.filter(n => !n.read).length, chat: unreadChat(), tasks: myOpen().length, notices: unseenNotices().length,
      req: isLeader() ? S.reqs.filter(r => r.status === 'aberto').length : S.reqs.filter(r => r.member_id === me.id && r.status === 'aberto').length
    };
    S.badge = o; if (host.onBadges) host.onBadges(o);
  }

  /* ---------- realtime ---------- */
  function subscribe() {
    if (rt) sb.removeChannel(rt);
    rt = sb.channel('ag-' + me.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agency_messages' }, p => onMsg(p.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'agency_messages' }, p => { S.msgs = S.msgs.filter(m => m.id !== p.old.id); S.recent = S.recent.filter(m => m.id !== p.old.id); if (S.view === 'chat') { drawMsgs(); drawChatList(); } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agency_notifications', filter: `member_id=eq.${me.id}` }, p => { S.notifs.unshift(p.new); badges(); toast(p.new.text); })
      .subscribe();
  }
  function onMsg(m) {
    if (!S.chats.find(c => c.id === m.chat_id)) { refresh(); return; }
    if (!S.recent.find(x => x.id === m.id)) S.recent.unshift({ id: m.id, chat_id: m.chat_id, sender_id: m.sender_id, body: m.body, file_path: m.file_path, created_at: m.created_at });
    if (S.view === 'chat' && S.chatId === m.chat_id) {
      if (!S.msgs.find(x => x.id === m.id)) S.msgs.push(m);
      drawMsgs(); markRead(m.chat_id);
    } else if (m.sender_id !== me.id) { const s = mem(m.sender_id); toast(`${s ? first(s.name) : 'Alguém'}: ${m.body ? m.body.slice(0, 60) : 'enviou um arquivo'}`); }
    badges(); if (S.view === 'chat') drawChatList();
  }

  /* ---------- navegação ---------- */
  function go(v, a) {
    if (!me) return;
    if (!canView(v)) v = 'inicio';
    S.view = TITLES[v] ? v : 'inicio'; S.arg = a || null; closeModal();
    if (host.onView) host.onView(S.view);
    window.scrollTo(0, 0);
    if (S.view === 'avisos') { localStorage.setItem(seenKey(), new Date().toISOString()); badges(); }
    if (Date.now() - S.loadedAt > 45000) refresh(); else render();
  }
  const V = { inicio: vInicio, avisos: vAvisos, tarefas: vTarefas, calendario: vCal, arquivos: vArquivos, chat: vChat, equipe: vEquipe, pedidos: vPedidos, atividade: vAtividade, noticias: vNoticias, modelos: vModelos, apuracao: vApuracao };
  const AFTER = { arquivos: drawFiles, chat: afterChat, tarefas: drawBoard, atividade: drawAct, modelos: drawTpls, apuracao: drawAp };
  async function render() {
    if (!me) return; const my = ++token;
    const html = await V[S.view]();
    if (my !== token) return;
    mount.innerHTML = html; if (AFTER[S.view]) AFTER[S.view]();
  }
  function openLink(l) {
    if (!l) return; const [v, a] = l.split(':');
    if (v === 'tarefas' && a) { go('tarefas'); setTimeout(() => taskModal(a), 50); } else go(v, a);
  }

  /* =====================================================  VISÃO GERAL  */
  function itemsOn(d) {
    const [, m, dd] = d.split('-').map(Number), out = [];
    S.events.forEach(e => { const [, em, ed] = e.event_date.split('-').map(Number); if (e.event_date === d || (e.yearly && em === m && ed === dd)) out.push({ t: 'event', kind: e.kind, title: e.title, ref: e }); });
    S.members.filter(x => x.active && x.birthday).forEach(x => { const [, bm, bd] = x.birthday.split('-').map(Number); if (bm === m && bd === dd) out.push({ t: 'bday', title: 'Aniversário de ' + first(x.name), ref: x }); });
    S.tasks.forEach(t => { if (t.due_date === d && t.status !== 'done' && (isLeader() || t.assignees.includes(me.id))) out.push({ t: 'task', title: t.title, ref: t }); });
    return out;
  }
  function upcoming(n) {
    const out = [], t = new Date(); t.setHours(0, 0, 0, 0);
    for (let i = 0; i < n; i++) { const d = new Date(t); d.setDate(t.getDate() + i); const k = ds(d); itemsOn(k).forEach(it => out.push({ ...it, date: k, days: i })); }
    return out;
  }
  const dayWord = k => k === 0 ? 'Hoje' : k === 1 ? 'Amanhã' : `Em ${k} dias`;
  function agendaRow(it) {
    const d = it.date.split('-'), cls = it.t === 'bday' ? 'f' : it.t === 'task' ? 'd' : '';
    const lbl = it.t === 'bday' ? 'Aniversário' : it.t === 'task' ? 'Prazo de tarefa' : KINDS[it.kind] || 'Data';
    return `<div class="ag-line"><div class="ag-date"><b>${+d[2]}</b><small>${MES[+d[1] - 1].slice(0, 3)}</small></div><div class="tx"><b>${esc(it.title)}</b><small>${lbl}</small></div><span class="badge ${cls}" style="margin:0">${dayWord(it.days)}</span></div>`;
  }
  function vInicio() {
    const mine = myOpen().sort((a, b) => (a.due_date || '9') < (b.due_date || '9') ? -1 : 1), late = mine.filter(isOver);
    const up = upcoming(45), today = up.filter(x => x.t === 'bday' && x.days === 0);
    const pend = isLeader() ? S.reqs.filter(r => r.status === 'aberto').length : S.reqs.filter(r => r.member_id === me.id && r.status === 'aberto').length;
    const nts = [...S.notices].sort((a, b) => (b.pinned - a.pinned) || (a.created_at < b.created_at ? 1 : -1)).slice(0, 3);
    const st = [['Minhas tarefas', mine.length, 'hl', mine.length ? 'Em aberto com você' : 'Tudo em dia', 'tarefas'], ['Atrasadas', late.length, '', late.length ? 'Precisam de atenção' : 'Nenhuma atrasada', 'tarefas'], ['Avisos novos', unseenNotices().length, '', 'Desde sua última visita', 'avisos'], ['Mensagens', unreadChat(), '', 'Não lidas nas conversas', 'chat']];
    const work = isLeader() ? S.members.filter(m => m.active).map(m => ({ m, n: S.tasks.filter(t => t.assignees.includes(m.id) && t.status !== 'done').length })).sort((a, b) => b.n - a.n) : [];
    const mx = Math.max(1, ...work.map(w => w.n)), total = S.tasks.length, done = S.tasks.filter(t => t.status === 'done').length;
    return `${head(`Olá, ${esc(first(me.name))}`, mine.length ? `Você tem ${mine.length} tarefa${mine.length > 1 ? 's' : ''} em aberto.` : 'Nenhuma tarefa com você agora.', isLeader() ? b('new-task', I('plus') + 'Nova tarefa', 'g') + b('new-notice', I('mega') + 'Novo aviso', 'o') : b('new-request', I('inbox') + 'Fazer um pedido', 'o'))}
    ${today.map(x => `<div class="ag-banner">${I('cake')}<span>${x.ref.id === me.id ? 'Hoje é seu aniversário! Parabéns!' : `Hoje é aniversário de <b>${esc(x.ref.name)}</b>. Deixe seus parabéns!`}</span></div>`).join('')}
    <div class="stats">${st.map(([l, n, c, note, v]) => `<button class="st ${c} ag-stbtn" data-ag="nav" data-v="${v}"><span class="stat-arrow" aria-hidden="true">${I('right', 15)}</span><small>${l}</small><b>${n}</b><div class="stat-note">${note}</div></button>`).join('')}</div>
    <div class="row">
      <div class="panel"><div class="panel-header"><h3>Minhas tarefas</h3>${b('nav', 'Ver quadro', 'o s', 'data-v="tarefas"')}</div>
        ${mine.slice(0, 5).map(t => `<button class="ag-line ag-btnrow" data-ag="task" data-id="${t.id}"><div class="tx"><b>${esc(t.title)}</b><small>${esc(t.category)} · ${ST.find(s => s[0] === t.status)[1]}${t.due_date ? ' · prazo ' + dm(t.due_date) : ''}</small></div>${isOver(t) ? '<span class="badge" style="background:#fbeaea;color:#bc4545;border-color:#efc7c7;margin:0">Atrasada</span>' : ''}</button>`).join('') || empty('Nenhuma tarefa com você agora.')}</div>
      <div class="panel"><div class="panel-header"><h3>Próximas datas</h3>${b('nav', 'Calendário', 'o s', 'data-v="calendario"')}</div>${up.slice(0, 5).map(agendaRow).join('') || empty('Nada marcado para os próximos dias.')}</div>
    </div>
    <div class="row">
      <div class="panel"><div class="panel-header"><h3>Avisos</h3>${b('nav', 'Ver todos', 'o s', 'data-v="avisos"')}</div>${nts.map(n => noticeCard(n, true)).join('') || empty('Nenhum aviso ainda.')}</div>
      ${isLeader() ? `<div class="panel"><div class="panel-header"><h3>Carga da equipe</h3><span>${done} de ${total} tarefas entregues</span></div>${work.map(w => `<div class="ag-load"><span>${av(w.m, 30)}</span><div class="tx"><b>${esc(first(w.m.name))}</b><div class="dx-track"><i style="width:${Math.max(4, w.n / mx * 100)}%"></i></div></div><em>${w.n}</em></div>`).join('') || empty('Sem membros.')}</div>`
      : `<div class="panel"><div class="panel-header"><h3>Meus pedidos</h3>${b('nav', 'Abrir', 'o s', 'data-v="pedidos"')}</div><p class="ag-p">${pend ? `Você tem ${pend} pedido${pend > 1 ? 's' : ''} aberto${pend > 1 ? 's' : ''}.` : 'Precisa corrigir ou excluir algo, ou pedir ajuda? Faça um pedido para a liderança.'}</p>${b('new-request', 'Fazer um pedido', 'o')}</div>`}
    </div>`;
  }

  /* =====================================================  AVISOS  */
  function noticeCard(n, mini) {
    const a = mem(n.author_id), imp = n.importance, lead = isLeader() && !mini;
    return `<article class="ag-notice ${imp}"><div class="ag-nh">${n.pinned ? `<span class="badge d" style="margin:0">${I('pin', 12)} Fixado</span>` : ''}${imp !== 'normal' ? `<span class="badge ${imp === 'urgente' ? 'u' : 'd'}" style="margin:0">${imp === 'urgente' ? 'Urgente' : 'Importante'}</span>` : ''}<span class="ag-meta">${a ? esc(a.name) + ' · ' : ''}${when(n.created_at)}</span></div><h4>${esc(n.title)}</h4>${n.body ? `<p>${esc(n.body)}</p>` : ''}${lead ? `<div class="ag-btns l"><button class="btn o s" data-ag="edit-notice" data-id="${n.id}">Editar</button><button class="btn o s" data-ag="pin-notice" data-id="${n.id}">${n.pinned ? 'Desafixar' : 'Fixar no topo'}</button><button class="btn r s" data-ag="ask-del-notice" data-id="${n.id}">Excluir</button></div>` : ''}</article>`;
  }
  function vAvisos() {
    const l = [...S.notices].sort((a, b) => (b.pinned - a.pinned) || (a.created_at < b.created_at ? 1 : -1));
    return `${head('Avisos', 'Comunicados da liderança para toda a equipe.', isLeader() ? b('new-notice', I('plus') + 'Novo aviso', 'g') : '')}<div class="ag-stack">${l.map(n => noticeCard(n)).join('') || `<div class="panel">${empty('Nenhum aviso ainda.')}</div>`}</div>`;
  }
  function noticeForm(id) {
    const n = S.notices.find(x => x.id === id) || { title: '', body: '', importance: 'normal', pinned: false };
    modal(id ? 'Editar aviso' : 'Novo aviso', `<label for="nt">Título</label><input type="text" id="nt" value="${esc(n.title)}" maxlength="120"><label for="nb">Mensagem</label><textarea id="nb" rows="6">${esc(n.body)}</textarea><label for="ni">Importância</label><select id="ni">${[['normal', 'Normal'], ['importante', 'Importante'], ['urgente', 'Urgente']].map(([v, l]) => `<option value="${v}" ${n.importance === v ? 'selected' : ''}>${l}</option>`).join('')}</select><label class="ag-chk"><input type="checkbox" id="np" ${n.pinned ? 'checked' : ''}> Fixar no topo da lista</label><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-notice" data-id="${id || ''}">${id ? 'Salvar' : 'Publicar aviso'}</button></div>`);
  }
  async function saveNotice(id) {
    const title = $('#nt').value.trim(); if (!title) return toast('Escreva um título');
    const p = { title, body: $('#nb').value.trim(), importance: $('#ni').value, pinned: $('#np').checked };
    const { error } = id ? await sb.from('agency_notices').update(p).eq('id', id) : await sb.from('agency_notices').insert({ ...p, author_id: me.id });
    if (error) return toast('Não foi possível salvar o aviso');
    if (!id) { await notify(allIds(), `Novo aviso: ${title}`, 'avisos'); log('publicou um aviso', title, 'avisos'); } else log('editou um aviso', title, 'avisos');
    closeModal(); toast('Aviso salvo'); refresh();
  }

  /* =====================================================  TAREFAS  */
  const canMove = t => isLeader() || t.assignees.includes(me.id);
  const cl = t => { const n = t.checklist.length; return n ? `${t.checklist.filter(i => i.done).length}/${n}` : ''; };
  function vTarefas() {
    const cats = [...new Set(S.tasks.map(t => t.category))].sort();
    return `${head('Tarefas', 'Quadro de trabalho da equipe. Arraste os cartões ou abra uma tarefa para atualizar.', isLeader() ? b('new-task', I('plus') + 'Nova tarefa', 'g') : '')}
    <div class="panel ag-filters"><div class="ag-search">${I('search')}<input type="search" id="ag-tq" placeholder="Buscar tarefa…" value="${esc(S.tQ)}" aria-label="Buscar tarefa"></div>
      <div class="ag-chips">${[['all', 'Todas'], ['mine', 'Minhas'], ['late', 'Atrasadas']].map(([v, l]) => `<button class="btn o s" data-ag="tfilter" data-v="${v}" aria-pressed="${S.tFilter === v}">${l}</button>`).join('')}</div>
      <select id="ag-tcat" aria-label="Categoria"><option value="">Todas as categorias</option>${cats.map(c => `<option ${S.tCat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      ${isLeader() ? `<select id="ag-tmem" aria-label="Responsável"><option value="">Todos os responsáveis</option>${S.members.filter(m => m.active).map(m => `<option value="${m.id}" ${S.tMem === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>` : ''}</div>
    <div id="ag-board"></div>`;
  }
  function drawBoard() {
    const q = S.tQ.toLowerCase();
    const list = S.tasks.filter(t => (S.tFilter === 'all' || (S.tFilter === 'mine' && t.assignees.includes(me.id)) || (S.tFilter === 'late' && isOver(t))) && (!S.tCat || t.category === S.tCat) && (!S.tMem || t.assignees.includes(S.tMem)) && (t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)));
    $('#ag-board').innerHTML = `<div class="ag-tabs" role="tablist">${ST.map(([k, l]) => `<button role="tab" data-ag="tstatus" data-v="${k}" aria-selected="${S.tStatus === k}">${l}<i>${list.filter(t => t.status === k).length}</i></button>`).join('')}</div>
    <div class="ag-kanban">${ST.map(([k, l]) => { const c = list.filter(t => t.status === k); return `<section class="ag-col ${S.tStatus === k ? 'on' : ''}" data-drop="${k}"><h4>${l}<i>${c.length}</i></h4><div class="ag-cards">${c.map(taskCard).join('') || '<p class="ag-empty sm">Nada por aqui.</p>'}</div></section>`; }).join('')}</div>`;
  }
  function taskCard(t) {
    const as = t.assignees.map(mem).filter(Boolean), c = cl(t);
    return `<button class="ag-task" draggable="${canMove(t)}" data-ag="task" data-id="${t.id}"><div class="ag-tm"><span class="badge" style="margin:0">${esc(t.category)}</span>${t.priority === 'alta' ? '<span class="badge u" style="margin:0">Alta</span>' : ''}${isOver(t) ? '<span class="badge u" style="margin:0">Atrasada</span>' : ''}</div><b>${esc(t.title)}</b><div class="ag-tf"><span class="ag-avs">${as.slice(0, 4).map(m => av(m, 26)).join('')}${as.length > 4 ? `<span class="ag-av" style="width:26px;height:26px;font-size:10px;background:#69766e">+${as.length - 4}</span>` : ''}</span><span class="ag-meta">${c ? `${I('check', 13)} ${c}  ` : ''}${t.due_date ? `${I('cal', 13)} ${dm(t.due_date)}` : ''}</span></div></button>`;
  }
  async function taskModal(id) {
    const t = S.tasks.find(x => x.id === id); if (!t) return;
    const as = t.assignees.map(mem).filter(Boolean), can = canMove(t);
    modal(esc(t.title), `<div class="ag-tm" style="margin-bottom:10px"><span class="badge" style="margin:0">${esc(t.category)}</span><span class="badge ${t.priority === 'alta' ? 'u' : 'd'}" style="margin:0">Prioridade ${PR[t.priority].toLowerCase()}</span>${isOver(t) ? '<span class="badge u" style="margin:0">Atrasada</span>' : ''}</div>
    <div class="ag-info"><div><span>Responsáveis</span><b>${as.map(m => esc(first(m.name))).join(', ') || '—'}</b></div><div><span>Prazo</span><b>${t.due_date ? dmy(t.due_date) : 'Sem prazo'}</b></div><div><span>Criada por</span><b>${esc((mem(t.created_by) || {}).name || '—')} · ${when(t.created_at)}</b></div></div>
    ${t.description ? `<label>Descrição</label><p class="ag-p pre">${esc(t.description)}</p>` : ''}
    <label>Andamento</label>${can ? `<div class="ag-chips">${ST.map(([k, l]) => `<button class="btn o s" data-ag="set-status" data-id="${t.id}" data-v="${k}" aria-pressed="${t.status === k}">${l}</button>`).join('')}</div>` : '<p class="ag-meta">Só os responsáveis e a liderança mudam o andamento.</p>'}
    <label>Checklist ${cl(t) ? `<b>(${cl(t)})</b>` : ''}</label><div class="ag-check">${t.checklist.map((i, n) => `<div class="ag-ci"><label class="ag-chk"><input type="checkbox" data-ag-change="ck" data-id="${t.id}" data-n="${n}" ${i.done ? 'checked' : ''} ${can ? '' : 'disabled'}><span class="${i.done ? 'dn' : ''}">${esc(i.text)}</span></label>${can ? `<button class="ag-mini" data-ag="ck-del" data-id="${t.id}" data-n="${n}" aria-label="Remover item">${I('x', 14)}</button>` : ''}</div>`).join('') || '<p class="ag-meta">Sem itens.</p>'}${can ? `<div class="ag-inline"><input type="text" id="ck-new" placeholder="Novo item da checklist" maxlength="120"><button class="btn o s" data-ag="ck-add" data-id="${t.id}">Adicionar</button></div>` : ''}</div>
    <label>Comentários</label><div id="ag-cm" class="ag-cm"><p class="ag-meta">Carregando…</p></div>
    ${can ? `<div class="ag-inline"><input type="text" id="cm-new" placeholder="Escreva um comentário" maxlength="500"><button class="btn g s" data-ag="cm-add" data-id="${t.id}">Enviar</button></div>` : ''}
    ${isLeader() ? `<div class="ag-btns"><button class="btn o" data-ag="edit-task" data-id="${t.id}">Editar tarefa</button><button class="btn r" data-ag="ask-del-task" data-id="${t.id}">Excluir</button></div>` : ''}`, 'wide');
    const r = await sb.from('agency_task_comments').select('*').eq('task_id', id).order('created_at');
    const box = $('#ag-cm'); if (!box) return;
    box.innerHTML = (r.data || []).map(c => { const a = mem(c.author_id); return `<div class="ag-c">${av(a, 30)}<div class="tx"><b>${esc(a ? a.name : 'Membro')} <small>${when(c.created_at)}</small></b><p>${esc(c.body)}</p></div>${(c.author_id === me.id || isLeader()) ? `<button class="ag-mini" data-ag="cm-del" data-id="${c.id}" data-t="${t.id}" aria-label="Excluir comentário">${I('trash', 14)}</button>` : ''}</div>`; }).join('') || '<p class="ag-meta">Nenhum comentário ainda.</p>';
  }
  function taskForm(id) {
    const t = S.tasks.find(x => x.id === id) || { title: '', description: '', category: 'Geral', priority: 'media', status: 'todo', assignees: [], due_date: '', checklist: [] };
    const cats = [...new Set(['Design', 'Redação', 'Redes sociais', 'Vídeo', 'Geral', ...S.tasks.map(x => x.category)])];
    modal(id ? 'Editar tarefa' : 'Nova tarefa', `<label for="tt">Título</label><input type="text" id="tt" value="${esc(t.title)}" maxlength="140"><label for="td">Descrição</label><textarea id="td" rows="4">${esc(t.description)}</textarea>
    <div class="ag-two"><div><label for="tc">Categoria</label><input type="text" id="tc" list="ag-cats" value="${esc(t.category)}" maxlength="30"><datalist id="ag-cats">${cats.map(c => `<option>${esc(c)}</option>`).join('')}</datalist></div><div><label for="tp">Prioridade</label><select id="tp">${Object.entries(PR).map(([k, l]) => `<option value="${k}" ${t.priority === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <div class="ag-two"><div><label for="tdue">Prazo</label><input type="date" id="tdue" value="${esc(t.due_date || '')}"></div><div><label for="tst">Andamento</label><select id="tst">${ST.map(([k, l]) => `<option value="${k}" ${t.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <label>Responsáveis</label><div class="ag-checks">${S.members.filter(m => m.active).map(m => `<label class="ag-chk"><input type="checkbox" name="as" value="${m.id}" ${t.assignees.includes(m.id) ? 'checked' : ''}>${esc(m.name)} <small class="ag-meta">${esc(m.role_title)}</small></label>`).join('')}</div>
    <label for="tck">Checklist (um item por linha)</label><textarea id="tck" rows="3">${esc(t.checklist.map(i => i.text).join('\n'))}</textarea>
    <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-task" data-id="${id || ''}">Salvar tarefa</button></div>`, 'wide');
  }
  async function saveTask(id) {
    const title = $('#tt').value.trim(); if (!title) return toast('Escreva um título');
    const old = S.tasks.find(x => x.id === id), as = [...document.querySelectorAll('input[name=as]:checked')].map(i => i.value);
    const lines = $('#tck').value.split('\n').map(x => x.trim()).filter(Boolean), prev = old ? old.checklist : [];
    const checklist = lines.map(text => ({ text, done: !!(prev.find(i => i.text === text) || {}).done }));
    const p = { title, description: $('#td').value.trim(), category: $('#tc').value.trim() || 'Geral', priority: $('#tp').value, status: $('#tst').value, due_date: $('#tdue').value || null, assignees: as, checklist };
    const { error } = id ? await sb.from('agency_tasks').update(p).eq('id', id) : await sb.from('agency_tasks').insert({ ...p, created_by: me.id });
    if (error) return toast('Não foi possível salvar a tarefa');
    const added = as.filter(a => !old || !old.assignees.includes(a));
    await notify(added, `Você recebeu uma tarefa: ${title}`, 'tarefas'); log(id ? 'editou uma tarefa' : 'criou uma tarefa', title, 'tarefas');
    closeModal(); toast('Tarefa salva'); refresh();
  }
  async function setStatus(id, v) {
    const t = S.tasks.find(x => x.id === id); if (!t || t.status === v) return;
    const { error } = await sb.from('agency_tasks').update({ status: v }).eq('id', id); if (error) return toast('Não foi possível alterar o andamento');
    log('moveu uma tarefa para ' + ST.find(s => s[0] === v)[1], t.title, 'tarefas');
    if (v === 'done') await notify([t.created_by, ...leaderIds()], `${first(me.name)} entregou: ${t.title}`, 'tarefas:' + id);
    S.tStatus = v; t.status = v; toast('Andamento atualizado'); await loadBase(); render();
  }
  async function saveChecklist(id, list) {
    const { error } = await sb.from('agency_tasks').update({ checklist: list }).eq('id', id); if (error) return toast('Não foi possível salvar a checklist');
    const t = S.tasks.find(x => x.id === id); t.checklist = list; taskModal(id); if (S.view === 'tarefas' && $('#ag-board')) drawBoard();
  }

  /* =====================================================  CALENDÁRIO  */
  function vCal() {
    if (!S.month) { const n = new Date(); S.month = { y: n.getFullYear(), m: n.getMonth() }; }
    const { y, m } = S.month, f = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), cells = [];
    for (let i = 0; i < f.getDay(); i++) cells.push(null); for (let d = 1; d <= n; d++) cells.push(d);
    const t = todayStr();
    return `${head('Calendário', 'Datas comemorativas, reuniões, prazos, aniversários e entregas.', isLeader() ? b('new-event', I('plus') + 'Nova data', 'g', `data-id=""`) : '')}
    <div class="panel"><div class="ag-calh">${b('cal-prev', I('left'), 'o s', 'aria-label="Mês anterior"')}<h3>${MES[m][0].toUpperCase() + MES[m].slice(1)} de ${y}</h3>${b('cal-next', I('right'), 'o s', 'aria-label="Próximo mês"')}${b('cal-today', 'Hoje', 'o s')}</div>
    <div class="ag-cal">${DIAS.map(d => `<div class="ag-dw">${d}</div>`).join('')}${cells.map(d => { if (!d) return '<div class="ag-cd off"></div>'; const k = `${y}-${pad(m + 1)}-${pad(d)}`, it = itemsOn(k); return `<button class="ag-cd ${k === t ? 'today' : ''}" data-ag="day" data-id="${k}"><span>${d}</span>${it.slice(0, 2).map(x => `<i class="ev ${x.t === 'bday' ? 'bd' : x.t === 'task' ? 'tk' : x.kind}">${esc(x.title)}</i>`).join('')}${it.length > 2 ? `<em>+${it.length - 2}</em>` : ''}</button>`; }).join('')}</div>
    <div class="ag-legend"><span><i class="ev comemorativa"></i>Comemorativa</span><span><i class="ev reuniao"></i>Reunião</span><span><i class="ev prazo"></i>Prazo</span><span><i class="ev bd"></i>Aniversário</span><span><i class="ev tk"></i>Tarefa</span></div></div>
    <div class="panel" style="margin-top:16px"><div class="panel-header"><h3>Próximos 60 dias</h3></div>${upcoming(60).map(agendaRow).join('') || empty('Nada marcado.')}</div>`;
  }
  function dayModal(d) {
    const it = itemsOn(d);
    modal(dmy(d), `${it.map(x => `<div class="ag-line"><div class="tx"><b>${esc(x.title)}</b><small>${x.t === 'bday' ? 'Aniversário' : x.t === 'task' ? 'Prazo de tarefa' : KINDS[x.kind]}${x.t === 'event' && x.ref.yearly ? ' · todo ano' : ''}</small>${x.t === 'event' && x.ref.description ? `<p class="ag-p">${esc(x.ref.description)}</p>` : ''}</div>${x.t === 'event' && isLeader() ? `<button class="btn o s" data-ag="edit-event" data-id="${x.ref.id}">Editar</button>` : ''}${x.t === 'task' ? `<button class="btn o s" data-ag="task" data-id="${x.ref.id}">Abrir</button>` : ''}</div>`).join('') || empty('Nada marcado neste dia.')}${isLeader() ? `<div class="ag-btns"><button class="btn g" data-ag="new-event" data-id="${d}">${I('plus')}Marcar data</button></div>` : ''}`, 'sm');
  }
  function eventForm(id, date) {
    const e = S.events.find(x => x.id === id) || { title: '', kind: 'comemorativa', event_date: date || todayStr(), yearly: false, description: '' };
    modal(id ? 'Editar data' : 'Nova data', `<label for="et">Título</label><input type="text" id="et" value="${esc(e.title)}" maxlength="120"><div class="ag-two"><div><label for="ek">Tipo</label><select id="ek">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}" ${e.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div><label for="ed">Data</label><input type="date" id="ed" value="${esc(e.event_date)}"></div></div><label class="ag-chk"><input type="checkbox" id="ey" ${e.yearly ? 'checked' : ''}> Repetir todo ano</label><label for="edc">Descrição</label><textarea id="edc" rows="3">${esc(e.description)}</textarea><div class="ag-btns">${id ? `<button class="btn r" data-ag="ask-del-event" data-id="${id}">Excluir</button>` : ''}<button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-event" data-id="${id || ''}">Salvar</button></div>`, 'sm');
  }
  async function saveEvent(id) {
    const title = $('#et').value.trim(), d = $('#ed').value; if (!title || !d) return toast('Preencha título e data');
    const p = { title, kind: $('#ek').value, event_date: d, yearly: $('#ey').checked, description: $('#edc').value.trim() };
    const { error } = id ? await sb.from('agency_events').update(p).eq('id', id) : await sb.from('agency_events').insert({ ...p, created_by: me.id });
    if (error) return toast('Não foi possível salvar a data');
    if (!id) await notify(allIds(), `Nova data no calendário: ${title} (${dm(d)})`, 'calendario');
    log(id ? 'editou uma data' : 'criou uma data', title, 'agenda'); closeModal(); toast('Data salva'); refresh();
  }

  /* =====================================================  ARQUIVOS  */
  const folderById = id => S.folders.find(f => f.id === id);
  const crumbs = () => { const out = []; let f = S.folder && folderById(S.folder); while (f) { out.unshift(f); f = f.parent_id && folderById(f.parent_id); } return out; };
  const folderOpen = () => !S.folder || isLeader() || !(folderById(S.folder) || {}).locked;
  async function vArquivos() {
    const fr = await sb.from('agency_folders').select('*').order('name'); S.folders = fr.data || [];
    if (S.folder && !folderById(S.folder)) S.folder = null;
    const cur = folderById(S.folder), open = folderOpen();
    return `${head('Arquivos', 'Materiais, artes e documentos da agência.', `${open ? b('pick-files', I('upload') + 'Enviar arquivos', 'g') : ''}${isLeader() ? b('new-folder', I('folder') + 'Nova pasta', 'o') : ''}`)}
    <input type="file" id="ag-up" multiple hidden>
    <div class="panel"><div class="ag-search" style="margin-bottom:12px">${I('search')}<input type="search" id="ag-fq" placeholder="Buscar arquivo pelo nome…" value="${esc(S.fq)}"></div>
    <div class="ag-crumbs"><button data-ag="folder" data-id="">${I('folder', 15)} Início</button>${crumbs().map(f => `<span>/</span><button data-ag="folder" data-id="${f.id}">${esc(f.name)}</button>`).join('')}${cur && cur.locked ? `<span class="badge d" style="margin:0 0 0 8px">${I('lock', 12)} Pasta bloqueada</span>` : ''}</div>
    <div id="ag-fl"></div></div>`;
  }
  async function drawFiles() {
    let q = sb.from('agency_files').select('*').order('created_at', { ascending: false });
    if (S.fq) q = q.ilike('name', '%' + S.fq.replace(/[%,_]/g, ' ') + '%'); else q = S.folder ? q.eq('folder_id', S.folder) : q.is('folder_id', null);
    const r = await q; S.files = r.data || []; const box = $('#ag-fl'); if (!box) return;
    const subs = S.fq ? [] : S.folders.filter(f => (f.parent_id || null) === (S.folder || null));
    box.innerHTML = `${subs.length ? `<div class="ag-folders">${subs.map(f => `<div class="ag-folder"><button class="ag-fb" data-ag="folder" data-id="${f.id}">${I('folder', 26)}<div class="tx"><b>${esc(f.name)}</b><small>${f.locked ? 'Bloqueada para envio' : 'Aberta'}</small></div></button>${isLeader() ? `<button class="ag-mini" data-ag="folder-menu" data-id="${f.id}" aria-label="Opções da pasta">${I('edit', 15)}</button>` : ''}</div>`).join('')}</div>` : ''}
    <div class="list">${S.files.map(f => { const u = mem(f.uploaded_by); return `<div class="it"><div class="th ag-fi">${I('file', 22)}</div><div class="tx"><b>${esc(f.name)}</b><small>${fmtSize(f.size)} · ${u ? esc(first(u.name)) : '—'} · ${when(f.created_at)}${S.fq && f.folder_id ? ` · em ${esc((folderById(f.folder_id) || {}).name || 'pasta')}` : ''}</small></div><div class="acts"><button class="btn o s" data-ag="dl" data-id="${f.id}">${I('down', 14)}Baixar</button>${(isLeader() || f.uploaded_by === me.id) ? `<button class="btn r s" data-ag="ask-del-file" data-id="${f.id}">Excluir</button>` : ''}</div></div>`; }).join('') || (subs.length ? '' : empty(S.fq ? 'Nenhum arquivo com esse nome.' : 'Esta pasta está vazia.'))}</div>`;
  }
  async function uploadFiles(fl) {
    if (!folderOpen()) return toast('Esta pasta está bloqueada para envios');
    let ok = 0;
    for (const f of fl) {
      if (f.size > 26214400) { toast(`${f.name}: máximo de 25 MB`); continue; }
      const path = `${me.id}/${Date.now()}-${safeName(f.name)}`; toast(`Enviando ${f.name}…`);
      const up = await sb.storage.from('agency-files').upload(path, f, { contentType: f.type || 'application/octet-stream' });
      if (up.error) { toast(`Falha ao enviar ${f.name}`); continue; }
      const { error } = await sb.from('agency_files').insert({ folder_id: S.folder, name: f.name, path, size: f.size, mime: f.type || '', uploaded_by: me.id });
      if (error) { await sb.storage.from('agency-files').remove([path]); toast(`Sem permissão para salvar ${f.name}`); continue; } ok++;
    }
    if (ok) { toast(ok > 1 ? `${ok} arquivos enviados` : 'Arquivo enviado'); log('enviou ' + (ok > 1 ? ok + ' arquivos' : 'um arquivo'), fl[0].name, 'arquivos'); }
    drawFiles();
  }
  async function signed(path) {
    if (S.urls[path] && S.urls[path].exp > Date.now()) return S.urls[path].url;
    const r = await sb.storage.from('agency-files').createSignedUrl(path, 600); if (r.error) return null;
    S.urls[path] = { url: r.data.signedUrl, exp: Date.now() + 540000 }; return r.data.signedUrl;
  }
  async function openFile(path, name) { const u = await signed(path); if (!u) return toast('Não foi possível abrir o arquivo'); const a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; if (name) a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  function folderForm(id) {
    const f = folderById(id) || { name: '', locked: false };
    modal(id ? 'Pasta' : 'Nova pasta', `<label for="fn">Nome da pasta</label><input type="text" id="fn" value="${esc(f.name)}" maxlength="60"><label class="ag-chk"><input type="checkbox" id="fl" ${f.locked ? 'checked' : ''}> Bloquear envios (só a liderança envia ou apaga)</label><div class="ag-btns">${id ? `<button class="btn r" data-ag="ask-del-folder" data-id="${id}">Excluir pasta</button>` : ''}<button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-folder" data-id="${id || ''}">Salvar</button></div>`, 'sm');
  }
  async function saveFolder(id) {
    const name = $('#fn').value.trim(); if (!name) return toast('Dê um nome à pasta');
    const p = { name, locked: $('#fl').checked };
    const { error } = id ? await sb.from('agency_folders').update(p).eq('id', id) : await sb.from('agency_folders').insert({ ...p, parent_id: S.folder, created_by: me.id });
    if (error) return toast('Não foi possível salvar a pasta'); log(id ? 'editou uma pasta' : 'criou uma pasta', name, 'arquivos'); closeModal(); toast('Pasta salva'); go('arquivos');
  }
  async function deleteFolder(id) {
    const all = [id]; let grow = true; while (grow) { grow = false; S.folders.forEach(f => { if (f.parent_id && all.includes(f.parent_id) && !all.includes(f.id)) { all.push(f.id); grow = true; } }); }
    const fs = await sb.from('agency_files').select('id,path').in('folder_id', all);
    const paths = (fs.data || []).map(x => x.path); if (paths.length) await sb.storage.from('agency-files').remove(paths);
    if ((fs.data || []).length) await sb.from('agency_files').delete().in('folder_id', all);
    for (const fid of [...all].reverse()) { const r = await sb.from('agency_folders').delete().eq('id', fid); if (r.error) return toast('Não foi possível excluir a pasta'); }
    log('excluiu uma pasta', (folderById(id) || {}).name || '', 'arquivos'); if (all.includes(S.folder)) S.folder = null; closeModal(); toast('Pasta excluída'); go('arquivos');
  }
  async function deleteFile(id) {
    const f = S.files.find(x => x.id === id); if (!f) return;
    const r = await sb.from('agency_files').delete().eq('id', id); if (r.error) return toast('Sem permissão para excluir');
    await sb.storage.from('agency-files').remove([f.path]); log('excluiu um arquivo', f.name, 'arquivos'); closeModal(); toast('Arquivo excluído'); drawFiles();
  }

  /* =====================================================  CONVERSAS  */
  const sortedChats = () => [...S.chats].sort((a, b) => lastTime(b) > lastTime(a) ? 1 : -1);
  const lastMsg = c => S.recent.find(m => m.chat_id === c.id);
  const lastTime = c => (lastMsg(c) || c).created_at;
  async function dmNames() {
    S.dmOther = S.dmOther || {};
    const ids = S.chats.filter(c => c.kind === 'direct' && !S.dmOther[c.id]).map(c => c.id); if (!ids.length) return;
    const r = await sb.from('agency_chat_members').select('chat_id,member_id').in('chat_id', ids);
    (r.data || []).forEach(x => { const m = mem(x.member_id); if (x.member_id !== me.id && m) S.dmOther[x.chat_id] = m.name; });
  }
  function vChat() {
    return `${head('Conversas', 'Fale com a equipe em grupos ou diretamente.', b('new-chat', I('plus') + 'Nova conversa', 'g'))}
    <div class="ag-chat ${S.chatId ? 'open' : ''}"><aside class="ag-cl panel" id="ag-chat-list"></aside><section class="ag-cv panel" id="ag-chat-pane"></section></div>`;
  }
  async function afterChat() { await dmNames(); drawChatList(); drawPane(); }
  function drawChatList() {
    const box = $('#ag-chat-list'); if (!box) return;
    box.innerHTML = sortedChats().map(c => { const lm = lastMsg(c), u = unreadOf(c), s = lm && mem(lm.sender_id); return `<button class="ag-ci2 ${S.chatId === c.id ? 'on' : ''}" data-ag="open-chat" data-id="${c.id}"><span class="ag-cav">${c.kind === 'direct' ? av(S.dmOther && S.dmOther[c.id] ? S.members.find(m => m.name === S.dmOther[c.id]) : null, 42) : I(c.everyone ? 'team' : 'chat', 20)}</span><div class="tx"><b>${esc(chatTitle(c))}</b><small>${lm ? `${lm.sender_id === me.id ? 'Você' : esc(first((s || {}).name))}: ${esc(lm.body || 'Arquivo')}` : 'Sem mensagens'}</small></div>${u ? `<span class="nav-count">${u > 99 ? '99+' : u}</span>` : ''}</button>`; }).join('') || empty('Nenhuma conversa ainda.');
  }
  async function openChat(id) {
    S.chatId = id; S.reply = null; S.msgs = []; const root = $('.ag-chat'); if (root) root.classList.add('open'); drawChatList(); drawPane();
    const r = await sb.from('agency_messages').select('*').eq('chat_id', id).order('created_at', { ascending: false }).limit(150);
    if (S.chatId !== id) return; S.msgs = (r.data || []).reverse(); drawMsgs(); markRead(id);
  }
  async function markRead(id) {
    const c = S.chats.find(x => x.id === id); if (!c) return; const mine = S.cmine.find(x => x.chat_id === id);
    if (!mine && !c.everyone) return; const now = new Date().toISOString();
    if (mine) mine.last_read_at = now; else S.cmine.push({ chat_id: id, member_id: me.id, last_read_at: now });
    await sb.from('agency_chat_members').upsert({ chat_id: id, member_id: me.id, last_read_at: now }, { onConflict: 'chat_id,member_id' });
    badges(); drawChatList();
  }
  function drawPane() {
    const box = $('#ag-chat-pane'); if (!box) return; const c = S.chats.find(x => x.id === S.chatId);
    if (!c) { box.innerHTML = `<div class="ag-ph">${I('chat', 40)}<p>Escolha uma conversa ou comece uma nova.</p></div>`; return; }
    const owner = c.created_by === me.id || isLeader();
    box.innerHTML = `<div class="ag-ch"><button class="ag-mini ag-backchat" data-ag="chat-back" aria-label="Voltar">${I('left')}</button><div class="tx"><b>${esc(chatTitle(c))}</b><small>${c.everyone ? 'Todos da agência' : c.kind === 'direct' ? 'Conversa direta' : 'Grupo'}</small></div>${owner ? `<button class="btn o s" data-ag="chat-manage" data-id="${c.id}">Gerenciar</button>` : ''}</div>
    <div class="ag-msgs" id="ag-msgs"></div><div id="ag-reply"></div>
    <form class="ag-compose" id="ag-compose"><input type="file" id="ag-cup" hidden><button type="button" class="ag-mini lg" data-ag="chat-attach" aria-label="Anexar arquivo">${I('clip', 20)}</button><input type="text" id="ag-chat-input" placeholder="Escreva uma mensagem…" autocomplete="off" maxlength="2000"><button class="btn g" type="submit" aria-label="Enviar">${I('send', 18)}</button></form>`;
    drawMsgs();
  }
  function drawMsgs() {
    const box = $('#ag-msgs'); if (!box) return; let day = '';
    const near = box.scrollHeight - box.scrollTop - box.clientHeight < 120 || !box.children.length;
    box.innerHTML = S.msgs.map(m => {
      const d = new Date(m.created_at).toLocaleDateString('pt-BR'), sep = d !== day ? `<div class="ag-day">${d === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : d}</div>` : ''; day = d;
      const mine = m.sender_id === me.id, s = mem(m.sender_id), rp = m.reply_to && S.msgs.find(x => x.id === m.reply_to);
      const nm = m.file_path ? shortName(m.file_path) : '';
      return `${sep}<div class="ag-m ${mine ? 'me' : ''}">${mine ? '' : av(s, 32)}<div class="bub">${mine ? '' : `<b>${esc(s ? first(s.name) : 'Membro')}</b>`}${rp ? `<div class="rp">${esc((mem(rp.sender_id) || {}).name ? first(mem(rp.sender_id).name) : '')}: ${esc((rp.body || 'Arquivo').slice(0, 80))}</div>` : ''}${m.file_path ? (isImg(nm) ? `<img class="ag-mi" data-sp="${esc(m.file_path)}" data-ag="open-file" data-path="${esc(m.file_path)}" alt="${esc(nm)}">` : `<button class="ag-fl" data-ag="open-file" data-path="${esc(m.file_path)}" data-name="${esc(nm)}">${I('file', 18)}<span>${esc(nm)}</span></button>`) : ''}${m.body ? `<p>${esc(m.body)}</p>` : ''}<small>${hhmm(m.created_at)}<button class="ag-tl" data-ag="reply" data-id="${m.id}">Responder</button>${(mine || isLeader()) ? `<button class="ag-tl" data-ag="ask-del-msg" data-id="${m.id}">Apagar</button>` : ''}</small></div></div>`;
    }).join('') || '<p class="ag-empty">Nenhuma mensagem ainda. Diga olá!</p>';
    if (near) box.scrollTop = box.scrollHeight;
    box.querySelectorAll('img[data-sp]').forEach(async im => { const u = await signed(im.dataset.sp); if (u) im.src = u; });
    const r = $('#ag-reply'); if (r) { const m = S.reply && S.msgs.find(x => x.id === S.reply); r.innerHTML = m ? `<div class="ag-rb"><span>Respondendo a <b>${esc(first((mem(m.sender_id) || {}).name))}</b>: ${esc((m.body || 'Arquivo').slice(0, 70))}</span><button class="ag-mini" data-ag="reply-x">${I('x', 14)}</button></div>` : ''; }
  }
  async function sendMsg(body, file) {
    const chat = S.chatId; if (!chat || (!body && !file)) return;
    let file_path = null;
    if (file) {
      if (file.size > 26214400) return toast('Arquivo muito grande (máx. 25 MB)');
      file_path = `chat/${chat}/${Date.now()}-${safeName(file.name)}`; toast('Enviando arquivo…');
      const up = await sb.storage.from('agency-files').upload(file_path, file, { contentType: file.type || 'application/octet-stream' }); if (up.error) return toast('Falha ao enviar o arquivo');
    }
    const row = { chat_id: chat, sender_id: me.id, body: body || '', file_path, reply_to: S.reply || null };
    const { error } = await sb.from('agency_messages').insert(row); if (error) return toast('Não foi possível enviar');
    S.reply = null; const i = $('#ag-chat-input'); if (i) i.value = '';
  }
  function chatForm() {
    const others = S.members.filter(m => m.active && m.id !== me.id);
    modal('Nova conversa', `<div class="ag-chips" style="margin-bottom:6px"><button class="btn o s" data-ag="cf-kind" data-v="direct" aria-pressed="true">Direta</button><button class="btn o s" data-ag="cf-kind" data-v="group" aria-pressed="false">Grupo</button></div>
    <div id="cf-direct"><label for="cf-one">Com quem?</label><select id="cf-one">${others.map(m => `<option value="${m.id}">${esc(m.name)} — ${esc(m.role_title)}</option>`).join('')}</select></div>
    <div id="cf-group" hidden><label for="cf-name">Nome do grupo</label><input type="text" id="cf-name" maxlength="60"><label>Participantes</label><div class="ag-checks">${others.map(m => `<label class="ag-chk"><input type="checkbox" name="cm" value="${m.id}">${esc(m.name)}</label>`).join('')}</div>${isLeader() ? '<label class="ag-chk"><input type="checkbox" id="cf-all"> Grupo com todos da agência</label>' : ''}</div>
    <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="create-chat">Criar conversa</button></div>`, 'sm');
    modal.kind = 'direct';
  }
  async function createChat() {
    const id = uid();
    if (modal.kind === 'direct') {
      const other = $('#cf-one').value; if (!other) return toast('Escolha alguém');
      await dmNames(); const ex = S.chats.find(c => c.kind === 'direct' && S.dmOther[c.id] === (mem(other) || {}).name);
      if (ex) { closeModal(); return openChat(ex.id); }
      let r = await sb.from('agency_chats').insert({ id, name: '', kind: 'direct', everyone: false, created_by: me.id }); if (r.error) return toast('Não foi possível criar a conversa');
      r = await sb.from('agency_chat_members').insert([{ chat_id: id, member_id: me.id }, { chat_id: id, member_id: other }]); if (r.error) return toast('Não foi possível adicionar a pessoa');
    } else {
      const name = $('#cf-name').value.trim(); if (!name) return toast('Dê um nome ao grupo');
      const all = $('#cf-all') && $('#cf-all').checked, ids = [...document.querySelectorAll('input[name=cm]:checked')].map(i => i.value);
      if (!all && !ids.length) return toast('Escolha pelo menos uma pessoa');
      let r = await sb.from('agency_chats').insert({ id, name, kind: 'group', everyone: !!all, created_by: me.id }); if (r.error) return toast('Não foi possível criar o grupo');
      const rows = [me.id, ...(all ? [] : ids)].map(m => ({ chat_id: id, member_id: m })); r = await sb.from('agency_chat_members').insert(rows); if (r.error) return toast('Não foi possível adicionar os participantes');
      await notify(all ? allIds() : ids, `Você foi adicionado ao grupo ${name}`, 'chat:' + id);
    }
    log('criou uma conversa', '', 'chat'); closeModal(); S.dmOther = {}; await loadBase(); await dmNames(); await openChat(id); render();
  }
  async function chatManage(id) {
    const c = S.chats.find(x => x.id === id); if (!c) return;
    const cm = await sb.from('agency_chat_members').select('member_id').eq('chat_id', id), cur = (cm.data || []).map(x => x.member_id);
    modal('Gerenciar conversa', `${c.kind === 'group' ? `<label for="cm-name">Nome</label><input type="text" id="cm-name" value="${esc(c.name)}" maxlength="60">` : ''}
    ${c.kind === 'group' && !c.everyone ? `<label>Participantes</label><div class="ag-checks">${S.members.filter(m => m.active).map(m => `<label class="ag-chk"><input type="checkbox" name="cmm" value="${m.id}" ${cur.includes(m.id) ? 'checked' : ''} ${m.id === me.id ? 'disabled' : ''}>${esc(m.name)}</label>`).join('')}</div>` : ''}
    <div class="ag-btns"><button class="btn r" data-ag="ask-del-chat" data-id="${id}">Apagar conversa</button>${c.kind === 'group' ? `<button class="btn g" data-ag="save-chat" data-id="${id}" data-cur="${cur.join(',')}">Salvar</button>` : '<button class="btn o" data-ag="close">Fechar</button>'}</div>`, 'sm');
  }
  async function saveChat(id, cur) {
    const name = $('#cm-name').value.trim(); if (!name) return toast('Dê um nome ao grupo');
    await sb.from('agency_chats').update({ name }).eq('id', id);
    if (document.querySelector('input[name=cmm]')) {
      const want = [...document.querySelectorAll('input[name=cmm]:checked')].map(i => i.value), have = cur.split(',').filter(Boolean);
      const add = want.filter(x => !have.includes(x)), del = have.filter(x => !want.includes(x) && x !== me.id);
      if (add.length) { await sb.from('agency_chat_members').insert(add.map(m => ({ chat_id: id, member_id: m }))); await notify(add, `Você foi adicionado ao grupo ${name}`, 'chat:' + id); }
      if (del.length) await sb.from('agency_chat_members').delete().eq('chat_id', id).in('member_id', del);
    }
    closeModal(); toast('Conversa atualizada'); await loadBase(); render();
  }

  /* =====================================================  EQUIPE  */
  function vEquipe() {
    if (S.arg) return profile(S.arg === 'me' ? me.id : S.arg);
    const l = S.members.filter(m => m.active || isLeader());
    return `${head('Equipe', `${S.members.filter(m => m.active).length} pessoas na agência.`, isLeader() ? b('new-member', I('plus') + 'Novo membro', 'g') : '')}
    <div class="ag-team">${l.map(m => { const n = S.tasks.filter(t => t.assignees.includes(m.id) && t.status !== 'done').length; return `<button class="ag-mc ${m.active ? '' : 'off'}" data-ag="nav" data-v="equipe" data-id="${m.id}">${av(m, 54)}<div class="tx"><b>${esc(m.name)}${m.id === me.id ? ' <span class="badge" style="margin:0">Você</span>' : ''}</b><small>${esc(m.role_title)}</small><div class="ag-tm">${lv(m)}${m.active ? '' : '<span class="badge u" style="margin:0">Desativado</span>'}<span class="badge" style="margin:0">${n} em aberto</span></div></div></button>`; }).join('')}</div>`;
  }
  function profile(id) {
    const m = mem(id); if (!m) return `${head('Equipe', '')}${empty('Membro não encontrado.')}`;
    const mine = m.id === me.id, manage = isLeader() && !mine && (isSuper() || m.access_level === 'membro');
    const tk = S.tasks.filter(t => t.assignees.includes(m.id)), open = tk.filter(t => t.status !== 'done');
    return `<button class="ag-back" data-ag="nav" data-v="equipe">${I('left')}Equipe</button>
    <div class="row"><div class="panel ag-prof">${av(m, 96)}<h2>${esc(m.name)}</h2><div class="ag-tm" style="justify-content:center"><span class="badge d" style="margin:0">${esc(m.role_title)}</span>${lv(m)}</div><p class="ag-p">${m.bio ? esc(m.bio) : (mine ? 'Conte um pouco sobre você.' : 'Sem bio ainda.')}</p>
      ${mine ? `<div class="ag-btns c"><button class="btn g" data-ag="edit-profile">Editar meu perfil</button></div>` : ''}
      <div class="ag-info"><div><span>ID de acesso</span><b>${esc(m.code)}</b></div><div><span>Aniversário</span><b>${m.birthday ? dm(m.birthday) : '—'}</b></div><div><span>Na agência desde</span><b>${dmy(m.joined_at)}</b></div><div><span>Tarefas</span><b>${open.length} em aberto · ${tk.length - open.length} entregues</b></div></div></div>
      <div class="panel"><div class="panel-header"><h3>Tarefas de ${esc(first(m.name))}</h3></div>${open.slice(0, 8).map(t => `<button class="ag-line ag-btnrow" data-ag="task" data-id="${t.id}"><div class="tx"><b>${esc(t.title)}</b><small>${esc(t.category)} · ${ST.find(s => s[0] === t.status)[1]}${t.due_date ? ' · prazo ' + dm(t.due_date) : ''}</small></div></button>`).join('') || empty('Nenhuma tarefa em aberto.')}
      ${manage || (isLeader() && mine) ? `<div class="panel-header" style="margin-top:22px"><h3>Gerenciar</h3></div>${manageBox(m, mine)}` : ''}</div></div>`;
  }
  function manageBox(m, mine) {
    return `<label for="mnm">Nome</label><input type="text" id="mnm" value="${esc(m.name)}" maxlength="80"><label for="mr">Cargo</label><input type="text" id="mr" value="${esc(m.role_title)}" maxlength="40">
    ${isSuper() && !mine ? `<label for="ml">Nível de acesso</label><select id="ml">${Object.entries(LV).map(([k, l]) => `<option value="${k}" ${m.access_level === k ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}
    <label for="mbd">Aniversário</label><input type="date" id="mbd" value="${esc(m.birthday || '')}"><div class="ag-btns l"><button class="btn g" data-ag="save-member" data-id="${m.id}">Salvar</button>${mine ? '' : `<button class="btn o" data-ag="ask-reset" data-id="${m.id}">${I('key', 15)}Redefinir senha</button><button class="btn r" data-ag="ask-toggle" data-id="${m.id}" data-v="${m.active ? 0 : 1}">${m.active ? 'Desativar' : 'Reativar'}</button>${isSuper() ? `<button class="btn r" data-ag="ask-remove" data-id="${m.id}">Excluir de vez</button>` : ''}`}</div>`;
  }
  function memberForm() {
    modal('Novo membro', `<label for="mn">Nome</label><input type="text" id="mn" maxlength="80"><label for="mrole">Cargo</label><input type="text" id="mrole" list="ag-roles" value="Assistente" maxlength="40"><datalist id="ag-roles"><option>Assistente</option><option>Designer</option><option>Redator</option><option>Editor de vídeo</option><option>Social media</option></datalist>
    ${isSuper() ? `<label for="mlv">Nível de acesso</label><select id="mlv"><option value="membro">Membro</option><option value="lider">Líder</option><option value="super">Super Administrador</option></select>` : ''}<label for="mb">Aniversário (opcional)</label><input type="date" id="mb"><p class="ag-meta" style="margin-top:12px">O ID e a senha provisória são gerados automaticamente e aparecem uma única vez.</p><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="create-member">Criar membro</button></div>`, 'sm');
  }
  const ERR = { sem_permissao: 'sem permissão', nome_obrigatorio: 'escreva o nome', membro_nao_encontrado: 'membro não encontrado', nao_pode_alterar_a_si_mesmo: 'não dá para fazer isso na sua própria conta' };
  async function callMembers(body) {
    const { data, error } = await sb.functions.invoke('agencia-membros', { body });
    let d = data;
    if (error && !d) { try { d = await error.context.json(); } catch (e) { d = null; } }
    if (!d || d.error) { toast('Não foi possível concluir: ' + (ERR[d && d.error] || (d && d.error) || 'tente de novo')); return null; } return d;
  }
  const credModal = (title, r) => modal(title, `<p class="ag-p">Passe estes dados para <b>${esc(r.name)}</b>. A senha não será mostrada de novo.</p><div class="ag-cred"><small>ID</small><b>${esc(r.code)}</b><small style="margin-top:10px;display:block">Senha provisória</small><b>${esc(r.password)}</b></div><div class="ag-btns"><button class="btn o" data-ag="close">Fechar</button><button class="btn g" data-ag="copy" data-t="${esc(`ID: ${r.code}\nSenha: ${r.password}`)}">Copiar ID e senha</button></div>`, 'sm');
  function profileForm() {
    modal('Meu perfil', `<div class="ag-pr">${av(me, 64)}<input type="file" id="ag-pf" accept="image/*" hidden><button class="btn o s" data-ag="pick-photo">Trocar foto</button></div><label for="pn">Nome</label><input type="text" id="pn" value="${esc(me.name)}" maxlength="80"><label for="pb">Bio</label><textarea id="pb" rows="3" maxlength="300">${esc(me.bio)}</textarea><label for="pd">Aniversário</label><input type="date" id="pd" value="${esc(me.birthday || '')}"><div class="ag-btns"><button class="btn o" data-ag="pw-form">Trocar senha</button><button class="btn g" data-ag="save-profile">Salvar perfil</button></div>`, 'sm');
  }
  function square(f, size) { return new Promise((res, rej) => { const im = new Image(), u = URL.createObjectURL(f); im.onload = () => { const s = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = size; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, size, size); URL.revokeObjectURL(u); c.toBlob(x => x ? res(x) : rej(), 'image/jpeg', .88); }; im.onerror = rej; im.src = u; }); }
  async function uploadPhoto(f) {
    toast('Enviando foto…');
    try { const blob = await square(f, 512), path = `agency/${me.id}-${Date.now()}.jpg`; const up = await sb.storage.from('images').upload(path, blob, { contentType: 'image/jpeg' }); if (up.error) throw up.error; const url = sb.storage.from('images').getPublicUrl(path).data.publicUrl; const r = await sb.from('agency_members').update({ avatar_url: url }).eq('id', me.id); if (r.error) throw r.error; toast('Foto atualizada'); closeModal(); refresh(); host.onMe && host.onMe(); } catch (e) { toast('Não foi possível enviar a foto'); }
  }

  /* =====================================================  PEDIDOS  */
  function vPedidos() {
    const lead = isLeader(), all = lead ? S.reqs : S.reqs.filter(r => r.member_id === me.id);
    const l = all.filter(r => S.rFilter === 'todos' || r.status === S.rFilter);
    return `${head('Pedidos', lead ? 'Pedidos da equipe para a liderança: correções, exclusões e ajuda.' : 'Peça à liderança para corrigir ou excluir algo, ou peça ajuda.', b('new-request', I('plus') + 'Novo pedido', 'g'))}
    <div class="ag-chips" style="margin-bottom:14px">${[['aberto', 'Abertos'], ['resolvido', 'Resolvidos'], ['todos', 'Todos']].map(([v, t]) => `<button class="btn o s" data-ag="rfilter" data-v="${v}" aria-pressed="${S.rFilter === v}">${t} (${v === 'todos' ? all.length : all.filter(r => r.status === v).length})</button>`).join('')}</div>
    <div class="ag-stack">${l.map(r => { const m = mem(r.member_id); return `<article class="panel ag-req"><div class="ag-nh">${av(m, 34)}<div class="tx"><b>${esc(m ? m.name : 'Membro')}</b><small class="ag-meta">${when(r.created_at)}</small></div><span class="badge ${r.status === 'aberto' ? 'd' : ''}" style="margin:0">${REQ[r.kind]}</span><span class="badge ${r.status === 'aberto' ? 'u' : ''}" style="margin:0">${r.status === 'aberto' ? 'Aberto' : 'Resolvido'}</span></div><p class="ag-p pre">${esc(r.text)}</p>${lead ? `<div class="ag-btns l"><button class="btn ${r.status === 'aberto' ? 'g' : 'o'} s" data-ag="req-toggle" data-id="${r.id}">${r.status === 'aberto' ? 'Marcar como resolvido' : 'Reabrir'}</button><button class="btn r s" data-ag="ask-del-req" data-id="${r.id}">Excluir</button></div>` : ''}</article>`; }).join('') || `<div class="panel">${empty('Nenhum pedido por aqui.')}</div>`}</div>`;
  }
  function reqForm() {
    modal('Novo pedido', `<label for="rk">O que você precisa?</label><select id="rk">${Object.entries(REQ).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select><label for="rt">Explique com detalhes</label><textarea id="rt" rows="5" maxlength="1000" placeholder="Ex.: Corrigir meu aniversário, excluir o arquivo X, ajuda com…"></textarea><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-req">Enviar pedido</button></div>`, 'sm');
  }

  /* =====================================================  ATIVIDADE  */
  const AREAS = [['', 'Tudo'], ['acesso', 'Acesso'], ['tarefas', 'Tarefas'], ['avisos', 'Avisos'], ['arquivos', 'Arquivos'], ['chat', 'Conversas'], ['agenda', 'Agenda'], ['equipe', 'Equipe'], ['pedidos', 'Pedidos']];
  function vAtividade() {
    return `${head('Atividade', 'Registro do que cada pessoa fez na agência.')}<div class="panel ag-filters"><div class="ag-chips">${AREAS.map(([v, l]) => `<button class="btn o s" data-ag="afilter" data-v="${v}" aria-pressed="${S.aFilter === v}">${l}</button>`).join('')}</div><select id="ag-amem" aria-label="Pessoa"><option value="">Todas as pessoas</option>${S.members.map(m => `<option value="${m.id}" ${S.aMem === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div><div class="panel" id="ag-act"></div>`;
  }
  async function drawAct() {
    let q = sb.from('agency_activity').select('*').order('created_at', { ascending: false }).limit(150);
    if (S.aFilter) q = q.eq('area', S.aFilter); if (S.aMem) q = q.eq('member_id', S.aMem);
    const r = await q, box = $('#ag-act'); if (!box) return;
    box.innerHTML = (r.data || []).map(a => { const m = mem(a.member_id); return `<div class="ag-line">${av(m, 34)}<div class="tx"><b>${esc(m ? first(m.name) : 'Membro')} ${esc(a.action)}</b><small>${a.detail ? esc(a.detail) + ' · ' : ''}${when(a.created_at)}</small></div><span class="badge" style="margin:0">${esc(a.area)}</span></div>`; }).join('') || empty('Nada registrado ainda.');
  }


  /* =====================================================  NOTÍCIAS (redator)  */
  const DST = { rascunho: ['Rascunho', ''], enviado: ['Em revisão', 'd'], aprovado: ['Aprovada', ''], devolvido: ['Devolvida', 'u'] };
  const plain = t => String(t || '').replace(/\s+/g, ' ').trim();
  function safeUrl(u) { try { const x = new URL(String(u || '').trim()); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } }
  const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  async function vNoticias() {
    const r = await sb.from('agency_drafts').select('*').order('updated_at', { ascending: false }); S.drafts = r.data || [];
    const lead = isLeader(), mine = S.drafts.filter(d => d.author_id === me.id), rev = lead ? S.drafts.filter(d => d.status === 'enviado') : [];
    const others = lead ? S.drafts.filter(d => d.status !== 'enviado') : mine;
    const sub = lead ? 'Textos enviados pelos redatores para revisão.' : 'Escreva sua matéria, salve como rascunho e envie para a liderança revisar.';
    return `${head('Notícias', sub, isRedator() ? b('new-draft', I('plus') + 'Nova matéria', 'g') : '')}
    ${S.isAdm ? `<div class="ag-banner">${I('news')}<span>Para publicar no site, aprove a matéria e use <b>Passar para o editor</b>. Ela vira um rascunho no painel editorial.</span></div>` : ''}
    ${rev.length ? `<div class="panel-header"><h3>Para revisar</h3><span>${rev.length}</span></div><div class="ag-stack" style="margin-bottom:18px">${rev.map(draftCard).join('')}</div>` : ''}
    ${others.length ? `${lead ? '<div class="panel-header"><h3>Outras matérias</h3></div>' : ''}<div class="ag-stack">${others.map(draftCard).join('')}</div>` : (rev.length ? '' : `<div class="panel">${empty(isRedator() ? 'Nenhuma matéria ainda. Toque em “Nova matéria” para começar.' : 'Nenhuma matéria enviada ainda.')}</div>`)}`;
  }
  function draftCard(d) {
    const a = mem(d.author_id), st = DST[d.status] || DST.rascunho, own = d.author_id === me.id, lead = isLeader(), src = safeUrl(d.source_url);
    const ex = plain(d.body).slice(0, 170);
    return `<article class="panel ag-draft"><div class="ag-nh"><span class="badge ${st[1]}">${st[0]}</span><span class="ag-meta">${a ? esc(a.name) + ' · ' : ''}${when(d.updated_at)}</span></div>
      <h4>${esc(d.title)}</h4>${ex ? `<p class="ag-p">${esc(ex)}${plain(d.body).length > 170 ? '…' : ''}</p>` : ''}
      ${src ? `<a class="ag-src" href="${esc(src)}" target="_blank" rel="noopener noreferrer">${I('link', 14)}${esc(hostOf(src))}</a>` : ''}
      ${d.status === 'devolvido' && d.feedback ? `<div class="ag-banner">${I('reply')}<span><b>Ajustes pedidos:</b> ${esc(d.feedback)}</span></div>` : ''}
      <div class="ag-btns l">
        <button class="btn o s" data-ag="view-draft" data-id="${d.id}">Abrir</button>
        ${own && d.status !== 'aprovado' ? `<button class="btn o s" data-ag="edit-draft" data-id="${d.id}">Editar</button>` : ''}
        ${own && (d.status === 'rascunho' || d.status === 'devolvido') ? `<button class="btn g s" data-ag="send-draft" data-id="${d.id}">Enviar para revisão</button>` : ''}
        ${lead && d.status === 'enviado' ? `<button class="btn g s" data-ag="approve-draft" data-id="${d.id}">Aprovar</button><button class="btn o s" data-ag="return-draft" data-id="${d.id}">Devolver</button>` : ''}
        ${S.isAdm && d.status === 'aprovado' ? `<button class="btn g s" data-ag="to-editor" data-id="${d.id}">Passar para o editor</button>` : ''}
        ${(own && d.status !== 'aprovado') || lead ? `<button class="btn r s" data-ag="ask-del-draft" data-id="${d.id}">Excluir</button>` : ''}
      </div></article>`;
  }
  function draftForm(id) {
    const d = id ? S.drafts.find(x => x.id === id) : { title: '', body: '', source_url: '' };
    modal(id ? 'Editar matéria' : 'Nova matéria', `<label for="dt">Título</label><input type="text" id="dt" maxlength="200" value="${esc(d.title)}" placeholder="Título da matéria">
      <label for="db">Texto</label><textarea id="db" rows="12" maxlength="60000" placeholder="Escreva a matéria aqui. Use uma linha em branco para separar os parágrafos.">${esc(d.body)}</textarea>
      <label for="ds">Link da fonte (opcional)</label><input type="url" id="ds" maxlength="1000" value="${esc(d.source_url)}" placeholder="https://…">
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn o" data-ag="save-draft" data-id="${id || ''}">Salvar rascunho</button><button class="btn g" data-ag="save-draft" data-id="${id || ''}" data-send="1">Salvar e enviar</button></div>`, 'wide');
  }
  async function saveDraft(id, send) {
    const title = $('#dt').value.trim(), body = $('#db').value.trim(), raw = $('#ds').value.trim(), src = raw ? safeUrl(raw) : '';
    if (!title) return toast('Escreva um título'); if (raw && !src) return toast('O link da fonte precisa começar com https://');
    if (send && body.length < 20) return toast('Escreva o texto antes de enviar');
    const p = { title, body, source_url: src, status: send ? 'enviado' : 'rascunho', feedback: '', updated_at: new Date().toISOString() };
    const r = id ? await sb.from('agency_drafts').update(p).eq('id', id) : await sb.from('agency_drafts').insert({ ...p, author_id: me.id });
    if (r.error) return toast('Não foi possível salvar'); log(send ? 'enviou uma matéria para revisão' : 'salvou um rascunho', title, 'noticias');
    if (send) await notify(leaderIds().filter(x => x !== me.id), `${first(me.name)} enviou a matéria “${title}” para revisão`, 'noticias');
    closeModal(); toast(send ? 'Enviada para revisão' : 'Rascunho salvo'); return go('noticias');
  }
  async function setDraft(id, patch, msg, note) {
    const d = S.drafts.find(x => x.id === id); const r = await sb.from('agency_drafts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (r.error) return toast('Não foi possível atualizar'); if (note && d) await notify([d.author_id], note.replace('{t}', d.title), 'noticias');
    closeModal(); toast(msg); return go('noticias');
  }
  function viewDraft(id) {
    const d = S.drafts.find(x => x.id === id); if (!d) return; const a = mem(d.author_id), st = DST[d.status] || DST.rascunho, src = safeUrl(d.source_url);
    modal(d.title, `<div class="ag-tm"><span class="badge ${st[1]}">${st[0]}</span><span class="ag-meta">${a ? esc(a.name) + ' · ' : ''}${when(d.updated_at)}</span></div>
      <p class="ag-p pre" style="margin-top:14px">${esc(d.body) || '—'}</p>${src ? `<a class="ag-src" href="${esc(src)}" target="_blank" rel="noopener noreferrer">${I('link', 14)}${esc(src)}</a>` : ''}
      <div class="ag-btns l"><button class="btn o s" data-ag="copy" data-t="${esc(d.title + '\n\n' + d.body)}">${I('copy', 14)}Copiar texto</button></div>`, 'wide');
  }
  async function toEditor(id) {
    const d = S.drafts.find(x => x.id === id); if (!d) return; const a = mem(d.author_id), src = safeUrl(d.source_url);
    const paras = String(d.body).split(/\n{2,}/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`);
    if (src) paras.push(`<p>Fonte: <a href="${esc(src)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(src))}</a></p>`);
    const content = paras.join(''), summary = plain(d.body).slice(0, 180);
    const slug = norm(d.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) + '-' + Math.random().toString(36).slice(2, 6);
    const r = await sb.from('articles').insert({ title: d.title, summary, content, author: a ? a.name : 'Redação Central do FFC', slug, published: false });
    if (r.error) return toast('Não foi possível criar no editor'); log('passou uma matéria para o editor', d.title, 'noticias');
    toast('Criada como rascunho no painel editorial');
  }

  /* =====================================================  MODELOS (designer)  */
  const TPL_CATS = ['Placar', 'Escalação', 'Notícia', 'Story', 'Thumb', 'Capa', 'Geral'];
  const tplKind = u => { const h = hostOf(u); return /canva/.test(h) ? 'Canva' : /figma/.test(h) ? 'Figma' : /drive\.google|docs\.google/.test(h) ? 'Drive' : /photoshop|adobe/.test(h) ? 'Adobe' : h || 'Link'; };
  async function vModelos() {
    const r = await sb.from('agency_templates').select('*').order('created_at', { ascending: false }); S.tpls = r.data || [];
    const cats = [...new Set(S.tpls.map(t => t.category))].sort();
    return `${head('Modelos de design', 'Artes prontas da agência. Abra o modelo, copie o link ou anexe um novo.', b('new-tpl', I('link') + 'Anexar link', 'g'))}
    <div class="panel ag-filters"><div class="ag-search">${I('search')}<input type="search" id="ag-mq" placeholder="Buscar modelo…" value="${esc(S.mQ)}" aria-label="Buscar modelo"></div>
      <div class="ag-chips"><button class="btn o s" data-ag="mcat" data-v="" aria-pressed="${S.mCat === ''}">Todos</button>${cats.map(c => `<button class="btn o s" data-ag="mcat" data-v="${esc(c)}" aria-pressed="${S.mCat === c}">${esc(c)}</button>`).join('')}</div></div>
    <div id="ag-tpl"></div>`;
  }
  function drawTpls() {
    const box = $('#ag-tpl'); if (!box) return; const q = norm(S.mQ);
    const l = S.tpls.filter(t => (!S.mCat || t.category === S.mCat) && (!q || norm(t.title + ' ' + t.note + ' ' + t.category).includes(q)));
    box.innerHTML = l.length ? `<div class="ag-tpls">${l.map(t => { const u = mem(t.created_by), can = isLeader() || t.created_by === me.id;
      return `<article class="ag-tpl"><div class="ag-tpl-top"><span class="ag-tpl-ic">${I('layout', 24)}</span><span class="badge">${esc(t.category)}</span></div>
        <b>${esc(t.title)}</b>${t.note ? `<p>${esc(t.note)}</p>` : ''}<small>${esc(tplKind(t.url))}${u ? ' · ' + esc(first(u.name)) : ''}</small>
        <div class="ag-btns l"><a class="btn g s" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">${I('ext', 14)}Abrir</a><button class="btn o s" data-ag="copy" data-t="${esc(t.url)}">${I('copy', 14)}Copiar link</button>
        ${can ? `<button class="ag-mini" data-ag="edit-tpl" data-id="${t.id}" aria-label="Editar">${I('edit', 15)}</button><button class="ag-mini" data-ag="ask-del-tpl" data-id="${t.id}" aria-label="Excluir">${I('trash', 15)}</button>` : ''}</div></article>`; }).join('')}</div>`
      : `<div class="panel">${empty(S.tpls.length ? 'Nenhum modelo com esse filtro.' : 'Nenhum modelo ainda. Toque em “Anexar link” para adicionar o primeiro.')}</div>`;
  }
  function tplForm(id) {
    const t = id ? S.tpls.find(x => x.id === id) : { title: '', url: '', category: 'Geral', note: '' };
    const cats = [...new Set([...TPL_CATS, ...S.tpls.map(x => x.category)])];
    modal(id ? 'Editar modelo' : 'Anexar link de modelo', `<label for="mt">Nome do modelo</label><input type="text" id="mt" maxlength="120" value="${esc(t.title)}" placeholder="Ex.: Placar de jogo (story)">
      <label for="mu">Link</label><input type="url" id="mu" maxlength="1000" value="${esc(t.url)}" placeholder="https://www.canva.com/…">
      <label for="mc">Categoria</label><input type="text" id="mc" maxlength="40" list="mc-l" value="${esc(t.category)}"><datalist id="mc-l">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <label for="mn">Observação (opcional)</label><textarea id="mn" rows="3" maxlength="500" placeholder="Para que serve, tamanho, fontes usadas…">${esc(t.note)}</textarea>
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-tpl" data-id="${id || ''}">Salvar</button></div>`, 'sm');
  }
  async function saveTpl(id) {
    const title = $('#mt').value.trim(), url = safeUrl($('#mu').value), category = $('#mc').value.trim() || 'Geral', note = $('#mn').value.trim();
    if (!title) return toast('Dê um nome ao modelo'); if (!url) return toast('Cole um link que comece com https://');
    const r = id ? await sb.from('agency_templates').update({ title, url, category, note }).eq('id', id) : await sb.from('agency_templates').insert({ title, url, category, note, created_by: me.id });
    if (r.error) return toast('Não foi possível salvar'); log(id ? 'editou um modelo' : 'anexou um modelo de design', title, 'modelos'); closeModal(); toast('Modelo salvo'); return go('modelos');
  }


  /* =====================================================  APURAÇÃO DE TRANSFERÊNCIAS  */
  const APST = { monitorado: ['Monitorado', ''], sondagem: ['Sondagem', 'f'], negociacao: ['Negociação', 'd'], avancado: ['Avançado', 'd'], confirmado: ['Confirmado', ''], descartado: ['Descartado', 'u'] };
  const CK = { instagram: 'Instagram', voo: 'Voo público', mercado: 'Mercado', noticia: 'Notícia', empresario: 'Empresário', outro: 'Outro' };
  const SRC = { oficial: ['Oficial (clube, federação, atleta)', 1], imprensa: ['Imprensa identificada', .7], fonte_proxima: ['Fonte próxima', .6], rede_social: ['Rede social pública', .4], observacao: ['Observação própria', .3] };
  const fdate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
  const daysTo = d => d ? Math.round((new Date(d + 'T12:00:00') - Date.now()) / 864e5) : null;
  const igName = h => String(h || '').trim().replace(/^@/, '');
  const igUrl = h => { h = igName(h); return /^[A-Za-z0-9._]{1,30}$/.test(h) ? 'https://instagram.com/' + h : ''; };
  const playerSearchUrl = (name, site) => 'https://www.google.com/search?q=' + encodeURIComponent('site:' + site + ' ' + String(name || '').trim() + ' jogador');
  function playerSearchLinks(t) {
    if (!String(t.name || '').trim()) return '';
    return `<div class="panel-header" style="margin-top:14px"><h3>Ficha do jogador</h3></div>
      <p class="ag-meta">Busque o nome no oGol ou no Transfermarkt pelo Google. Confira o clube e a posição para identificar o jogador correto.</p>
      <div class="ag-btns l"><a class="btn g s" href="${esc(playerSearchUrl(t.name, 'ogol.com.br'))}" target="_blank" rel="noopener noreferrer" aria-label="Buscar ${esc(t.name)} no oGol pelo Google (nova aba)">${I('search', 14)}Buscar no oGol</a><a class="btn o s" href="${esc(playerSearchUrl(t.name, 'transfermarkt.com.br'))}" target="_blank" rel="noopener noreferrer" aria-label="Buscar ${esc(t.name)} no Transfermarkt pelo Google (nova aba)">${I('search', 14)}Buscar no Transfermarkt</a></div>`;
  }
  const RUMOR = /(interesse|negoci|acert|sonda|proposta|chega|refor[cç]o|contrat|empr[eé]stimo|apresent|rescis|libera)/i;
  const tgOf = id => S.tg.find(t => t.id === id), agOf = id => S.agn.find(a => a.id === id);
  const optsOf = (arr, sel, lab) => arr.map(([k, l]) => `<option value="${esc(k)}" ${k === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');

  /* cruzamento de indícios: pesa fonte, confiança dada por quem registrou, recência e contradições. Nunca passa de "indício". */
  function analyze(t) {
    const cl = S.cl.filter(c => c.target_id === t.id), now = Date.now(); let pf = 1, pa = 1; const fav = [], con = [];
    cl.forEach(c => {
      const age = (now - new Date(c.happened_at + 'T12:00:00')) / 864e5, rec = age <= 14 ? 1 : age <= 45 ? .8 : age <= 90 ? .55 : .3;
      const w = (SRC[c.source_type] || SRC.observacao)[1] * (c.reliability / 5) * rec;
      if (c.stance === 'favor') { pf *= 1 - w; fav.push(c); } else if (c.stance === 'contra') { pa *= 1 - w; con.push(c); }
    });
    const indep = new Set(fav.map(c => hostOf(c.source_url) || c.source_type)).size, hasOff = cl.some(c => c.source_type === 'oficial' && c.stance === 'favor'), hasPress = fav.some(c => c.source_type === 'imprensa');
    let sc = Math.max(0, (1 - pf) - (1 - pa) * .8); const why = [];
    if (!fav.length) why.push('Nenhum indício a favor ainda');
    else { why.push(`${fav.length} indício${fav.length > 1 ? 's' : ''} a favor, ${indep} fonte${indep > 1 ? 's' : ''} independente${indep > 1 ? 's' : ''}`); if (indep < 2) { sc = Math.min(sc, .5); why.push('Só uma fonte: confirme com outra'); } if (!hasOff && !hasPress) { sc = Math.min(sc, .45); why.push('Sem fonte oficial nem imprensa identificada'); } }
    if (con.length) why.push(`${con.length} indício${con.length > 1 ? 's' : ''} contra`);
    if (!hasOff) sc = Math.min(sc, .6); else sc = Math.min(sc, .95);
    const last = cl[0] ? Math.round((now - new Date(cl[0].happened_at + 'T12:00:00')) / 864e5) : null;
    if (last !== null) why.push(last <= 0 ? 'Última pista é de hoje' : `Última pista há ${last} dia${last > 1 ? 's' : ''}`);
    const dl = daysTo(t.contract_until); if (t.free_agent) why.push('Atleta livre no mercado'); else if (dl !== null) why.push(dl < 0 ? 'Contrato vencido' : dl <= 180 ? `Contrato termina em ${dl} dias` : null);
    return { sc, label: sc < .35 ? 'Baixa' : sc < .65 ? 'Média' : 'Alta', why: why.filter(Boolean), n: cl.length, hasOff };
  }
  const meter = (a) => `<div class="ag-meter" title="Confiabilidade do conjunto de indícios"><i style="width:${Math.round(a.sc * 100)}%"></i></div>`;

  async function vApuracao() {
    const [a, g, c, iw] = await Promise.all([sb.from('agency_targets').select('*').order('updated_at', { ascending: false }), sb.from('agency_agents').select('*').order('name'), sb.from('agency_clues').select('*').order('happened_at', { ascending: false }).order('created_at', { ascending: false }), sb.from('agency_ig_watch').select('*').order('created_at', { ascending: false })]);
    S.tg = a.data || []; S.agn = g.data || []; S.cl = c.data || []; S.igw = iw.data || [];
    return `${head('Apuração de transferências', 'Investigação de possíveis reforços do Feira FC. Indício não é confirmação.', b('new-tg', I('plus') + 'Novo atleta', 'g'))}
    <div class="ag-banner">${I('lock')}<span>Registre só informação pública e com fonte. Nunca dados pessoais nem nomes de passageiros de voos.</span></div>
    <div id="ag-ap"></div>`;
  }
  function drawAp() {
    const box = $('#ag-ap'); if (!box) return; const A = S.ap;
    const tabs = [['painel', 'Painel'], ['historico', 'Histórico'], ['instagram', 'Instagram'], ['mercado', 'Mercado'], ['noticias', 'Notícias'], ['empresarios', 'Empresários']];
    const bar = `<div class="ag-aptabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-ag="ap-tab" data-v="${k}" aria-selected="${A.tab === k}">${l}</button>`).join('')}</div>`;
    box.innerHTML = bar + ({ painel: apPainel, historico: apHist, instagram: apInsta, mercado: apMercado, noticias: apNews, empresarios: apAgents }[A.tab] || apPainel)();
  }
  function tgCard(t) {
    const a = analyze(t), st = APST[t.status], ag = agOf(t.agent_id), dl = daysTo(t.contract_until);
    return `<button class="ag-tgc" data-ag="open-tg" data-id="${t.id}"><div class="ag-nh"><span class="badge ${st[1]}">${st[0]}</span>${t.free_agent ? '<span class="badge f">Livre</span>' : ''}<span class="ag-meta" style="margin-left:auto">${a.n} pista${a.n === 1 ? '' : 's'}</span></div>
      <b>${esc(t.name)}</b><small>${esc([t.position, t.club].filter(Boolean).join(' · ') || 'Sem clube informado')}</small>
      ${meter(a)}<div class="ag-nh"><small>Confiabilidade: <b>${a.label}</b> (${Math.round(a.sc * 100)}%)</small>${dl !== null && !t.free_agent ? `<small style="margin-left:auto">${dl < 0 ? 'Contrato vencido' : 'Contrato: ' + fdate(t.contract_until)}</small>` : ''}</div>
      ${ag ? `<small>Empresário: ${esc(ag.name)}</small>` : ''}</button>`;
  }
  function apPainel() {
    const A = S.ap, q = norm(A.q), cnt = k => S.tg.filter(t => !k || t.status === k).length;
    const l = S.tg.filter(t => (!A.st || t.status === A.st) && (!q || norm(t.name + ' ' + t.club + ' ' + t.position).includes(q)));
    return `<div class="panel ag-filters"><div class="ag-search">${I('search')}<input type="search" id="ag-apq" placeholder="Buscar atleta, clube ou posição…" value="${esc(A.q)}" aria-label="Buscar atleta"></div>
      <div class="ag-chips"><button class="btn o s" data-ag="ap-st" data-v="" aria-pressed="${A.st === ''}">Todos ${cnt('')}</button>${Object.keys(APST).map(k => `<button class="btn o s" data-ag="ap-st" data-v="${k}" aria-pressed="${A.st === k}">${APST[k][0]} ${cnt(k)}</button>`).join('')}</div></div>
    <div id="ag-aplist">${apList(l)}</div>`;
  }
  const apList = l => l.length ? `<div class="ag-tgs">${l.map(tgCard).join('')}</div>` : `<div class="panel">${empty(S.tg.length ? 'Nenhum atleta com esse filtro.' : 'Nenhum atleta investigado ainda. Toque em “Novo atleta” para começar.')}</div>`;
  function apHist() {
    const A = S.ap, l = S.cl.filter(c => (!A.kind || c.kind === A.kind) && (!A.tgt || c.target_id === A.tgt));
    return `<div class="panel ag-filters"><div class="ag-chips"><button class="btn o s" data-ag="ap-kind" data-v="" aria-pressed="${A.kind === ''}">Tudo</button>${Object.keys(CK).map(k => `<button class="btn o s" data-ag="ap-kind" data-v="${k}" aria-pressed="${A.kind === k}">${CK[k]}</button>`).join('')}</div>
      <select id="ag-aptg" aria-label="Filtrar por atleta"><option value="">Todos os atletas</option>${S.tg.map(t => `<option value="${t.id}" ${A.tgt === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
    <div class="ag-btns l" style="margin:0 0 14px"><button class="btn g s" data-ag="new-clue" data-kind="instagram">${I('plus', 14)}Instagram</button><button class="btn g s" data-ag="new-clue" data-kind="voo">${I('plus', 14)}Voo público</button><button class="btn o s" data-ag="new-clue" data-kind="outro">${I('plus', 14)}Outra pista</button></div>
    ${l.length ? `<div class="ag-stack">${l.map(clueRow).join('')}</div>` : `<div class="panel">${empty('Nenhuma pista registrada com esse filtro.')}</div>`}`;
  }
  function clueRow(c, inModal) {
    const t = tgOf(c.target_id), u = mem(c.created_by), src = safeUrl(c.source_url), can = c.created_by === me.id || isLeader(), sty = c.stance === 'favor' ? '' : c.stance === 'contra' ? 'u' : 'f';
    return `<article class="panel ag-clue"><div class="ag-nh"><span class="badge">${CK[c.kind] || 'Outro'}</span><span class="badge ${sty}">${c.stance === 'favor' ? 'A favor' : c.stance === 'contra' ? 'Contra' : 'Neutra'}</span><span class="ag-meta">${fdate(c.happened_at)}</span></div>
      ${!inModal && t ? `<button class="ag-src" data-ag="open-tg" data-id="${t.id}">${esc(t.name)}</button>` : ''}
      <p class="ag-p pre">${esc(c.text)}</p>
      <div class="ag-nh"><small class="ag-meta">${esc((SRC[c.source_type] || SRC.observacao)[0])} · confiança ${c.reliability}/5${u ? ' · ' + esc(first(u.name)) : ''}</small>${src ? `<a class="ag-src" href="${esc(src)}" target="_blank" rel="noopener noreferrer">${I('link', 14)}${esc(hostOf(src))}</a>` : ''}
      ${can ? `<span style="margin-left:auto;display:flex"><button class="ag-mini" data-ag="edit-clue" data-id="${c.id}" aria-label="Editar pista">${I('edit', 15)}</button><button class="ag-mini" data-ag="ask-del-clue" data-id="${c.id}" aria-label="Excluir pista">${I('trash', 15)}</button></span>` : ''}</div></article>`;
  }
  function apMercado() {
    const A = S.ap, r = t => daysTo(t.contract_until);
    let l = S.tg.filter(t => t.status !== 'descartado' && t.status !== 'confirmado');
    if (A.mk === 'livres') l = l.filter(t => t.free_agent); else if (A.mk === 'vencendo') l = l.filter(t => !t.free_agent && r(t) !== null && r(t) <= 180);
    l.sort((x, y) => (r(x) ?? 9999) - (r(y) ?? 9999));
    const chip = (k, lab) => `<button class="btn o s" data-ag="ap-mk" data-v="${k}" aria-pressed="${A.mk === k}">${lab}</button>`;
    return `<div class="panel ag-filters"><div class="ag-chips">${chip('livres', 'Atletas livres')}${chip('vencendo', 'Contrato até 6 meses')}${chip('todos', 'Todos')}</div></div>
    ${l.length ? `<div class="ag-stack">${l.map(t => { const d = r(t), ag = agOf(t.agent_id); return `<button class="panel ag-mk" data-ag="open-tg" data-id="${t.id}"><div class="tx"><b>${esc(t.name)}</b><small>${esc([t.position, t.club].filter(Boolean).join(' · ') || 'Sem clube')}${ag ? ' · ' + esc(ag.name) : ''}</small></div>${t.free_agent ? '<span class="badge f">Livre</span>' : d === null ? '<span class="ag-meta">Sem data</span>' : `<span class="badge ${d < 0 ? 'u' : d <= 90 ? 'd' : ''}">${d < 0 ? 'Vencido' : 'em ' + d + ' dias'}</span>`}</button>`; }).join('')}</div>` : `<div class="panel">${empty('Nenhum atleta nesse recorte. Cadastre o contrato ou marque como livre no cadastro do atleta.')}</div>`}`;
  }
  function apNews() {
    const A = S.ap, n = A.news;
    return `<div class="panel ag-filters"><div class="ag-search">${I('search')}<input type="search" id="ag-nq" placeholder="Ex.: Feira FC, nome do atleta…" value="${esc(A.nq)}" aria-label="Buscar notícias"></div><button class="btn g" data-ag="ap-news" ${A.busy ? 'disabled' : ''}>${A.busy ? 'Buscando…' : 'Buscar notícias'}</button></div>
    <p class="ag-meta" style="margin:0 0 12px">Busca nas notícias públicas dos últimos 30 dias. Rumores aparecem sinalizados e só viram pista quando você registra com a fonte.</p>
    ${n === null ? `<div class="panel">${empty('Digite um nome e toque em “Buscar notícias”.')}</div>` : n.length ? `<div class="ag-stack">${n.map((x, i) => `<article class="panel ag-clue"><div class="ag-nh">${RUMOR.test(x.title) ? '<span class="badge d">Possível rumor</span>' : '<span class="badge">Citação</span>'}<span class="ag-meta">${esc(x.source || hostOf(x.link))}${x.date ? ' · ' + esc(new Date(x.date).toLocaleDateString('pt-BR')) : ''}</span></div><p class="ag-p">${esc(x.title)}</p>
      <div class="ag-btns l"><a class="btn o s" href="${esc(x.link)}" target="_blank" rel="noopener noreferrer">${I('ext', 14)}Abrir</a><button class="btn g s" data-ag="news-clue" data-v="${i}">Virar pista</button></div></article>`).join('')}</div>` : `<div class="panel">${empty('Nada encontrado para essa busca.')}</div>`}`;
  }
  async function runNews() {
    const q = ($('#ag-nq') ? $('#ag-nq').value : S.ap.nq).trim(); if (q.length < 2) return toast('Digite pelo menos 2 letras'); S.ap.nq = q; S.ap.busy = true; drawAp();
    let items = null; try { const r = await sb.functions.invoke('news-radar', { body: { q } }); if (!r.error && r.data && Array.isArray(r.data.items)) items = r.data.items; } catch {}
    S.ap.busy = false; if (items === null) { toast('Não foi possível buscar agora'); S.ap.news = []; } else S.ap.news = items; drawAp();
  }
  function apAgents() {
    return `<div class="ag-btns l" style="margin:0 0 14px"><button class="btn g s" data-ag="new-agent">${I('plus', 14)}Novo empresário</button></div>
    ${S.agn.length ? `<div class="ag-tgs">${S.agn.map(a => { const ts = S.tg.filter(t => t.agent_id === a.id), url = igUrl(a.instagram), can = a.created_by === me.id || isLeader();
      return `<article class="panel ag-tgc2"><b>${esc(a.name)}</b><small>${esc(a.company || 'Sem empresa informada')}</small>${url ? `<a class="ag-src" href="${url}" target="_blank" rel="noopener noreferrer">${I('link', 14)}@${esc(igName(a.instagram))}</a>` : ''}
      <p class="ag-meta">${ts.length ? 'Atletas: ' + ts.map(t => `<button class="ag-src" data-ag="open-tg" data-id="${t.id}">${esc(t.name)}</button>`).join(', ') : 'Nenhum atleta ligado ainda'}</p>${a.notes ? `<p class="ag-p">${esc(a.notes)}</p>` : ''}
      <div class="ag-btns l"><button class="btn o s" data-ag="edit-agent" data-id="${a.id}">Editar</button>${can ? `<button class="btn r s" data-ag="ask-del-agent" data-id="${a.id}">Excluir</button>` : ''}</div></article>`; }).join('')}</div>` : `<div class="panel">${empty('Nenhum empresário cadastrado. Cadastre para ligar aos atletas e ver os vínculos.')}</div>`}`;
  }

  /* ficha do atleta */
  function openTg(id) {
    const t = tgOf(id); if (!t) return; const a = analyze(t), ag = agOf(t.agent_id), cl = S.cl.filter(c => c.target_id === id), igu = igUrl(t.instagram), dl = daysTo(t.contract_until);
    modal(t.name, `<div class="ag-tm"><span class="badge ${APST[t.status][1]}">${APST[t.status][0]}</span>${t.free_agent ? '<span class="badge f">Livre</span>' : ''}<span class="ag-meta">${esc([t.position, t.club].filter(Boolean).join(' · '))}</span></div>
      <label>Status da apuração</label><div class="ag-chips">${Object.keys(APST).map(k => `<button class="btn o s" data-ag="set-st" data-id="${id}" data-v="${k}" aria-pressed="${t.status === k}">${APST[k][0]}</button>`).join('')}</div>
      <div class="ag-an"><div class="ag-nh"><b>Cruzamento de indícios</b><span class="badge ${a.sc < .35 ? 'u' : a.sc < .65 ? 'd' : ''}" style="margin-left:auto">Confiabilidade ${a.label} · ${Math.round(a.sc * 100)}%</span></div>${meter(a)}
        <ul>${a.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul><small class="ag-meta">Isto mede o peso dos indícios, não confirma nada. “Confirmado” exige fonte oficial.</small></div>
      <div class="ag-info">${t.contract_until ? `<div><span>Contrato até</span><b>${fdate(t.contract_until)}${dl !== null ? ` (${dl < 0 ? 'vencido' : dl + ' dias'})` : ''}</b></div>` : ''}${ag ? `<div><span>Empresário</span><b>${esc(ag.name)}</b></div>` : ''}${igu ? `<div><span>Instagram</span><b><a class="ag-src" href="${igu}" target="_blank" rel="noopener noreferrer">@${esc(igName(t.instagram))}</a></b></div>` : ''}</div>
      ${playerSearchLinks(t)}
      ${t.notes ? `<p class="ag-p pre">${esc(t.notes)}</p>` : ''}
      <div class="panel-header" style="margin-top:14px"><h3>Pistas (${cl.length})</h3><button class="btn s" data-ag="new-clue" data-id="${id}">${I('plus', 14)}Nova pista</button></div>
      <div class="ag-stack">${cl.length ? cl.map(c => clueRow(c, true)).join('') : empty('Sem pistas ainda.')}</div>
      <div class="ag-btns"><button class="btn o" data-ag="edit-tg" data-id="${id}">Editar</button>${t.created_by === me.id || isLeader() ? `<button class="btn r" data-ag="ask-del-tg" data-id="${id}">Excluir</button>` : ''}</div>`, 'wide');
  }
  async function setSt(id, k) {
    const t = tgOf(id); if (!t || t.status === k) return;
    if (k === 'confirmado' && !analyze(t).hasOff) return toast('Para confirmar, registre antes uma pista com fonte oficial a favor');
    const r = await sb.from('agency_targets').update({ status: k, updated_at: new Date().toISOString() }).eq('id', id); if (r.error) return toast('Não foi possível mudar o status');
    log('mudou o status de ' + t.name + ' para ' + APST[k][0], '', 'apuracao');
    if (['avancado', 'confirmado'].includes(k)) await notify(leaderIds().filter(x => x !== me.id), `${t.name} agora está como “${APST[k][0]}” na apuração`, 'apuracao');
    toast('Status atualizado'); await go('apuracao'); openTg(id);
  }
  function tgForm(id) {
    const t = id ? tgOf(id) : { name: '', position: '', club: '', contract_until: '', free_agent: false, instagram: '', agent_id: '', status: 'monitorado', notes: '' };
    modal(id ? 'Editar atleta' : 'Novo atleta', `<label for="tn">Nome</label><input type="text" id="tn" maxlength="120" value="${esc(t.name)}">
      <div class="ag-two"><div><label for="tp">Posição</label><input type="text" id="tp" maxlength="40" value="${esc(t.position)}" placeholder="Ex.: Atacante"></div><div><label for="tc">Clube atual</label><input type="text" id="tc" maxlength="80" value="${esc(t.club)}"></div></div>
      <div class="ag-two"><div><label for="td">Contrato até</label><input type="date" id="td" value="${esc(t.contract_until || '')}"></div><div><label for="ti">Instagram (público)</label><input type="text" id="ti" maxlength="40" value="${esc(t.instagram)}" placeholder="@perfil"></div></div>
      <label class="ag-chk"><input type="checkbox" id="tf" ${t.free_agent ? 'checked' : ''}>Atleta livre no mercado</label>
      <label for="ta">Empresário</label><select id="ta"><option value="">Nenhum</option>${S.agn.map(a => `<option value="${a.id}" ${t.agent_id === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
      ${id ? '' : `<label for="ts">Status inicial</label><select id="ts">${optsOf(Object.keys(APST).filter(k => k !== 'confirmado').map(k => [k, APST[k][0]]), 'monitorado')}</select>`}
      <label for="tt">Observações</label><textarea id="tt" rows="3" maxlength="2000">${esc(t.notes)}</textarea>
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-tg" data-id="${id || ''}">Salvar</button></div>`, 'wide');
  }
  async function saveTg(id) {
    const name = $('#tn').value.trim(); if (!name) return toast('Informe o nome do atleta');
    const p = { name, position: $('#tp').value.trim(), club: $('#tc').value.trim(), contract_until: $('#td').value || null, free_agent: $('#tf').checked, instagram: igName($('#ti').value), agent_id: $('#ta').value || null, notes: $('#tt').value.trim(), updated_at: new Date().toISOString() };
    if (!id) p.status = $('#ts').value;
    const r = id ? await sb.from('agency_targets').update(p).eq('id', id) : await sb.from('agency_targets').insert({ ...p, created_by: me.id });
    if (r.error) return toast('Não foi possível salvar'); log(id ? 'editou o atleta ' + name : 'começou a apurar ' + name, '', 'apuracao'); closeModal(); toast('Atleta salvo'); return go('apuracao');
  }
  function clueForm(id, kind, pre) {
    const c = id ? S.cl.find(x => x.id === id) : { target_id: pre.tid || '', kind: kind || 'outro', stance: pre.stance || 'favor', source_type: pre.src || 'observacao', reliability: pre.rel || 3, text: pre.text || '', source_url: pre.url || '', happened_at: pre.date || new Date().toISOString().slice(0, 10) };
    if (!S.tg.length) return toast('Cadastre um atleta antes de registrar pistas');
    const hint = { instagram: 'Ex.: Perfil @clube começou a seguir o atleta. Só ações públicas (seguiu, curtiu, comentou).', voo: 'Ex.: Voo G3 1234, Campinas → Feira de Santana, 05/11 14:20. Só dados públicos do voo. Nunca nomes de passageiros.' }[c.kind] || 'O que foi observado, de forma objetiva.';
    modal(id ? 'Editar pista' : 'Nova pista', `<label for="cg">Atleta</label><select id="cg" ${id ? 'disabled' : ''}><option value="">Escolha…</option>${S.tg.map(t => `<option value="${t.id}" ${c.target_id === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
      <div class="ag-two"><div><label for="ck">Tipo</label><select id="ck">${optsOf(Object.entries(CK), c.kind)}</select></div><div><label for="cs">Aponta</label><select id="cs">${optsOf([['favor', 'A favor da chegada'], ['contra', 'Contra a chegada'], ['neutro', 'Neutro']], c.stance)}</select></div></div>
      <label for="cx">O que aconteceu</label><textarea id="cx" rows="4" maxlength="1000" placeholder="${esc(hint)}">${esc(c.text)}</textarea>
      <div class="ag-two"><div><label for="co">Tipo de fonte</label><select id="co">${optsOf(Object.entries(SRC).map(([k, v]) => [k, v[0]]), c.source_type)}</select></div><div><label for="cr">Confiança (1 a 5)</label><select id="cr">${[1, 2, 3, 4, 5].map(n => `<option ${n === c.reliability ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
      <div class="ag-two"><div><label for="cu">Link da fonte</label><input type="url" id="cu" maxlength="1000" value="${esc(c.source_url)}" placeholder="https://…"></div><div><label for="cd">Data do fato</label><input type="date" id="cd" value="${esc(c.happened_at)}"></div></div>
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-clue" data-id="${id || ''}">Salvar pista</button></div>`, 'wide');
  }
  async function saveClue(id) {
    const tid = $('#cg').value, text = $('#cx').value.trim(), kind = $('#ck').value, raw = $('#cu').value.trim(), url = raw ? safeUrl(raw) : '';
    if (!tid) return toast('Escolha o atleta'); if (!text) return toast('Descreva o que aconteceu'); if (raw && !url) return toast('O link precisa começar com https://');
    if (kind === 'voo' && /passageir/i.test(text)) return toast('Não registre passageiros. Só dados públicos do voo');
    const p = { kind, stance: $('#cs').value, source_type: $('#co').value, reliability: +$('#cr').value, text, source_url: url, happened_at: $('#cd').value || new Date().toISOString().slice(0, 10) };
    const r = id ? await sb.from('agency_clues').update(p).eq('id', id) : await sb.from('agency_clues').insert({ ...p, target_id: tid, created_by: me.id });
    if (r.error) return toast('Não foi possível salvar'); await sb.from('agency_targets').update({ updated_at: new Date().toISOString() }).eq('id', tid);
    log('registrou uma pista de ' + (CK[kind] || 'outro').toLowerCase() + ' sobre ' + ((tgOf(tid) || {}).name || ''), '', 'apuracao'); closeModal(); toast('Pista registrada'); await go('apuracao'); if (S.openTg === tid) openTg(tid);
  }

  /* ---- Instagram: acesso ao perfil no DolphinRadar ---- */
  const dolphinUrl = h => {
    h = igName(h).toLowerCase();
    return /^[a-z0-9._]{1,30}$/.test(h) ? 'https://www.dolphinradar.com/instagram-new-follow-tracker' : '';
  };
  function apInsta() {
    const w = S.igw;
    return `<div class="ag-banner">${I('ext')}<span>O botão copia o @ e abre a ferramenta de <b>seguidores e seguidos recentes do DolphinRadar</b>. Cole o @ na busca e escolha Followers (seguidores) ou Following (seguidos). O serviço pode solicitar login ou assinatura.</span></div>
    <div class="ag-btns l" style="margin:0 0 14px"><button class="btn g s" data-ag="new-igw">${I('plus', 14)}Monitorar perfil</button></div>
    ${w.length ? `<div class="ag-tgs">${w.map(x => { const t = tgOf(x.target_id), g = agOf(x.agent_id), can = x.created_by === me.id || isLeader();
      return `<article class="panel ag-tgc2"><div class="ag-nh"><b>@${esc(x.handle)}</b><span class="badge" style="margin-left:auto">${x.kind === 'seguidos' ? 'Seguidos' : 'Seguidores'}</span></div>
        <a class="ag-src" href="${igUrl(x.handle)}" target="_blank" rel="noopener noreferrer">${I('ext', 14)}Abrir no Instagram</a>
        <small>${t ? 'Atleta: ' + esc(t.name) : ''}${t && g ? ' · ' : ''}${g ? 'Empresário: ' + esc(g.name) : ''}${!t && !g ? 'Sem atleta ou empresário ligado' : ''}</small>
        <div class="ag-btns l">${dolphinUrl(x.handle) ? `<a class="btn g s" href="${dolphinUrl(x.handle)}" data-ag="dolphin-open" data-id="${x.id}" target="_blank" rel="noopener noreferrer" aria-label="Copiar @${esc(x.handle)} e abrir seguidores e seguidos recentes no DolphinRadar (nova aba)">${I('ext', 14)}Copiar @ e abrir DolphinRadar</a>` : '<span class="ag-meta">Perfil inválido. Cadastre novamente.</span>'}${can ? `<button class="btn r s" data-ag="ask-del-igw" data-id="${x.id}">Excluir</button>` : ''}</div></article>`; }).join('')}</div>` : `<div class="panel">${empty('Nenhum perfil monitorado. Toque em “Monitorar perfil” e cadastre o Instagram de um atleta ou empresário.')}</div>`}`;
  }
  function igwForm() {
    modal('Monitorar perfil', `<label for="gh">Perfil do Instagram (público)</label><input type="text" id="gh" maxlength="31" placeholder="@perfil" autocapitalize="none" autocomplete="off">
      <label for="gk">Lista a acompanhar</label><select id="gk"><option value="seguidos">Quem o perfil segue (seguidos)</option><option value="seguidores">Quem segue o perfil (seguidores)</option></select>
      <label for="gt">Atleta ligado (opcional)</label><select id="gt"><option value="">Nenhum</option>${S.tg.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>
      <label for="gg">Empresário ligado (opcional)</label><select id="gg"><option value="">Nenhum</option>${S.agn.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select>
      <p class="ag-meta" style="margin-top:12px">Só perfis públicos de atletas, empresários e dirigentes.</p>
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-igw">Salvar</button></div>`, 'sm');
  }
  async function saveIgw() {
    const h = igName($('#gh').value).toLowerCase(); if (!/^[a-z0-9._]{1,30}$/.test(h)) return toast('Perfil inválido. Use só letras minúsculas, números, ponto e _');
    const r = await sb.from('agency_ig_watch').insert({ handle: h, kind: $('#gk').value, target_id: $('#gt').value || null, agent_id: $('#gg').value || null, created_by: me.id });
    if (r.error) return toast(r.error.code === '23505' ? 'Esse perfil já está sendo monitorado' : 'Não foi possível salvar');
    log('começou a monitorar @' + h, '', 'apuracao'); closeModal(); toast('Perfil adicionado'); return go('apuracao');
  }
  function agentForm(id) {
    const a = id ? agOf(id) : { name: '', company: '', instagram: '', notes: '' };
    modal(id ? 'Editar empresário' : 'Novo empresário', `<label for="an">Nome</label><input type="text" id="an" maxlength="120" value="${esc(a.name)}"><label for="ac">Empresa ou agência</label><input type="text" id="ac" maxlength="120" value="${esc(a.company)}">
      <label for="ai">Instagram público</label><input type="text" id="ai" maxlength="40" value="${esc(a.instagram)}" placeholder="@perfil"><label for="at">Observações públicas</label><textarea id="at" rows="3" maxlength="1000">${esc(a.notes)}</textarea>
      <div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-agent" data-id="${id || ''}">Salvar</button></div>`, 'sm');
  }
  async function saveAgent(id) {
    const name = $('#an').value.trim(); if (!name) return toast('Informe o nome'); const p = { name, company: $('#ac').value.trim(), instagram: igName($('#ai').value), notes: $('#at').value.trim() };
    const r = id ? await sb.from('agency_agents').update(p).eq('id', id) : await sb.from('agency_agents').insert({ ...p, created_by: me.id }); if (r.error) return toast('Não foi possível salvar');
    closeModal(); toast('Empresário salvo'); return go('apuracao');
  }

  /* =====================================================  NOTIFICAÇÕES  */
  function notifModal() {
    modal('Notificações', `${S.notifs.length ? `<div class="ag-btns l" style="margin:0 0 8px"><button class="btn o s" data-ag="notif-all">Marcar todas como lidas</button></div>` : ''}${S.notifs.map(n => `<button class="ag-line ag-btnrow ${n.read ? '' : 'unread'}" data-ag="notif" data-id="${n.id}"><div class="tx"><b>${esc(n.text)}</b><small>${when(n.created_at)}</small></div>${n.read ? '' : '<span class="ag-dot"></span>'}</button>`).join('') || empty('Nenhuma notificação por enquanto.')}`, 'sm');
  }

  /* =====================================================  EVENTOS  */
  async function onClick(e) {
    const el = e.target.closest('[data-ag]'); if (!el) return;
    if (el.dataset.ag === 'bg' && e.target !== el) return;
    const a = el.dataset.ag, id = el.dataset.id, v = el.dataset.v;
    switch (a) {
      case 'bg': case 'close': return closeModal();
      case 'nav': return go(v, id);
      case 'copy': try { await navigator.clipboard.writeText(el.dataset.t); toast('Copiado'); } catch { toast('Copie manualmente'); } return;
      /* avisos */
      case 'new-notice': return noticeForm();
      case 'edit-notice': return noticeForm(id);
      case 'save-notice': return saveNotice(id);
      case 'pin-notice': { const n = S.notices.find(x => x.id === id); await sb.from('agency_notices').update({ pinned: !n.pinned }).eq('id', id); return refresh(); }
      case 'ask-del-notice': return confirmBox('Excluir aviso', 'Este aviso some para todos. Quer mesmo excluir?', 'del-notice', id);
      case 'del-notice': { const r = await sb.from('agency_notices').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); log('excluiu um aviso', '', 'avisos'); closeModal(); toast('Aviso excluído'); return refresh(); }
      /* tarefas */
      case 'new-task': return taskForm();
      case 'edit-task': return taskForm(id);
      case 'save-task': return saveTask(id);
      case 'task': return taskModal(id);
      case 'tfilter': S.tFilter = v; return go('tarefas');
      case 'tstatus': S.tStatus = v; return drawBoard();
      case 'set-status': return setStatus(id, v).then(() => taskModal(id));
      case 'ask-del-task': return confirmBox('Excluir tarefa', 'A tarefa e seus comentários serão apagados. Quer mesmo excluir?', 'del-task', id);
      case 'del-task': { const t = S.tasks.find(x => x.id === id); await sb.from('agency_task_comments').delete().eq('task_id', id); const r = await sb.from('agency_tasks').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); log('excluiu uma tarefa', t ? t.title : '', 'tarefas'); closeModal(); toast('Tarefa excluída'); return refresh(); }
      case 'ck-add': { const i = $('#ck-new'), tx = i.value.trim(); if (!tx) return; const t = S.tasks.find(x => x.id === id); return saveChecklist(id, [...t.checklist, { text: tx, done: false }]); }
      case 'ck-del': { const t = S.tasks.find(x => x.id === id); return saveChecklist(id, t.checklist.filter((_, i) => i !== +el.dataset.n)); }
      case 'cm-add': { const i = $('#cm-new'), tx = i.value.trim(); if (!tx) return; const r = await sb.from('agency_task_comments').insert({ task_id: id, author_id: me.id, body: tx }); if (r.error) return toast('Não foi possível comentar'); const t = S.tasks.find(x => x.id === id); await notify([...t.assignees, t.created_by], `${first(me.name)} comentou em: ${t.title}`, 'tarefas:' + id); return taskModal(id); }
      case 'cm-del': { await sb.from('agency_task_comments').delete().eq('id', id); return taskModal(el.dataset.t); }
      /* calendário */
      case 'cal-prev': S.month.m--; if (S.month.m < 0) { S.month.m = 11; S.month.y--; } return render();
      case 'cal-next': S.month.m++; if (S.month.m > 11) { S.month.m = 0; S.month.y++; } return render();
      case 'cal-today': S.month = null; return render();
      case 'day': return dayModal(id);
      case 'new-event': return eventForm(null, id || null);
      case 'edit-event': return eventForm(id);
      case 'save-event': return saveEvent(id);
      case 'ask-del-event': return confirmBox('Excluir data', 'Quer mesmo excluir esta data do calendário?', 'del-event', id);
      case 'del-event': { const r = await sb.from('agency_events').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Data excluída'); return refresh(); }
      /* arquivos */
      case 'pick-files': return $('#ag-up').click();
      case 'folder': S.folder = id || null; S.fq = ''; return go('arquivos');
      case 'new-folder': return folderForm();
      case 'folder-menu': return folderForm(id);
      case 'save-folder': return saveFolder(id);
      case 'ask-del-folder': return confirmBox('Excluir pasta', 'A pasta, as subpastas e TODOS os arquivos dentro dela serão apagados. Isso não pode ser desfeito.', 'del-folder', id);
      case 'del-folder': return deleteFolder(id);
      case 'dl': { const f = S.files.find(x => x.id === id); return openFile(f.path, f.name); }
      case 'ask-del-file': return confirmBox('Excluir arquivo', 'Quer mesmo excluir este arquivo?', 'del-file', id);
      case 'del-file': return deleteFile(id);
      /* chat */
      case 'open-chat': return openChat(id);
      case 'chat-back': S.chatId = null; { const r = $('.ag-chat'); if (r) r.classList.remove('open'); } return drawChatList();
      case 'new-chat': return chatForm();
      case 'cf-kind': modal.kind = v; document.querySelectorAll('[data-ag="cf-kind"]').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); $('#cf-direct').hidden = v !== 'direct'; $('#cf-group').hidden = v !== 'group'; return;
      case 'create-chat': return createChat();
      case 'chat-manage': return chatManage(id);
      case 'save-chat': return saveChat(id, el.dataset.cur || '');
      case 'ask-del-chat': return confirmBox('Apagar conversa', 'Todas as mensagens serão apagadas para todos.', 'del-chat', id);
      case 'del-chat': { await sb.from('agency_messages').delete().eq('chat_id', id); await sb.from('agency_chat_members').delete().eq('chat_id', id); const r = await sb.from('agency_chats').delete().eq('id', id); if (r.error) return toast('Não foi possível apagar'); S.chatId = null; closeModal(); toast('Conversa apagada'); return refresh(); }
      case 'chat-attach': return $('#ag-cup').click();
      case 'reply': S.reply = id; drawMsgs(); { const i = $('#ag-chat-input'); i && i.focus(); } return;
      case 'reply-x': S.reply = null; return drawMsgs();
      case 'ask-del-msg': return confirmBox('Apagar mensagem', 'Quer apagar esta mensagem?', 'del-msg', id);
      case 'del-msg': { const r = await sb.from('agency_messages').delete().eq('id', id); if (r.error) return toast('Não foi possível apagar'); S.msgs = S.msgs.filter(m => m.id !== id); closeModal(); return drawMsgs(); }
      case 'open-file': return openFile(el.dataset.path, el.dataset.name);
      /* equipe */
      case 'new-member': return memberForm();
      case 'create-member': { const name = $('#mn').value.trim(); if (!name) return toast('Escreva o nome'); el.disabled = true; const r = await callMembers({ action: 'create', name, role_title: $('#mrole').value.trim(), access_level: $('#mlv') ? $('#mlv').value : 'membro', birthday: $('#mb').value || null }); el.disabled = false; if (r) { log('criou um membro', name, 'equipe'); credModal('Membro criado', r); loadBase(); } return; }
      case 'save-member': { const m = mem(id), p = { name: $('#mnm').value.trim() || m.name, role_title: $('#mr').value.trim() || 'Assistente', birthday: $('#mbd').value || null }; if ($('#ml')) p.access_level = $('#ml').value; const r = await sb.from('agency_members').update(p).eq('id', id); if (r.error) return toast('Não foi possível salvar'); log('atualizou um membro', p.name, 'equipe'); toast('Membro atualizado'); return refresh(); }
      case 'ask-reset': return confirmBox('Redefinir senha', 'Gerar uma nova senha para este membro? A atual deixa de funcionar.', 'do-reset', id, 'Gerar nova senha', false);
      case 'do-reset': { const r = await callMembers({ action: 'reset', member_id: id }); if (r) { log('redefiniu uma senha', r.name, 'equipe'); credModal('Nova senha', r); } return; }
      case 'ask-toggle': return confirmBox(v === '1' ? 'Reativar membro' : 'Desativar membro', v === '1' ? 'O membro volta a ter acesso.' : 'O membro perde o acesso imediatamente.', 'do-toggle', id + '|' + v, v === '1' ? 'Reativar' : 'Desativar', v !== '1');
      case 'do-toggle': { const [i, on] = id.split('|'); const r = await callMembers({ action: 'toggle', member_id: i, active: on === '1' }); if (r) { log(on === '1' ? 'reativou um membro' : 'desativou um membro', (mem(i) || {}).name, 'equipe'); closeModal(); toast(on === '1' ? 'Membro reativado' : 'Membro desativado'); refresh(); } return; }
      case 'ask-remove': return confirmBox('Excluir membro de vez', 'A conta será apagada definitivamente. Prefira "Desativar" se for só tirar o acesso.', 'do-remove', id, 'Excluir de vez');
      case 'do-remove': { const nm = (mem(id) || {}).name; const r = await callMembers({ action: 'remove', member_id: id }); if (r) { log('excluiu um membro', nm, 'equipe'); closeModal(); toast('Membro excluído'); S.arg = null; refresh(); } return; }
      case 'edit-profile': return profileForm();
      case 'pick-photo': return $('#ag-pf').click();
      case 'save-profile': { const name = $('#pn').value.trim(); if (!name) return toast('Escreva seu nome'); const r = await sb.from('agency_members').update({ name, bio: $('#pb').value.trim(), birthday: $('#pd').value || null }).eq('id', me.id); if (r.error) return toast('Não foi possível salvar'); closeModal(); toast('Perfil salvo'); refresh(); host.onMe && host.onMe(); return; }
      case 'pw-form': return modal('Trocar senha', `<label for="np">Nova senha (mínimo 8 caracteres)</label><input type="password" id="np" autocomplete="new-password"><label for="np2">Repita a nova senha</label><input type="password" id="np2" autocomplete="new-password"><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-pw">Salvar nova senha</button></div>`, 'sm');
      case 'save-pw': { const p = $('#np').value; if (p.length < 8) return toast('Use pelo menos 8 caracteres'); if (p !== $('#np2').value) return toast('As senhas não conferem'); const r = await sb.auth.updateUser({ password: p }); if (r.error) return toast('Não foi possível trocar a senha'); closeModal(); toast('Senha alterada'); return log('trocou a senha'); }
      /* pedidos */
      case 'new-request': return reqForm();
      case 'save-req': { const text = $('#rt').value.trim(); if (!text) return toast('Explique o pedido'); const kind = $('#rk').value; const r = await sb.from('agency_requests').insert({ member_id: me.id, kind, text }); if (r.error) return toast('Não foi possível enviar'); await notify(leaderIds(), `${first(me.name)} fez um pedido: ${REQ[kind]}`, 'pedidos'); log('fez um pedido', REQ[kind], 'pedidos'); closeModal(); toast('Pedido enviado'); return S.view === 'pedidos' ? refresh() : go('pedidos'); }
      case 'rfilter': S.rFilter = v; return render();
      case 'req-toggle': { const r0 = S.reqs.find(x => x.id === id), st = r0.status === 'aberto' ? 'resolvido' : 'aberto'; const r = await sb.from('agency_requests').update({ status: st }).eq('id', id); if (r.error) return toast('Não foi possível alterar'); if (st === 'resolvido') await notify([r0.member_id], 'Seu pedido foi resolvido', 'pedidos'); log(st === 'resolvido' ? 'resolveu um pedido' : 'reabriu um pedido', '', 'pedidos'); return refresh(); }
      case 'ask-del-req': return confirmBox('Excluir pedido', 'Quer mesmo excluir este pedido?', 'del-req', id);
      case 'del-req': { await sb.from('agency_requests').delete().eq('id', id); closeModal(); return refresh(); }
      case 'afilter': S.aFilter = v; return render();
      /* notificações */
      case 'new-draft': return draftForm();
      case 'edit-draft': return draftForm(id);
      case 'view-draft': return viewDraft(id);
      case 'save-draft': return saveDraft(id || null, !!el.dataset.send);
      case 'send-draft': { const d = S.drafts.find(x => x.id === id); if (!d || d.body.trim().length < 20) return toast('Escreva o texto antes de enviar'); await setDraft(id, { status: 'enviado', feedback: '' }, 'Enviada para revisão'); await notify(leaderIds().filter(x => x !== me.id), `${first(me.name)} enviou a matéria “${d.title}” para revisão`, 'noticias'); return; }
      case 'approve-draft': log('aprovou uma matéria', (S.drafts.find(x => x.id === id) || {}).title, 'noticias'); return setDraft(id, { status: 'aprovado', feedback: '' }, 'Matéria aprovada', 'Sua matéria “{t}” foi aprovada');
      case 'return-draft': return modal('Devolver matéria', `<label for="df">O que precisa ajustar?</label><textarea id="df" rows="4" maxlength="1000" placeholder="Explique o que o redator deve mudar"></textarea><div class="ag-btns"><button class="btn o" data-ag="close">Cancelar</button><button class="btn g" data-ag="save-return" data-id="${id}">Devolver</button></div>`, 'sm');
      case 'save-return': { const f = $('#df').value.trim(); if (!f) return toast('Explique o que ajustar'); return setDraft(id, { status: 'devolvido', feedback: f }, 'Matéria devolvida', 'Sua matéria “{t}” voltou com ajustes'); }
      case 'to-editor': return toEditor(id);
      case 'ask-del-draft': return confirmBox('Excluir matéria', 'A matéria será apagada. Quer mesmo excluir?', 'del-draft', id);
      case 'del-draft': { const r = await sb.from('agency_drafts').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Matéria excluída'); return go('noticias'); }
      case 'new-tpl': return tplForm();
      case 'edit-tpl': return tplForm(id);
      case 'save-tpl': return saveTpl(id || null);
      case 'mcat': S.mCat = v || ''; return go('modelos');
      case 'ask-del-tpl': return confirmBox('Excluir modelo', 'O link sai da lista da equipe. Quer mesmo excluir?', 'del-tpl', id);
      case 'del-tpl': { const r = await sb.from('agency_templates').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Modelo excluído'); return go('modelos'); }
      case 'new-tg': return tgForm();
      case 'edit-tg': return tgForm(id);
      case 'open-tg': S.openTg = id; return openTg(id);
      case 'save-tg': return saveTg(id || null);
      case 'set-st': return setSt(id, v);
      case 'ask-del-tg': return confirmBox('Excluir atleta', 'O atleta e todas as pistas dele serão apagados. Quer mesmo excluir?', 'del-tg', id);
      case 'del-tg': { const r = await sb.from('agency_targets').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Atleta excluído'); return go('apuracao'); }
      case 'new-clue': S.openTg = id || null; return clueForm(null, el.dataset.kind, { tid: id || (S.ap.tgt || '') });
      case 'edit-clue': return clueForm(id);
      case 'save-clue': return saveClue(id || null);
      case 'ask-del-clue': return confirmBox('Excluir pista', 'A pista sai do histórico. Quer mesmo excluir?', 'del-clue', id);
      case 'del-clue': { const r = await sb.from('agency_clues').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Pista excluída'); return go('apuracao'); }
      case 'news-clue': { const n = (S.ap.news || [])[+v]; if (!n) return; S.openTg = null; return clueForm(null, 'noticia', { text: n.title, url: n.link, date: n.date ? new Date(n.date).toISOString().slice(0, 10) : '' }); }
      case 'new-agent': return agentForm();
      case 'edit-agent': return agentForm(id);
      case 'save-agent': return saveAgent(id || null);
      case 'ask-del-agent': return confirmBox('Excluir empresário', 'Os atletas ligados a ele ficam sem empresário. Quer mesmo excluir?', 'del-agent', id);
      case 'del-agent': { const r = await sb.from('agency_agents').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Empresário excluído'); return go('apuracao'); }
      case 'ap-tab': S.ap.tab = v; return drawAp();
      case 'ap-st': S.ap.st = v || ''; return drawAp();
      case 'ap-kind': S.ap.kind = v || ''; return drawAp();
      case 'ap-mk': S.ap.mk = v; return drawAp();
      case 'ap-news': return runNews();
      case 'dolphin-open': {
        const w = S.igw.find(x => x.id === id); if (!w) return;
        try { await navigator.clipboard.writeText('@' + igName(w.handle)); toast('@ copiado. Cole na busca do DolphinRadar'); }
        catch { toast('Não foi possível copiar. Busque por @' + igName(w.handle) + ' no DolphinRadar'); }
        return;
      }
      case 'new-igw': return igwForm();
      case 'save-igw': return saveIgw();
      case 'ask-del-igw': return confirmBox('Parar de monitorar', 'Remover este perfil da Agência? O acompanhamento no DolphinRadar deve ser gerenciado por lá.', 'del-igw', id);
      case 'del-igw': { const r = await sb.from('agency_ig_watch').delete().eq('id', id); if (r.error) return toast('Não foi possível excluir'); closeModal(); toast('Perfil removido'); return go('apuracao'); }
      case 'bell': return notifModal();
      case 'notif': { const n = S.notifs.find(x => x.id === id); if (n && !n.read) { n.read = true; sb.from('agency_notifications').update({ read: true }).eq('id', id).then(() => {}); badges(); } closeModal(); return openLink(n && n.link); }
      case 'notif-all': { S.notifs.forEach(n => n.read = true); await sb.from('agency_notifications').update({ read: true }).eq('member_id', me.id).eq('read', false); badges(); return notifModal(); }
    }
  }
  function onChange(e) {
    const t = e.target;
    if (t.id === 'ag-up') { const f = [...t.files]; t.value = ''; if (f.length) uploadFiles(f); return; }
    if (t.id === 'ag-cup') { const f = t.files[0]; t.value = ''; if (f) sendMsg($('#ag-chat-input').value.trim(), f); return; }
    if (t.id === 'ag-pf') { const f = t.files[0]; if (f) uploadPhoto(f); return; }
    if (t.id === 'ag-aptg') { S.ap.tgt = t.value; return drawAp(); }
    if (t.id === 'ag-tcat') { S.tCat = t.value; return drawBoard(); }
    if (t.id === 'ag-tmem') { S.tMem = t.value; return drawBoard(); }
    if (t.id === 'ag-amem') { S.aMem = t.value; return drawAct(); }
    if (t.dataset.agChange === 'ck') { const task = S.tasks.find(x => x.id === t.dataset.id), n = +t.dataset.n; saveChecklist(task.id, task.checklist.map((i, k) => k === n ? { ...i, done: t.checked } : i)); }
  }
  function onInput(e) {
    if (e.target.id === 'ag-tq') { S.tQ = e.target.value; drawBoard(); }
    if (e.target.id === 'ag-apq') { S.ap.q = e.target.value; const l = $('#ag-aplist'); if (l) { const q = norm(S.ap.q); l.innerHTML = apList(S.tg.filter(t => (!S.ap.st || t.status === S.ap.st) && (!q || norm(t.name + ' ' + t.club + ' ' + t.position).includes(q)))); } }
    if (e.target.id === 'ag-mq') { S.mQ = e.target.value; drawTpls(); }
    if (e.target.id === 'ag-fq') { clearTimeout(dbTimer); const v = e.target.value; dbTimer = setTimeout(() => { S.fq = v.trim(); drawFiles(); }, 300); }
  }
  function onSubmit(e) { if (e.target.id === 'ag-compose') { e.preventDefault(); const i = $('#ag-chat-input'), v = i.value.trim(); if (v) { i.value = ''; sendMsg(v); } } }
  function onKey(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'ag-nq') { e.preventDefault(); return runNews(); }
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && e.target.id === 'ck-new') { e.preventDefault(); const b2 = layer.querySelector('[data-ag="ck-add"]'); b2 && b2.click(); }
    if (e.key === 'Enter' && e.target.id === 'cm-new') { e.preventDefault(); const b2 = layer.querySelector('[data-ag="cm-add"]'); b2 && b2.click(); }
  }
  /* arrastar e soltar tarefas */
  let dragId = null;
  function dnd(root) {
    root.addEventListener('dragstart', e => { const c = e.target.closest('.ag-task'); if (!c) return; dragId = c.dataset.id; e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; c.classList.add('drag'); });
    root.addEventListener('dragend', e => { const c = e.target.closest('.ag-task'); if (c) c.classList.remove('drag'); document.querySelectorAll('.ag-col.over').forEach(x => x.classList.remove('over')); });
    root.addEventListener('dragover', e => { const c = e.target.closest('.ag-col'); if (c && dragId) { e.preventDefault(); document.querySelectorAll('.ag-col.over').forEach(x => x.classList.remove('over')); c.classList.add('over'); } });
    root.addEventListener('drop', e => { const c = e.target.closest('.ag-col'); if (!c || !dragId) return; e.preventDefault(); const id = dragId; dragId = null; const t = S.tasks.find(x => x.id === id); if (t && canMove(t)) setStatus(id, c.dataset.drop); else toast('Só os responsáveis e a liderança movem esta tarefa'); });
  }

  /* ---------- API pública ---------- */
  function injectIcons() {
    if ($('#ag-icons')) return; const d = document.createElement('div'); d.id = 'ag-icons';
    d.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="ag-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`; document.body.appendChild(d);
  }
  async function init(o) {
    sb = o.sb; mount = o.mount; host = o; injectIcons();
    if (!layer) { layer = document.createElement('div'); layer.id = 'ag-layer'; document.body.appendChild(layer); layer.addEventListener('click', onClick); layer.addEventListener('change', onChange); mount.addEventListener('click', onClick); mount.addEventListener('change', onChange); mount.addEventListener('input', onInput); mount.addEventListener('submit', onSubmit); layer.addEventListener('input', onInput); document.addEventListener('keydown', onKey); dnd(mount); }
    me = null; await sb.rpc('agency_bootstrap');
    const u = (await sb.auth.getUser()).data.user; if (!u) { o.onDenied && o.onDenied(); return false; }
    const r = await sb.from('agency_members').select('*').eq('id', u.id).maybeSingle();
    if (!r.data || !r.data.active) { o.onDenied && o.onDenied(); return false; }
    me = r.data; S.isAdm = false; try { S.isAdm = (await sb.rpc('is_admin')).data === true; } catch {} await loadBase(); subscribe(); return true;
  }
  function destroy() { if (rt && sb) sb.removeChannel(rt); rt = null; me = null; closeModal(); }
  injectIcons();
  window.AG = { init, go, destroy, closeModal, log, openNotifs: notifModal, openMe: () => go('equipe', 'me'), refresh, get me() { return me; }, get badge() { return S.badge || {}; }, isLeader, can: canView, av, first, TITLES, ICONS, I };
})();
