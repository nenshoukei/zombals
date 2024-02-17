import { NextFunction, Request, Response } from 'express';
import { readSessionFromRequest, Session } from './session';

declare module 'express' {
  export interface Request {
    session?: Session;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = readSessionFromRequest(req);
  if (session) {
    req.session = session;
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}
