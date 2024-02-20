import { useNavigate, useParams } from 'react-router-dom';
import { DeckEditor } from '#/components/deck/DeckEditor';
import NotFoundPage from '#/components/error-page/NotFoundPage';
import { AppLayout } from '#/components/layout/AppLayout';
import { PageLoading } from '#/components/layout/PageLoading';
import { useDeck } from '#/hooks/useDeck';
import { Deck } from '@/types';

export default function DeckEdit() {
  const { deckId } = useParams();
  const { deck, isLoading, mutate: mutateDeck } = useDeck(deckId);
  const navigate = useNavigate();

  const handleUpdateDeck = (deck: Deck) => {
    mutateDeck({ deck });
    setTimeout(() => {
      navigate('/deck');
    }, 500);
  };
  const handleUpdateDeckName = (deck: Deck) => {
    mutateDeck({ deck });
  };

  if (isLoading || deck === undefined) {
    return <PageLoading />;
  }
  if (!deck || !deckId) {
    return <NotFoundPage />;
  }
  return (
    <AppLayout size="lg">
      <DeckEditor job={deck.job} deck={deck} onUpdateDeck={handleUpdateDeck} onUpdateDeckName={handleUpdateDeckName} />
    </AppLayout>
  );
}
