import { Button, Input } from '@nextui-org/react';
import ky from 'ky';
import { useState } from 'react';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { Deck, DeckId } from '@/types';

export type DeckNameTitleProps = {
  deckName: string;
  deckId?: DeckId;
  onUpdate?: (deck: Deck) => void;
};

export default function DeckNameTitle({ deckName, deckId, onUpdate }: DeckNameTitleProps) {
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [name, setName] = useState('');
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const startNameEdit = () => {
    setIsNameEditing(true);
    setName(deckName);
  };

  const handleNameEditKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      setIsNameEditing(false);
    }
  };

  const handleNameSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (name === deckName || !deckId) {
      setIsNameEditing(false);
      return;
    }
    if (name === '') {
      return;
    }

    setSaveButtonState('submitting');
    (async () => {
      return (await ky.post('/api/deck/update', { json: { deckId, name } }).json()) as { deck: Deck };
    })()
      .then((res) => {
        setSaveButtonState('success');
        setIsNameEditing(false);
        onUpdate?.(res.deck);
      })
      .catch(() => {
        setSaveButtonState('error');
      });
  };

  return (
    <h2 className="text-2xl font-bold px-4 py-3 flex items-center">
      <span className="icon-[mdi--cards-outline] mr-1" />
      {isNameEditing ? (
        <form className="flex items-center" onSubmit={handleNameSubmit}>
          <Input
            size="sm"
            autoFocus
            variant="bordered"
            value={name}
            onValueChange={setName}
            onKeyDown={handleNameEditKeyDown}
            className="ml-2 w-unit-8xl"
          />
          <SaveButton state={saveButtonState} variant="solid" className="ml-3 min-w-32" size="lg" />
          <Button variant="solid" color="default" className="ml-3 min-w-32" size="lg" onPress={() => setIsNameEditing(false)}>
            キャンセル
          </Button>
        </form>
      ) : (
        <>
          {deckName || '新しいデッキ'}

          {deckId ? (
            <Button isIconOnly size="sm" className="ml-2" variant="flat" onPress={startNameEdit}>
              <span className="icon-[mdi--edit] ml-1 text-2xl text-default-500" />
            </Button>
          ) : null}
        </>
      )}
    </h2>
  );
}
