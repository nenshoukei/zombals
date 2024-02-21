import { Checkbox, CheckboxGroup, Input, Pagination, Select, Selection, SelectItem } from '@nextui-org/react';
import { useDebounce } from '@uidotdev/usehooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ZoomableCardView from '#/components/card/ZoomableCardView';
import { useCurrentSesionLocale } from '#/hooks/useCurrentSession';
import { cardRegistry } from '@/registry';
import {
  CARD_PACKS,
  CARD_RARITIES,
  CardDefinitionBase,
  CardJob,
  CardPack,
  cardPackNameMap,
  CardRarity,
  cardRarityNameMap,
  CardType,
  cardTypeNameMap,
  UNIT_KINDS,
  UnitCardDefinition,
  UnitKind,
  unitKindNameMap,
} from '@/types';
import { regularizeStringForSearch } from '@/utils/string_utils';

export type CardSearchViewProps = {
  job: CardJob;
  onPressCard?: (cardDefId: number) => void;
};

type CardSearchFilter = {
  search?: string;
  cost?: string; // "1,2,3" のようにカンマ区切りで複数指定
  type?: string; // 同上 CardType
  rarity?: string; // 同上 CardRarity
  unitKind?: string; // 同上 UnitKind
  pack?: string; // 同上 CardPack
};

const searchOrderOptions = [
  ['cost:asc', 'コストが小さい順'],
  ['cost:desc', 'コストが大きい順'],
  ['name:asc', '名前 昇順'],
  ['name:desc', '名前 降順'],
  ['rarity:asc', 'レアリティが低い順'],
  ['rarity:desc', 'レアリティが高い順'],
] as const;
type SearchOrderValue = (typeof searchOrderOptions)[number][0];

const CARDS_PER_PAGE = 48;

