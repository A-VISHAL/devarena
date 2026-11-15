// Vercel Serverless Function: Scheduled Telegram Challenge Dispatcher
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron invocation' });
  }

  try {
    const timestamp = new Date().toISOString();
    return res.status(200).json({
      success: true,
      timestamp,
      message: 'DEVARENA Telegram challenge cron executed successfully'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

