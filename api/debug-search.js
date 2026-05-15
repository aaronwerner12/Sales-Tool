export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return res.status(500).json({ error: 'TAVILY_API_KEY not set' });
  const { query } = req.body;
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: tavilyKey, query, max_results: 5, search_depth: 'basic' }),
  }).then(r => r.json()).catch(e => ({ error: e.message }));
  return res.json(r);
}
