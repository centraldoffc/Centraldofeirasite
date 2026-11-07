const POS = { Goalkeeper: 'Goleiro', Defender: 'Defensor', 'Centre-Back': 'Zagueiro', 'Center Back': 'Zagueiro', 'Left-Back': 'Lateral esquerdo', 'Right-Back': 'Lateral direito', 'Left Back': 'Lateral esquerdo', 'Right Back': 'Lateral direito', Midfielder: 'Meio-campista', 'Defensive Midfield': 'Volante', 'Central Midfield': 'Meio-campista', 'Attacking Midfield': 'Meia atacante', 'Left Wing': 'Ponta esquerda', 'Right Wing': 'Ponta direita', Forward: 'Atacante', Striker: 'Centroavante', 'Centre-Forward': 'Centroavante' };
const text = (v, max = 120) => String(v || '').trim().slice(0, max);
const BASE = 'https://tmapi.transfermarkt.technology';
const iso = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '';
async function get(path, params, signal) {
  const url = new URL(path, BASE);
  for (const [k, v] of params || []) url.searchParams.append(k, v);
  const r = await fetch(url, {signal, headers:{Accept:'application/json'}});
  if (!r.ok) throw new Error('provider_' + r.status);
  const body = await r.json();
  if (!body.success || !body.data) throw new Error('provider_format');
  return body.data;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({error:'Método não permitido.'}); }
  const {q, id, page='1'} = req.query || {};
  if (typeof req.query?.historico === 'string') {
    const nome = req.query.historico.trim(), nasc = iso(req.query.nasc);
    if (nome.length < 2 || nome.length > 100) return res.status(400).json({error:'Nome inválido.'});
    try {
      const signal = AbortSignal.timeout(18000);
      const found = await get('/quick-search', [['term', nome], ['page', '1']], signal);
      const ids = (found.result?.playerIds || []).slice(0, 10);
      if (!ids.length) return res.json({clubs: []});
      const rows = await get('/players', ids.map(i => ['ids[]', i]), signal);
      const pl = (nasc && rows.find(p => p.lifeDates?.dateOfBirth === nasc)) || rows[0];
      if (!pl) return res.json({clubs: []});
      let raw = [];
      try {
        const th = await get('/transfer/history/player/' + pl.id, [], signal);
        raw = Array.isArray(th) ? th : (th.history?.terminated || th.transfers || []);
      } catch (e) { /* cai para os vínculos do cadastro */ }
      const yr = t => { const d = String(t.details?.date || t.date || ''); return /^\d{4}/.test(d) ? Number(d.slice(0, 4)) : null; };
      const list = raw.filter(t => t.transferDestination?.clubId || t.transferSource?.clubId).sort((x, y) => String(x.details?.date || x.date || '').localeCompare(String(y.details?.date || y.date || '')));
      const stints = [];
      if (list[0]?.transferSource?.clubId) stints.push({id: String(list[0].transferSource.clubId), from: null, to: yr(list[0])});
      list.forEach((t, i) => { if (t.transferDestination?.clubId) stints.push({id: String(t.transferDestination.clubId), from: yr(t), to: list[i + 1] ? yr(list[i + 1]) : null}); });
      const fallback = (pl.clubAssignments || []).map(a => a.clubId).filter(Boolean).map(String);
      const cids = [...new Set([...stints.map(x => x.id), ...fallback])];
      const clubs = cids.length ? await get('/clubs', cids.map(i => ['ids[]', i]), signal) : [];
      const names = new Map(clubs.map(c => [String(c.id), c.name]));
      const out = stints.map(x => ({club: text(names.get(x.id), 80), from: x.from, to: x.to})).filter(x => x.club).reverse();
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
      return res.json({stints: out, clubs: out.length ? [] : fallback.map(i => text(names.get(i), 80)).filter(Boolean), source: 'Transfermarkt'});
    } catch (e) { console.error('player_history_failed', e.message); return res.status(502).json({error:'Não foi possível consultar o histórico agora.'}); }
  }
  if ((id !== undefined && (typeof id !== 'string' || !/^\d{1,12}$/.test(id))) || (id === undefined && (typeof q !== 'string' || q.trim().length < 2 || q.length > 100)) || typeof page !== 'string' || !/^[1-9]\d?$/.test(page)) return res.status(400).json({error:'Informe o nome do jogador e uma página válida.'});
  try {
    const signal = AbortSignal.timeout(18000);
    let rows, more = false;
    if (id) rows = [await get('/player/' + id, [], signal)];
    else {
      const term=q.trim(), variant=term.replace(/\bMarquinho\b/i,'Marquinhos');
      const terms=[...new Set([term,variant])];
      const searches=await Promise.all(terms.map(term=>get('/quick-search',[['term',term],['page',page]],signal)));
      const ids=[...new Set(searches.flatMap(x=>x.result?.playerIds || []))];
      more=searches.some(x=>(x.totalCount?.players || 0)>Number(page)*10);
      rows=ids.length ? await get('/players',ids.map(i=>['ids[]',i]),signal) : [];
    }
    if (!Array.isArray(rows)) throw new Error('provider_format');
    const current = p => (p.clubAssignments || []).find(a=>a.type==='current');
    const clubIds=[...new Set(rows.map(p=>current(p)?.clubId).filter(Boolean))];
    const clubs=clubIds.length ? await get('/clubs',clubIds.map(i=>['ids[]',i]),signal) : [];
    const clubMap = new Map(clubs.map(c=>[String(c.id),c.name]));
    const items=rows.filter(p=>p.id && p.name).map(p=>{
      const a=p.attributes || {}, club=current(p), pos=a.position?.name || a.positionGroupName;
      return {id:String(p.id),name:text(p.name),full_name:text(p.displayName),position:text(POS[pos] || ({'Right Winger':'Ponta direita','Left Winger':'Ponta esquerda'})[pos] || pos,40),club:text(clubMap.get(String(club?.clubId)),80),birth_date:iso(p.lifeDates?.dateOfBirth),height:a.height ? Math.round(a.height*100)+' cm' : '',contract_until:iso(a.contractUntil),instagram:'',nationality:'',source:'Transfermarkt',source_url:'https://www.transfermarkt.com/player/profil/spieler/'+encodeURIComponent(p.id)};
    });
    res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=300');
    return res.json({source:'Transfermarkt',items,page:Number(page),has_more:more});
  } catch(e) { console.error('player_lookup_failed',e.message);return res.status(502).json({error:'Não foi possível consultar o Transfermarkt agora. Tente novamente em instantes.'}); }
};
