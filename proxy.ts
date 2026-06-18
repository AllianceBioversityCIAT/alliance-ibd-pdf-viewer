import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey } from './lib/clarisa';

export async function proxy(request: NextRequest) {
  // Allow admin access
  if (request.headers.get('x-admin-secret')) {
    return NextResponse.next();
  }

  // Extract API key from headers
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  
  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      { error: 'Unauthorized: API Key is missing.' },
      { status: 401 }
    );
  }

  // Try to get IP address from proxy headers (NextRequest has no .ip property)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    undefined;
  const endpointAccessed = request.nextUrl.pathname;

  // Validate API key against CLARISA
  const authData = await validateApiKey(apiKey, endpointAccessed, ipAddress);

  if (!authData.valid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid API Key.' },
      { status: 401 }
    );
  }

  // If valid, create a new response and pass metadata via headers
  // so the internal API routes can read who is requesting
  const requestHeaders = new Headers(request.headers);
  
  if (authData.data && authData.data.mis) {
    const misData = authData.data.mis;
    if (misData.acronym) {
      requestHeaders.set('x-clarisa-app-acronym', misData.acronym);
    }
    if (misData.name) {
      requestHeaders.set('x-clarisa-app-name', misData.name);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Config ensures middleware only runs on specific routes
export const config = {
  matcher: [
    // Apply to all /api routes
    '/api/:path*',
  ],
};
