import { Request, Response } from 'express';
import { deleteSessionInResponse } from '@/server/session';

export function sessionLogout(req: Request, res: Response) {
  deleteSessionInResponse(res);
  res.status(200).json({ message: 'Logged out' });
}
