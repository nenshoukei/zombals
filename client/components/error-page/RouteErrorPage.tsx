import { ErrorResponse, useRouteError } from 'react-router-dom';
import NotFoundPage from '#/components/error-page/NotFoundPage';
import { AppLayout } from '#/components/layout/AppLayout';

export default function RouteErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      {error && (error as ErrorResponse).status === 404 ? (
        <NotFoundPage />
      ) : (
        <AppLayout>
          <div className="p-3 text-center">
            <h1 className="text-2xl my-5">Oops...</h1>
            <p>エラーが発生しました。画面を再読み込みしてください。</p>
          </div>
        </AppLayout>
      )}
    </div>
  );
}
