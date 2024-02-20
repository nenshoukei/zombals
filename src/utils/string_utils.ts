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

/**
 * 検索用に文字列を正規化する。
 *
 * - Unicode 正規化する。(NFC)
 * - ひらがなをカタカナに変換する。
 * - 一部の半角文字を全角文字に置き換える。
 * - 空白を除去する。
 */
export function regularizeStringForSearch(str: string) {
  return str
    .normalize('NFC')
    .replaceAll(/[ぁ-ん]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0x60))
    .replaceAll(CHAR_RE, (m) => CHAR_MAP[m] ?? m)
    .replaceAll(/\s/g, '');
}

/**
 * カード説明文中などで使用される文字列を整形する。
 *
 * - 一部の半角文字を全角文字に置き換える。
 *
 * @param str 文字列
 * @returns 整形済みの文字列
 */
export function regularizeStringForDescription(str: string) {
  return str.replaceAll(CHAR_RE, (m) => CHAR_MAP[m] ?? m);
}

const CHAR_MAP: Record<string, string> = {
  '0': '０',
  '1': '１',
  '2': '２',
  '3': '３',
  '4': '４',
  '5': '５',
  '6': '６',
  '7': '７',
  '8': '８',
  '9': '９',
  '+': '＋',
  '-': '－',
  '%': '％',
  '/': '／',
  '(': '（',
  ')': '）',
  '&': '＆',
  '<': '＜',
  '>': '＞',
  '"': '＂',
  '=': '＝',
  '?': '？',
  '!': '！',
  ':': '：',
};

const CHAR_RE = /[0-9+\-%/()&<>"=?!:]/g;
