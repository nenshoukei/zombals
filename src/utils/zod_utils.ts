import { z } from 'zod';

/**
 * 既存の type/interface に対して Zod スキーマが合致するかチェックする
 *
 * @see https://github.com/colinhacks/zod/issues/372#issuecomment-826380330
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const schemaForType = <T, S extends z.ZodType<T, any, any> = z.ZodType<T, any, any>>(arg: S): S => {
  return arg;
};
