export interface ClarisaValidationResponse {
  valid: boolean;
  data: any | null;
}

export async function validateApiKey(
  apiKey: string,
  endpointAccessed: string,
  ipAddress?: string
): Promise<ClarisaValidationResponse> {
  const baseUrl = process.env.CLARISA_HOST || 'https://api.clarisa.cgiar.org';
  
  let normalizedUrl = baseUrl.trim();
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  if (normalizedUrl.endsWith('/api')) {
    normalizedUrl = normalizedUrl.slice(0, -4);
  }

  const url = `${normalizedUrl}/api/auth/validate-api-key`;
  // Using the fallback as requested
  const microserviceName = process.env.CLARISA_MICROSERVICE_NAME || 'PDF Viewer Ms9';

  const body = {
    api_key: apiKey.trim(),
    microservice_name: microserviceName,
    endpoint_accessed: endpointAccessed,
    ip_address: ipAddress || '',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`CLARISA responded with status: ${response.status}`);
      return { valid: false, data: null };
    }

    const data = await response.json();
    
    if (data && data.valid) {
      return {
        valid: true,
        data: data,
      };
    }
    
    return { valid: false, data: null };
  } catch (error) {
    console.error('Error validating API Key with CLARISA:', error);
    return { valid: false, data: null };
  }
}
