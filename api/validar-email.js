// GET /api/validar-email?email=... -> { ok:true } ou { ok:false, reason, suggestion? }
// Confere: formato, e-mails descartáveis/de teste, erros comuns de digitação (gmial.com) e se o domínio
// realmente recebe e-mail (registro MX no DNS). Não consegue saber se a caixa específica existe: isso o código de confirmação resolve.
const dns = require('dns').promises;

const POPULARES = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com', 'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'msn.com', 'proton.me', 'protonmail.com'];
const TYPOS = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com',
  'gmail.com.br': 'gmail.com', 'gnail.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmeil.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.cm': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotimail.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloook.com': 'outlook.com', 'outlook.con': 'outlook.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'icloud.con': 'icloud.com', 'iclod.com': 'icloud.com'
};
const DESCARTAVEIS = new Set(['mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com', '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempail.com', 'throwawaymail.com', 'yopmail.com', 'yopmail.fr', 'trashmail.com', 'trashmail.net', 'getnada.com', 'nada.email', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'mintemail.com', 'moakt.com', 'emailondeck.com', 'burnermail.io', 'spamgourmet.com', 'mohmal.com', 'tmpmail.org', 'tmpmail.net', 'discard.email', 'mail.tm', 'inboxkitten.com', 'fakemail.net', 'tempinbox.com', 'mytemp.email', 'emailfake.com', 'crazymailing.com', 'mailcatch.com', 'spambox.us', 'grr.la']);
const TESTE = new Set(['example.com', 'example.org', 'example.net', 'teste.com', 'test.com', 'teste.com.br', 'email.com', 'exemplo.com', 'a.com', 'aaa.com']);

function dist(a, b) { // distância de edição simples (para domínios curtos)
  const m = a.length, n = b.length; if (Math.abs(m - n) > 1) return 9;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const comTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

async function validar(raw) {
  const email = String(raw || '').trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email)) return { ok: false, reason: 'formato' };
  const [local, dom] = email.split('@');
  if (local.length > 64 || local.includes('..') || local.startsWith('.') || local.endsWith('.')) return { ok: false, reason: 'formato' };
  if (/(.)\1{5,}/.test(local)) return { ok: false, reason: 'formato' };
  if (DESCARTAVEIS.has(dom)) return { ok: false, reason: 'descartavel' };
  if (TESTE.has(dom)) return { ok: false, reason: 'dominio' };
  if (TYPOS[dom]) return { ok: false, reason: 'digitacao', suggestion: `${local}@${TYPOS[dom]}` };
  if (POPULARES.includes(dom)) return { ok: true };
  const perto = POPULARES.find(p => dist(dom, p) === 1);
  if (perto) return { ok: false, reason: 'digitacao', suggestion: `${local}@${perto}` };
  try {
    const mx = await comTimeout(dns.resolveMx(dom), 3500);
    if (mx && mx.length) return { ok: true };
    throw Object.assign(new Error('sem mx'), { code: 'ENODATA' });
  } catch (e) {
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') {
      try { await comTimeout(dns.resolve4(dom), 3500); return { ok: true }; } // sem MX, mas o domínio responde: aceito
      catch (e2) {
        if (e2.code === 'ENOTFOUND' || e2.code === 'ENODATA') {
          // controle: se nem um domínio conhecido resolve, o problema é o DNS do servidor, não o e-mail
          try { await comTimeout(dns.resolveMx('google.com'), 3000); return { ok: false, reason: 'dominio' }; } catch (e3) { return { ok: true }; }
        }
      }
    }
    return { ok: true }; // falha de DNS/timeout: não bloqueia o cadastro
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try { res.json(await validar((req.query && req.query.email) || '')); }
  catch (e) { res.json({ ok: true }); }
};
module.exports.validar = validar;
