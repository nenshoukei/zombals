import { createBrowserRouter } from 'react-router-dom';
import RouteErrorPage from '#/components/error-page/RouteErrorPage';
import BattleEntry from '#/routes/battle/entry';
import DeckIndex from '#/routes/deck';
import DeckEdit from '#/routes/deck/edit';
import DeckNew from '#/routes/deck/new';
import Home from '#/routes/home';
import Playground from '#/routes/playground';
import { Root } from '#/routes/root';
import UserEdit from '#/routes/user/edit';
import UserIdentify from '#/routes/user/identify';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/playground',
        element: <Playground />,
      },
      {
        path: '/user/edit',
        element: <UserEdit />,
      },
      {
        path: '/user/identify',
        element: <UserIdentify />,
      },
      {
        path: '/deck',
        element: <DeckIndex />,
      },
      {
        path: '/deck/new',
        element: <DeckNew />,
      },
      {
        path: '/deck/:deckId',
        element: <DeckEdit />,
      },
      {
        path: '/battle/entry',
        element: <BattleEntry />,
      },
    ],
  },
]);
