// Vercel Serverless Function: Scheduled Discord Challenge Dispatcher
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSchedulerRequest } from '../_lib/scheduler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleSchedulerRequest(req, res, { platform: 'discord' });
}
