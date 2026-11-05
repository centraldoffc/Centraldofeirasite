import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const DOMAIN = 'membros.centraldoffc.app';
const LEVELS = ['super', 'lider', 'membro'];

function randomPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRTUVWXYZ23456789';
  const b = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(b, (n) => chars[n % chars.length]).join('');
}
function randomCode() {
  return String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'metodo_invalido' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u, error: ue } = await admin.auth.getUser(token);
  if (ue || !u?.user) return json({ error: 'nao_autenticado' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'corpo_invalido' }, 400); }

  const pending = u.user.app_metadata?.onboarding_required === true;
  if (body.action === 'onboarding_status') {
    const { data: member } = await admin.from('agency_members').select('name,bio,birthday,active').eq('id', u.user.id).maybeSingle();
    if (!member?.active) return json({ error: 'Conta sem acesso à agência.' }, 403);
    return json({ required: pending, member });
  }
  if (body.action === 'complete_onboarding') {
    if (!pending) return json({ error: 'Primeiro acesso já concluído.' }, 409);
    const { data: member } = await admin.from('agency_members').select('active').eq('id', u.user.id).maybeSingle();
    if (!member?.active) return json({ error: 'Conta sem acesso à agência.' }, 403);
    const name = String(body.name || '').trim();
    const bio = String(body.bio || '').trim();
    const password = String(body.password || '');
    const current = String(body.current_password || '');
    const birthday = body.birthday || null;
    if (!name || name.length > 80 || bio.length > 500) return json({ error: 'Informe seu nome (até 80 caracteres) e uma apresentação de até 500 caracteres.' }, 400);
    if (password.length < 8 || password.length > 128 || password === current) return json({ error: 'Crie uma senha diferente da provisória, com 8 a 128 caracteres.' }, 400);
    if (birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || Number.isNaN(Date.parse(birthday)) || new Date(birthday).toISOString().slice(0,10) !== birthday || birthday > new Date().toISOString().slice(0,10))) return json({ error: 'Data de nascimento inválida.' }, 400);
    const verifier = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const verified = await verifier.auth.signInWithPassword({ email: u.user.email!, password: current });
    if (verified.error || verified.data.user?.id !== u.user.id) return json({ error: 'A senha provisória está incorreta.' }, 400);
    await verifier.auth.signOut({ scope: 'local' });
    const saved = await admin.from('agency_members').update({ name, bio, birthday }).eq('id', u.user.id);
    if (saved.error) return json({ error: 'Não foi possível salvar o perfil. Tente novamente.' }, 500);
    const changed = await admin.auth.admin.updateUserById(u.user.id, { password, app_metadata: { ...u.user.app_metadata, onboarding_required: false, onboarding_completed_at: new Date().toISOString() } });
    if (changed.error) return json({ error: 'Não foi possível alterar a senha. Escolha outra senha e tente novamente.' }, 400);
    return json({ ok: true });
  }
  if (pending) return json({ error: 'Conclua seu primeiro acesso.' }, 403);

  const { data: adm } = await admin.from('admins').select('user_id').eq('user_id', u.user.id).maybeSingle();
  const { data: row } = await admin.from('agency_members').select('id,access_level,active').eq('id', u.user.id).maybeSingle();
  const isAdmin = !!adm;
  const level = isAdmin ? 'super' : (row && row.active ? row.access_level : 'none');
  if (!['super', 'lider'].includes(level)) return json({ error: 'sem_permissao' }, 403);
  const isSuper = level === 'super';



  if (body.action === 'create') {
    const name = String(body.name || '').trim().slice(0, 80);
    const role_title = String(body.role_title || 'Assistente').trim().slice(0, 40) || 'Assistente';
    let access_level = LEVELS.includes(body.access_level) ? body.access_level : 'membro';
    if (!isSuper) access_level = 'membro';
    const birthday = /^\d{4}-\d{2}-\d{2}$/.test(body.birthday || '') ? body.birthday : null;
    if (!name) return json({ error: 'nome_obrigatorio' }, 400);

    let code = '';
    for (let i = 0; i < 20; i++) {
      const c = randomCode();
      const { data } = await admin.from('agency_members').select('id').eq('code', c).maybeSingle();
      if (!data) { code = c; break; }
    }
    if (!code) return json({ error: 'sem_id_livre' }, 500);
    const password = randomPassword();
    const { data: created, error: ce } = await admin.auth.admin.createUser({ email: `${code}@${DOMAIN}`, password, email_confirm: true, app_metadata: { onboarding_required: true } });
    if (ce || !created?.user) return json({ error: 'falha_ao_criar_usuario' }, 500);
    const { error: ie } = await admin.from('agency_members').insert({ id: created.user.id, code, name, role_title, access_level, birthday });
    if (ie) { await admin.auth.admin.deleteUser(created.user.id); return json({ error: 'falha_ao_salvar_membro' }, 500); }
    return json({ ok: true, code, password, name });
  }

  if (['reset', 'toggle', 'remove'].includes(body.action)) {
    const { data: target } = await admin.from('agency_members').select('id,access_level,code,name').eq('id', String(body.member_id || '')).maybeSingle();
    if (!target) return json({ error: 'membro_nao_encontrado' }, 404);
    if (target.id !== u.user.id && target.access_level !== 'membro' && !isSuper) return json({ error: 'sem_permissao' }, 403);
    if (body.action === 'reset') {
      const password = randomPassword();
      const { error } = await admin.auth.admin.updateUserById(target.id, { password, app_metadata: { onboarding_required: true } });
      if (error) return json({ error: 'falha_ao_redefinir' }, 500);
      return json({ ok: true, code: target.code, password, name: target.name });
    }
    if (target.id === u.user.id) return json({ error: 'nao_pode_alterar_a_si_mesmo' }, 400);
    if (body.action === 'remove') {
      if (!isSuper) return json({ error: 'sem_permissao' }, 403);
      const { error } = await admin.auth.admin.deleteUser(target.id);
      if (error) return json({ error: 'falha_ao_remover' }, 500);
      return json({ ok: true });
    }
    const active = !!body.active;
    await admin.from('agency_members').update({ active }).eq('id', target.id);
    await admin.auth.admin.updateUserById(target.id, { ban_duration: active ? 'none' : '876000h' });
    return json({ ok: true, active });
  }

  return json({ error: 'acao_invalida' }, 400);
});
