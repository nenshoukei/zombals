import { Request, Response } from 'express';
import { z } from 'zod';

export function apiHandler<TReq extends Request, TRes extends Response>(
  fn: (req: TReq, res: TRes) => Promise<void> | void,
): (req: TReq, res: TRes) => void {
  return (req: TReq, res: TRes) => {
    (async () => {
      await fn(req, res);
    })().catch((e) => {
      req.logger?.error({ error: e }, 'Error in api handler');
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

export function apiGetHandler<T extends z.ZodSchema, TReq extends Request, TRes extends Response>(
  query: T,
  fn: (query: z.infer<T>, req: TReq, res: TRes) => Promise<void> | void,
): (req: TReq, res: TRes) => void {
  return (req: TReq, res: TRes) => {
    (async () => {
      const parsed = query.safeParse(req.query);
      if (!parsed.success) {
        req.logger?.debug({ error: parsed.error }, 'Params error');
        res.status(400).json({ error: parsed.error });
        return;
      }
      await fn(parsed.data, req, res);
    })().catch((e) => {
      req.logger?.error({ error: e }, 'Error in api handler');
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

export function apiInputHandler<T extends z.ZodSchema, TReq extends Request, TRes extends Response>(
  input: T,
  fn: (params: z.infer<T>, req: TReq, res: TRes) => Promise<void> | void,
): (req: TReq, res: TRes) => void {
  return (req: TReq, res: TRes) => {
    (async () => {
      const parsed = input.safeParse(req.body);
      if (!parsed.success) {
        req.logger?.debug({ error: parsed.error }, 'Params error');
        res.status(400).json({ error: parsed.error });
        return;
      }
      await fn(parsed.data, req, res);
    })().catch((e) => {
      req.logger?.error({ error: e }, 'Error in api handler');
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}
