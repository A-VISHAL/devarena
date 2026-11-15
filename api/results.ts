// Vercel Serverless Function: Shared Results API
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Receive and acknowledge shared result payload
  if (req.method === 'POST') {
    const result = req.body || {};
    return res.status(200).json({
      success: true,
      id: result.id || `res_${Date.now()}`,
      message: 'Result acknowledged by stateless server'
    });
  }

  // GET: Client fallback will decode directly from URL or localStorage
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'stateless_mode',
      message: 'Results are verified client-side via URL payloads and localStorage'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

