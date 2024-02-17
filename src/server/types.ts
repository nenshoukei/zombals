import { z } from 'zod';

/** ログインID */
export const zLoginId = z
  .string()
  .min(1)
  .refine((v): v is LoginId => true);
export type LoginId = string & { __type: 'LoginId' };

/** 生パスワード */
export const zRawPassword = z
  .string()
  .min(1)
  .refine((v): v is RawPassword => true);
export type RawPassword = string & { __type: 'RawPassword' };

/** ハッシュ化されたパスワード */
export const zHashedPassword = z
  .string()
  .min(1)
  .refine((v): v is HashedPassword => true);
export type HashedPassword = string & { __type: 'HashedPassword' };
