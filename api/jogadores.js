// Busca pública de futebol. A origem é explícita; não raspa oGol/Transfermarkt.
const POS = { Goalkeeper: 'Goleiro', Defender: 'Defensor', 'Centre-Back': 'Zagueiro', 'Center Back': 'Zagueiro', 'Left-Back': 'Lateral esquerdo', 'Right-Back': 'Lateral direito', 'Left Back': 'Lateral esquerdo', 'Right Back': 'Lateral direito', Midfielder: 'Meio-campista', 'Defensive Midfield': 'Volante', 'Central Midfield': 'Meio-campista', 'Attacking Midfield': 'Meia atacante', 'Left Wing': 'Ponta esquerda', 'Right Wing': 'Ponta direita', Forward: 'Atacante', Striker: 'Centroavante', 'Centre-Forward': 'Centroavante' };
const text = (v, max = 120) => String(v || '').trim().slice(0, max);
function shape(p) {
  const raw = text(p.strInstagram, 200).replace(/^(?:https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '');
  return { id: text(p.idPlayer, 20), name: text(p.strPlayer), full_name: text(p.strPlayerAlternate), position: text(POS[p.strPosition] || p.strPosition, 40), club: text(p.strTeam, 80), nationality: text(p.strNationality), birth_date: /^\d{4}-\d{2}-\d{2}$/.test(p.dateBorn || '') ? p.dateBorn : '', height: text(p.strHeight, 40), weight: text(p.strWeight, 40), instagram: /^[a-z0-9._]{1,30}$/i.test(raw) ? raw : '', source: 'TheSportsDB', source_url: 'https://www.thesportsdb.com/player/' + encodeURIComponent(p.idPlayer) };
}
module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método não permitido.' }); }
  const { q, id } = req.query || {};
  if ((id !== undefined && (typeof id !== 'string' || !/^\d{1,12}$/.test(id))) || (id === undefined && (typeof q !== 'string' || q.trim().length < 2 || q.trim().length > 100))) return res.status(400).json({ error: 'Informe um nome de 2 a 100 caracteres.' });
  try {
    const key = process.env.THESPORTSDB_API_KEY || '123';
    const path = id ? 'lookupplayer.php?id=' + encodeURIComponent(id) : 'searchplayers.php?p=' + encodeURIComponent(q.trim());
    const response = await fetch('https://www.thesportsdb.com/api/v1/json/' + encodeURIComponent(key) + '/' + path, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('provider_status_' + response.status);
    const data = await response.json();
    const rows = id ? data.players : data.player;
    if (rows != null && !Array.isArray(rows)) throw new Error('provider_format');
    const items = (rows || []).filter(p => p.strSport === 'Soccer' && /^\d+$/.test(p.idPlayer) && p.strPlayer).slice(0, 30).map(shape);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.json({ source: 'TheSportsDB', items });
  } catch (e) {
    console.error('player_lookup_failed', e.name, e.message);
    return res.status(502).json({ error: 'A fonte de jogadores está indisponível. Tente novamente em instantes.' });
  }
};
