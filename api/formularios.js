// GET  /api/formularios?slug=x -> formulário ativo (público, com cache)
// POST /api/formularios?slug=x -> valida e salva uma resposta
// Camadas: rota -> validação -> banco. A chave do banco nunca vai pro navegador do respondente.
const { q } = require('./_lib');
const BASE = process.env.SUPABASE_URL || 'https://yeegyogxrkucuvbarwag.supabase.co';
const KEY = process.env.SUPABASE_KEY || 'sb_publishable_l5ERavd22tp6b5HEMDLJaQ_GwUh_QOL';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const slug = clip(req.query.slug, 80);
  if (!/^[a-z0-9-]+$/.test(slug)) return fail(res, 400, 'slug_invalido');
  try {
    const [form] = await q(`forms?slug=eq.${slug}&active=eq.true&select=id,slug,title,description,steps&limit=1`);
    if (!form) return fail(res, 404, 'formulario_nao_encontrado');
    if (req.method === 'GET') { res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120'); return res.json({ form }); }
    if (req.method !== 'POST') return fail(res, 405, 'metodo_nao_permitido');

    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
    if (limited(ip)) return fail(res, 429, 'muitas_tentativas');
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = clip(body.name, 120), email = clip(body.email, 160);
    const { errors, answers } = validate(form, body);
    if (!name) errors.name = 'obrigatorio';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'email_invalido';
    if (Object.keys(errors).length) return fail(res, 422, 'dados_invalidos', { fields: errors });

    const r = await fetch(`${BASE}/rest/v1/form_responses`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ form_id: form.id, respondent_name: name, respondent_email: email, answers })
    });
    console.log(JSON.stringify({ rota: 'POST /api/formularios', form: slug, status: r.ok ? 201 : r.status }));
    if (!r.ok) return fail(res, 500, 'erro_ao_salvar');
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.log(JSON.stringify({ rota: req.method + ' /api/formularios', erro: String(e.message || e) }));
    return fail(res, 500, 'erro_no_servidor');
  }
};
