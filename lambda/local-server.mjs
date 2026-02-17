/**
 * Local development server to simulate Lambda behavior
 * 
 * Usage: node lambda/local-server.mjs
 * Then visit: http://localhost:3000
 */

import { createServer } from 'http';
import { handler } from './handler.mjs';

const PORT = 3000;

// Simulate Lambda Function URL event
function createLambdaEvent(req) {
    return {
        requestContext: {
            domainName: 'localhost',
            http: {
                method: req.method,
            },
        },
        rawPath: req.url,
        rawQueryString: '',
        headers: req.headers,
        body: null,
        isBase64Encoded: false,
    };
}

const server = createServer(async (req, res) => {
    try {
        const event = createLambdaEvent(req);
        const response = await handler(event, {});

        // Set headers
        Object.entries(response.headers || {}).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // Set status
        res.statusCode = response.statusCode;

        // Send body
        if (response.isBase64Encoded) {
            res.write(Buffer.from(response.body, 'base64'));
        } else {
            res.write(response.body);
        }

        res.end();
    } catch (error) {
        console.error('Server error:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Local Lambda server running at http://localhost:${PORT}`);
    console.log('Make sure to run "npm run build" first to generate the out/ directory');
});
