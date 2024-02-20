import { cardRegistry } from '@/registry';
import { Id } from '@/types';

/**
 * カード定義IDの配列を正規化ソートする。
 *
 * - コストが小さい順, ID 順でソートする。
 *
 * @param cardDefIds カード定義IDの配列
 * @returns ソート済みのカード定義IDの配列 (in-place ではない)
 */
export function sortCardDefinitionIds(cardDefIds: Id[]): Id[] {
  const defMap = Object.fromEntries(cardDefIds.map((id) => [id, cardRegistry.getById(id)]));
  return [...cardDefIds].sort((a, b) => {
    const defA = defMap[a];
    const defB = defMap[b];
    return defA.cost - defB.cost || defA.id - defB.id;
  });
}
