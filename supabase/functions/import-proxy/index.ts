// Supabase Edge Function: import-proxy
//
// Fetches a product page server-side (so the browser PWA bypasses CORS) using a real browser
// User-Agent, then returns the raw HTML. The client parses Open Graph / meta tags from it.
//
// Deploy:  supabase functions deploy import-proxy --no-verify-jwt
// (or with JWT if you only want signed-in users to call it — the app sends the auth token.)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return json({ ok: false, error: 'bad-url' }, 400);
    }

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) return json({ ok: false, error: `upstream-${res.status}` }, 200);

    const html = await res.text();
    return json({ ok: true, html, finalUrl: res.url }, 200);
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 200);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
