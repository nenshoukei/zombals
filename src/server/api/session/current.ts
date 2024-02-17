import { Request, Response } from 'express';
import { readSessionFromRequest } from '@/server/session';

export function sessionCurrent(req: Request, res: Response) {
  const session = readSessionFromRequest(req);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ session });
}
