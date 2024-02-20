import { useMemo } from 'react';
import { cardRegistry } from '@/registry';
import { Id } from '@/types';

export type ManaCurveGraphProps = {
  cardDefIds: Id[];
};

const COSTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ManaCurveGraph({ cardDefIds }: ManaCurveGraphProps) {
  const costToCountMap = useMemo(() => {
    const costToCountMap = new Map<number, number>();
    cardDefIds.forEach((cardDefId) => {
      const card = cardRegistry.getById(cardDefId);
      if (!card) return;

      const aCost = card.cost > 10 ? 10 : card.cost;
      const item = costToCountMap.get(aCost);
      costToCountMap.set(aCost, item ? item + 1 : 1);
    });
    return costToCountMap;
  }, [cardDefIds]);

  return (
    <div className="flex gap-1">
      {COSTS.map((cost) => {
        const count = costToCountMap.get(cost) ?? 0;
        const max = Math.max(...Array.from(costToCountMap.values()));
        return (
          <div key={cost} className="flex flex-col w-5 relative justify-end">
            <div className="h-[60px] raltive flex flex-col justify-end">
              <div className="bg-default-700" style={{ height: `${Math.round((count / max) * 100)}%` }} />
            </div>
            <div className="text-small font-bold mt-0.5 text-center bg-[#328dc5] text-white rounded">{cost === 10 ? '+' : cost}</div>
            <div className="text-small font-bold mt-0.5 text-center bg-background text-foreground rounded">{count}</div>
          </div>
        );
      })}
    </div>
  );
}
