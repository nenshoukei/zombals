import cookie from 'cookie';
import { Response } from 'express';
import { createDecoder, createSigner } from 'fast-jwt';
import { z } from 'zod';
import { SERVER_SECURE_KEY } from '../../keys.json';
import type { IncomingMessage } from 'node:http';
import { zLoginId } from '@/server/types';
import { zUserId, zUserName } from '@/types';

export const COOKIE_KEY = 'sid';
export const COOKIE_MAX_AGE = 60 * 24 * 365 * 3;

const signer = createSigner({
  key: SERVER_SECURE_KEY,
});
const decoder = createDecoder();

export const zSession = z.object({
  userId: zUserId,
  name: zUserName,
  loginId: zLoginId.optional(),
});
export type Session = z.infer<typeof zSession>;

/**
 * セッション情報の Set-Header をレスポンスに書き加える
 *
 * @param res レスポンス
 * @param session セッション情報
 */
export function writeSessionToRequest(res: Response, session: Session): void {
  const token = signer(session);
  const setCookie = cookie.serialize(COOKIE_KEY, token, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
  res.setHeader('set-cookie', setCookie);
}

/**
 * セッション情報を削除する（ログアウト）
 *
 * @param res レスポンス
 */
export function deleteSessionInResponse(res: Response): void {
  const setCookie = cookie.serialize(COOKIE_KEY, '', {
    maxAge: 0,
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
  res.setHeader('set-cookie', setCookie);
}

/**
 * リクエストからセッション情報を読み取る
 *
 * @param req リクエスト
 */
export function readSessionFromRequest(req: IncomingMessage): Session | null {
  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    if (cookies[COOKIE_KEY]) {
      const decoded = decoder(cookies[COOKIE_KEY]);
      const parsed = zSession.safeParse(decoded);
      return parsed.success ? parsed.data : null;
    }
  }
  return null;
}
