/**
 * Cloudflare Worker — proxy seguro para Groq API
 *
 * DESPLIEGUE:
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler deploy cloudflare-worker.js --name ags-chat
 *   4. wrangler secret put GROQ_API_KEY   ← pega tu clave cuando te la pida
 *   5. Actualiza WORKER_URL en index.html con la URL que te da wrangler
 *
 * La clave NUNCA sale del worker. El cliente solo llama a /chat.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/chat') {
      const body = await request.json();

      const groqRes = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await groqRes.json();

      return new Response(JSON.stringify(data), {
        status: groqRes.status,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};
