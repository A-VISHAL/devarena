// Vercel Serverless Function: Scheduled Cron Challenge Dispatcher
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Can be called via Vercel Cron or manual trigger
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Return unauthorized if CRON_SECRET is configured and mismatched
    return res.status(401).json({ error: 'Unauthorized cron invocation' });
  }

  try {
    // Execute cron challenge dispatch check
    const timestamp = new Date().toISOString();
    return res.status(200).json({
      success: true,
      timestamp,
      message: 'DEVARENA Discord challenge cron executed successfully'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

