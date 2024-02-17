import { LocaleString } from '../types/common';

const RE = /(%%)|%(\w+)%/g;

/**
 * LocaleString のテンプレートを作成する。
 *
 * ```
 * const template = templateLocaleString({
 *   ja: '明日の天気は %weather% です'
 * });
 *
 * console.log(template({ weather: '晴れ' })); // { "ja": "明日の天気は 晴れ です" }
 * ```
 *
 * @param template
 * @returns
 */
export function templateLocaleString<T extends Record<string, unknown> = Record<string, unknown>>(
  template: LocaleString,
): (dict: T) => LocaleString {
  return (dict) => {
    return {
      ja: template.ja.replaceAll(RE, (_, escaped, varName) => (escaped ? '%' : String(dict[varName] ?? ''))),
    };
  };
}
