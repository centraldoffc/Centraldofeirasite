// GET /api/links -> tudo que a página de links precisa em uma chamada só (perfil, redes e links ativos)
const { q } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    const [p, socials, links] = await Promise.all([
      q('profile?id=eq.1&select=*&limit=1'),
      q('socials?select=*&order=position'),
      q('links?active=eq.true&select=*&order=position')
    ]);
    res.json({ profile: p[0] || null, socials, links });
  } catch (e) {
    res.status(500).json({ error: 'erro_no_servidor' });
  }
};
