/**
 * Vercel Serverless Function - Proxy for Join Meeting API
 * 
 * This acts as a CORS-safe proxy between your frontend and the actual API
 * Use this if you cannot modify CORS settings on api.medforce-ai.com
 */

export default async function handler(req, res) {
  // Enable CORS for this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { meetUrl } = req.body;

    if (!meetUrl) {
      return res.status(400).json({
        error: 'Missing meetUrl',
        message: 'Request body must include meetUrl field'
      });
    }

    // Validate Google Meet URL format
    if (!meetUrl.startsWith('https://meet.google.com/')) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'meetUrl must be a valid Google Meet URL'
      });
    }

    console.log('🤖 Proxying join request to API for:', meetUrl);

    // Forward the request to the actual API
    const apiUrl = 'https://api.medforce-ai.com/join-meeting';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetUrl })
    });

    // Get the response data
    const data = await response.json();

    // Forward the response status and data
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Error in join-meeting proxy:', error);
    
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message || 'Failed to connect to API server'
    });
  }
}
