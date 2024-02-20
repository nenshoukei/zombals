import { Button, Input } from '@nextui-org/react';
import ky from 'ky';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DeckEditor } from '#/components/deck/DeckEditor';
import NotFoundPage from '#/components/error-page/NotFoundPage';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { AppLayout } from '#/components/layout/AppLayout';
import { PageLoading } from '#/components/layout/PageLoading';
import { useDeck } from '#/hooks/useDeck';
import { Deck } from '@/types';

export default function DeckEdit() {
  const { deckId } = useParams();
  const { deck, isLoading, mutate: mutateDeck } = useDeck(deckId);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [name, setName] = useState('');
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const startNameEdit = () => {
    if (!deck) return;
    setIsNameEditing(true);
    setName(deck.name);
  };

  const handleNameEditKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      setIsNameEditing(false);
    }
  };

  const handleNameSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!deck || name === deck.name) {
      setIsNameEditing(false);
      return;
    }
    if (name === '') {
      return;
    }

    setSaveButtonState('submitting');
    (async () => {
      return (await ky.post('/api/deck/update', { json: { deckId: deck.id, name } }).json()) as { deck: Deck };
    })()
      .then((res) => {
        mutateDeck(res);
        setSaveButtonState('success');
        setIsNameEditing(false);
      })
      .catch(() => {
        setSaveButtonState('error');
      });
  };

  if (isLoading || deck === undefined) {
    return <PageLoading />;
  }
  if (!deck) {
    return <NotFoundPage />;
  }
  return (
    <AppLayout size="lg">
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
            {deck.name}
            <Button isIconOnly size="sm" className="ml-2" variant="flat" onPress={startNameEdit}>
              <span className="icon-[mdi--edit] ml-1 text-2xl text-default-500" />
            </Button>
          </>
        )}
      </h2>

      <div className="px-3 pb-3">
        <DeckEditor job={deck.job} deck={deck} />
      </div>
    </AppLayout>
  );
}
