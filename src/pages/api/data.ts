import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  const db = runtime.env.DB;

  try {
    const json = await request.json();
    const timestamp = Date.now().toString(36);
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const random = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    const uuid = timestamp + '-' + random;
    await db
      .prepare('INSERT INTO remaining_jsons (json, uuid) VALUES (?, ?)')
      .bind(JSON.stringify(json), uuid)
      .run();

    return new Response(
      JSON.stringify({ uuid }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
