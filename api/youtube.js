const ALLOWED_ENDPOINTS = new Set(['search', 'videos', 'channels']);

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const endpoint = String(req.query?.endpoint || '');
  if (!ALLOWED_ENDPOINTS.has(endpoint)) return json(res, 400, { error: 'Unsupported YouTube API endpoint' });
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return json(res, 500, { error: 'YouTube API is not configured' });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'endpoint' || value == null) continue;
    for (const item of (Array.isArray(value) ? value : [value])) params.append(key, String(item));
  }
  params.set('key', apiKey);
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`, { headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) return json(res, response.status, { error: data?.error?.message || 'YouTube API request failed' });
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return json(res, 200, data);
  } catch { return json(res, 502, { error: 'Unable to reach YouTube right now' }); }
}
