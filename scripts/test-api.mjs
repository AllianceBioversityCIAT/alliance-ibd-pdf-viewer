#!/usr/bin/env node
/**
 * Test script for /api/data endpoint
 * 
 * Usage:
 *   node scripts/test-api.mjs <LAMBDA_URL> [API_SECRET]
 * 
 * Example:
 *   node scripts/test-api.mjs https://abc123.lambda-url.us-east-1.on.aws my-secret
 */

const LAMBDA_URL = process.argv[2];
const API_SECRET = process.argv[3] || process.env.API_SECRET;

if (!LAMBDA_URL) {
  console.error('Usage: node scripts/test-api.mjs <LAMBDA_URL> [API_SECRET]');
  process.exit(1);
}

const testData = {
  title: "Test Document",
  content: "This is a test document",
  metadata: {
    author: "Test User",
    timestamp: new Date().toISOString(),
  },
};

async function testAPI() {
  try {
    console.log('Testing POST /api/data...');
    console.log('URL:', LAMBDA_URL);
    console.log('Body:', JSON.stringify(testData, null, 2));

    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_SECRET) {
      headers['x-api-secret'] = API_SECRET;
    }

    const response = await fetch(`${LAMBDA_URL}/api/data`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.uuid) {
      console.log('\n✅ SUCCESS: Request accepted, UUID:', responseData.uuid);
      return 0;
    } else {
      console.error('\n❌ FAILED: Request rejected');
      console.error('Error:', responseData.error || responseData);
      return 1;
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return 1;
  }
}

testAPI().then(code => process.exit(code));
