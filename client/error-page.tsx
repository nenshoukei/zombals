import { ErrorResponse, useRouteError } from 'react-router-dom';
import { AppLayout } from '#/components/layout/AppLayout';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <AppLayout>
        <div className="p-3 text-center">
          <h1 className="text-2xl my-5">Oops...</h1>
          {error && (error as ErrorResponse).status === 404 ? (
            <p>お探しのページは見つかりませんでした。</p>
          ) : (
            <p>エラーが発生しました。画面を再読み込みしてください。</p>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
