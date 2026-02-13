import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  const db = runtime.env.DB;

  try {
    const json = await request.json();
    const uuid = crypto.randomUUID();
    const result = await db
      .prepare('INSERT INTO remaining_jsons (json, uuid) VALUES (?, ?)')
      .bind(JSON.stringify(json), uuid)
      .run();

    return new Response(
      JSON.stringify({ id: result.meta.last_row_id, uuid }),
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