export default function CardSearchView({ job, onPressCard }: CardSearchViewProps) {
  const locale = useCurrentSesionLocale();
  const [filter, setFilter] = useState<CardSearchFilter>({});
  const [order, setOrder] = useState<SearchOrderValue>('cost:asc');
  const [page, setPage] = useState(1);

  const allCards = useMemo(() => {
    const cards: CardDefinitionBase[] = [];
    for (const card of cardRegistry.scanAll()) {
      if ((card.job === CardJob.COMMON || card.job === job) && !card.isToken) {
        cards.push(card);
      }
    }
    cards.sort((a, b) => a.id - b.id);
    return cards;
  }, [job]);

  const searchStringMap = useMemo(() => {
    const map = new Map<CardDefinitionBase, string>();
    for (const card of allCards) {
      const search = regularizeStringForSearch(card.name[locale]) + '\n' + regularizeStringForSearch(card.description[locale]);
      map.set(card, search);
    }
    return map;
  }, [allCards]);

  const searchedCards = useMemo(() => {
    const regSearch = regularizeStringForSearch(filter.search ?? '');
    const costs = filter.cost ? filter.cost.split(',').map((s) => parseInt(s, 10)) : undefined;
    const cost10More = costs ? costs.includes(10) : false;
    const types = filter.type ? filter.type.split(',').map((s) => parseInt(s, 10) as CardType) : undefined;
    const rarities = filter.rarity ? filter.rarity.split(',').map((s) => parseInt(s, 10) as CardRarity) : undefined;
    const unitKinds = filter.unitKind ? filter.unitKind.split(',').map((s) => parseInt(s, 10) as UnitKind) : undefined;
    const packs = filter.pack ? filter.pack.split(',').map((s) => parseInt(s, 10) as CardPack) : undefined;

    return allCards.filter((card) => {
      if (regSearch) {
        const search = searchStringMap.get(card)!;
        if (!search.includes(regSearch)) return false;
      }
      if (costs) {
        if (costs.includes(card.cost)) return true;
        if (cost10More && card.cost >= 10) return true;
        return false;
      }
      if (types && !types.includes(card.type)) return false;
      if (rarities && !rarities.includes(card.rarity)) return false;
      if (unitKinds) {
        if (card.type !== CardType.UNIT) return false;
        if (!unitKinds.includes((card as UnitCardDefinition).kind)) return false;
      }
      if (packs && !packs.includes(card.pack)) return false;
      return true;
    });
  }, [allCards, filter]);

  const sortedCards = useMemo(() => {
    let comparer: (a: CardDefinitionBase, b: CardDefinitionBase) => number;
    switch (order) {
      case 'cost:asc':
        comparer = (a, b) => a.cost - b.cost || a.id - b.id;
        break;
      case 'cost:desc':
        comparer = (a, b) => b.cost - a.cost || a.id - b.id;
        break;
      case 'name:asc':
        comparer = (a, b) => a.name[locale].localeCompare(b.name[locale]) || a.id - b.id;
        break;
      case 'name:desc':
        comparer = (a, b) => b.name[locale].localeCompare(a.name[locale]) || a.id - b.id;
        break;
      case 'rarity:asc':
        comparer = (a, b) => a.rarity - b.rarity || a.id - b.id;
        break;
      case 'rarity:desc':
        comparer = (a, b) => b.rarity - a.rarity || a.id - b.id;
        break;
    }
    return [...searchedCards].sort(comparer);
  }, [searchedCards, order]);

  const pageCards = sortedCards.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const handleFilterChange = useCallback((newFilter: CardSearchFilter) => {
    setPage(1);
    setFilter(newFilter);
  }, []);

  return (
    <>
      <div className="mb-4 rounded-lg bg-default-100 p-3">
        <CardSearchFilterForm filter={filter} onChange={handleFilterChange} />
      </div>

      <div className="flex gap-4 items-center">
        <Pagination total={Math.ceil(searchedCards.length / CARDS_PER_PAGE)} page={page} onChange={setPage} showControls />
        <div className="ml-auto flex-shrink-0 w-64">
          <Select
            name="order"
            label="並び順"
            size="sm"
            variant="bordered"
            value={order}
            onChange={(ev) => setOrder(ev.target.value as SearchOrderValue)}
          >
            {searchOrderOptions.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        {pageCards.map((card) => (
          <div key={card.id}>
            <ZoomableCardView
              cardDefId={card.id}
              isPressable={!!onPressCard}
              onPress={onPressCard ? () => onPressCard(card.id) : undefined}
            />
          </div>
        ))}
      </div>

      <Pagination total={Math.ceil(searchedCards.length / CARDS_PER_PAGE)} page={page} onChange={setPage} showControls />
    </>
  );
}

const costOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const typeOptions = [CardType.UNIT, CardType.SPELL, CardType.WEAPON, CardType.HERO, CardType.BUILDING] as const;
const checkboxGroupClassNames = { base: 'flex-row mt-2', label: 'text-foreground w-32' };

type CardSearchFilterFormProps = {
  filter: CardSearchFilter;
  onChange: (newFilter: CardSearchFilter) => void;
};

function CardSearchFilterForm({ filter, onChange }: CardSearchFilterFormProps) {
  const locale = useCurrentSesionLocale();

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  const [search, setSearch] = useState(filter.search ?? '');
  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
    onChange({ ...filter, search: debouncedSearch });
  }, [debouncedSearch]);

  const packs = useMemo(() => (filter.pack ? filter.pack.split(',') : []), [filter.pack]);
  const handlePackChange = useCallback(
    (packs: Selection) => {
      if (packs === 'all') {
        onChange({ ...filter, pack: undefined });
      } else {
        onChange({ ...filter, pack: [...packs].join(',') });
      }
    },
    [onChange],
  );

  const costs = useMemo(() => (filter.cost ? filter.cost.split(',') : []), [filter.cost]);
  const handleCostChange = useCallback(
    (costs: string[]) => {
      onChange({ ...filter, cost: costs.join(',') });
    },
    [onChange],
  );

  const types = useMemo(() => (filter.type ? filter.type.split(',') : []), [filter.type]);
  const handleTypeChange = useCallback(
    (types: string[]) => {
      onChange({ ...filter, type: types.join(',') });
    },
    [onChange],
  );

  const rarities = useMemo(() => (filter.rarity ? filter.rarity.split(',') : []), [filter.rarity]);
  const handleRarityChange = useCallback(
    (rarities: string[]) => {
      onChange({ ...filter, rarity: rarities.join(',') });
    },
    [onChange],
  );

  const unitKinds = useMemo(() => (filter.unitKind ? filter.unitKind.split(',') : []), [filter.unitKind]);
  const handleUnitKindChange = useCallback(
    (unitKinds: string[]) => {
      onChange({ ...filter, unitKind: unitKinds.join(',') });
    },
    [onChange],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4 relative items-center">
        <Input
          type="search"
          size="sm"
          aria-label="テキスト検索"
          placeholder="カード名や説明文の一部で検索"
          name="search"
          variant="bordered"
          isClearable
          value={search}
          onValueChange={setSearch}
          className="flex-1"
        />

        <Select
          label="収録カードパック"
          size="sm"
          name="pack"
          variant="bordered"
          selectionMode="multiple"
          value={packs}
          onSelectionChange={handlePackChange}
          className="flex-1  max-w-[50%]"
        >
          {CARD_PACKS.map((pack) => (
            <SelectItem key={pack} value={pack}>
              {cardPackNameMap[pack][locale]}
            </SelectItem>
          ))}
        </Select>
      </div>

      <CheckboxGroup
        label="コスト"
        orientation="horizontal"
        classNames={checkboxGroupClassNames}
        value={costs}
        onValueChange={handleCostChange}
      >
        {costOptions.map((cost) => (
          <Checkbox key={cost} value={String(cost)}>
            {cost === 10 ? `10 以上` : cost}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <CheckboxGroup
        label="カード種別"
        orientation="horizontal"
        classNames={checkboxGroupClassNames}
        value={types}
        onValueChange={handleTypeChange}
      >
        {typeOptions.map((type) => (
          <Checkbox key={type} value={String(type)}>
            {cardTypeNameMap[type][locale]}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <CheckboxGroup
        label="レアリティ"
        orientation="horizontal"
        classNames={checkboxGroupClassNames}
        value={rarities}
        onValueChange={handleRarityChange}
      >
        {CARD_RARITIES.map((rarity) => (
          <Checkbox key={rarity} value={String(rarity)}>
            {cardRarityNameMap[rarity][locale]}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <CheckboxGroup
        label="ユニット系統"
        orientation="horizontal"
        classNames={checkboxGroupClassNames}
        value={unitKinds}
        onValueChange={handleUnitKindChange}
      >
        {UNIT_KINDS.map((kind) => (
          <Checkbox key={kind} value={String(kind)}>
            {unitKindNameMap[kind][locale]}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </form>
  );
}
