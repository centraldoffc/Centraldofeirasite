// Exige login (Authorization: Bearer <token do Supabase>) e e-mail confirmado.
// GET  /api/formularios?slug=x -> formulário ativo + se a pessoa já respondeu
// POST /api/formularios?slug=x -> valida e salva a resposta da pessoa logada (uma por conta)
// Camadas: rota -> validação -> banco. A chave do banco nunca vai pro navegador do respondente.
const BASE = process.env.SUPABASE_URL || 'https://yeegyogxrkucuvbarwag.supabase.co';
const KEY = process.env.SUPABASE_KEY || 'sb_publishable_l5ERavd22tp6b5HEMDLJaQ_GwUh_QOL';

async function api(path, token, opt = {}) {
  const r = await fetch(`${BASE}/${path}`, { ...opt, headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  return r;
}
const hits = new Map(); // limite simples: 5 envios por minuto por IP
const limited = ip => { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 6e4); a.push(n); hits.set(ip, a); return a.length > 5; };
const clip = (s, n) => String(s ?? '').trim().slice(0, n);
const fail = (res, code, error, extra) => res.status(code).json({ error, ...extra });

function validate(form, body) {
  const errors = {}, out = [], inA = body.answers || {};
  for (const st of form.steps || []) for (const f of st.fields || []) {
    let v = inA[f.id];
    if (f.type === 'checkbox') v = (Array.isArray(v) ? v : []).map(x => clip(x, 200)).filter(Boolean);
    else v = clip(v, f.type === 'textarea' ? 2000 : 300);
    const empty = Array.isArray(v) ? !v.length : !v;
    if (empty) { if (f.required) errors[f.id] = 'obrigatorio'; continue; }
    const opts = f.options || [];
    if ((f.type === 'select' || f.type === 'radio') && !opts.includes(v)) errors[f.id] = 'opcao_invalida';
    if (f.type === 'checkbox' && v.some(x => !opts.includes(x))) errors[f.id] = 'opcao_invalida';
    if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) errors[f.id] = 'email_invalido';
    out.push({ label: clip(f.label, 200), value: v });
  }
  return { errors, answers: out };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const slug = clip(req.query.slug, 80);
  if (!/^[a-z0-9-]+$/.test(slug)) return fail(res, 400, 'slug_invalido');
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return fail(res, 401, 'login_necessario');
    const ur = await api('auth/v1/user', token);
    if (!ur.ok) return fail(res, 401, 'sessao_invalida');
    const user = await ur.json();
    if (!user.email_confirmed_at) return fail(res, 403, 'email_nao_confirmado');
    const fr = await api(`rest/v1/forms?slug=eq.${slug}&active=eq.true&select=id,slug,title,description,steps,success_title,success_message&limit=1`, token);
    const [form] = fr.ok ? await fr.json() : [];
    if (!form) return fail(res, 404, 'formulario_nao_encontrado');
    const dr = await api(`rest/v1/form_responses?form_id=eq.${form.id}&user_id=eq.${user.id}&select=id&limit=1`, token);
    const answered = dr.ok && (await dr.json()).length > 0;
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method === 'GET') return res.json({ form, answered, user: { email: user.email, name: user.user_metadata?.full_name || '' } });
    if (req.method !== 'POST') return fail(res, 405, 'metodo_nao_permitido');
    if (answered) return fail(res, 409, 'ja_respondeu');

    if (limited(user.id)) return fail(res, 429, 'muitas_tentativas');
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { errors, answers } = validate(form, body);
    if (Object.keys(errors).length) return fail(res, 422, 'dados_invalidos', { fields: errors });
    const name = clip(user.user_metadata?.full_name || user.email.split('@')[0], 120);

    const r = await api('rest/v1/form_responses', token, { method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ form_id: form.id, user_id: user.id, respondent_name: name, respondent_email: user.email, answers }) });
    console.log(JSON.stringify({ rota: 'POST /api/formularios', form: slug, status: r.ok ? 201 : r.status }));
    if (r.status === 409) return fail(res, 409, 'ja_respondeu');
    if (!r.ok) return fail(res, 500, 'erro_ao_salvar');
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.log(JSON.stringify({ rota: req.method + ' /api/formularios', erro: String(e.message || e) }));
    return fail(res, 500, 'erro_no_servidor');
  }
};
