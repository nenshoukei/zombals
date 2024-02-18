import { CircularProgress } from '@nextui-org/react';
import { NextUIProvider } from '@nextui-org/react';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '#/components/layout/ErrorBoundary';
import ErrorPage from '#/error-page';

const Pending = () => {
  return (
    <div className="p-2">
      <CircularProgress label="読み込み中です" />
    </div>
  );
};

export function Root() {
  const navigate = useNavigate();

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Pending />}>
        <NextUIProvider navigate={navigate}>
          <main>
            <Outlet />
          </main>
        </NextUIProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
