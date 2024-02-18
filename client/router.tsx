import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from '#/error-page';
import Home from '#/routes/home';
import Playground from '#/routes/playground';
import { Root } from '#/routes/root';
import UserEdit from '#/routes/user/edit';
import UserIdentify from '#/routes/user/identify';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
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
    ],
  },
]);
