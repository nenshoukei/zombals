import { NextFunction, Request, Response } from 'express';
import { readSessionFromRequest } from './session';
import { Logger, logger } from '@/logger';
import { Session } from '@/types/session';

declare module 'express' {
  export interface Request {
    session?: Session;
    logger?: Logger;
  }
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.session = readSessionFromRequest(req) ?? undefined;
  next();
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.session) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.logger = logger.child({
    tag: 'api',
    userId: req.session?.userId,
  });
  next();
}
