import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const json = await request.json();
    const timestamp = Date.now().toString(36);
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const random = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    const uuid = timestamp + '-' + random;
    
    const db = getDatabase();
    await db.insert(uuid, json);

    return new Response(
      JSON.stringify({ uuid }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    // Log error without exposing request body or sensitive data
    console.error('API error:', {
      message: e.message,
      stack: e.stack,
      // Don't log request body or UUID in production
    });
    // Return generic error message to client (don't expose internal details)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
