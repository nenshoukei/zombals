import { NextUIProvider } from '@nextui-org/react';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import RouteErrorPage from '#/components/error-page/RouteErrorPage';
import { ErrorBoundary } from '#/components/layout/ErrorBoundary';
import { PageLoading } from '#/components/layout/PageLoading';

export function Root() {
  const navigate = useNavigate();

  return (
    <ErrorBoundary fallback={<RouteErrorPage />}>
      <Suspense fallback={<PageLoading />}>
        <NextUIProvider navigate={navigate}>
          <main>
            <Outlet />
          </main>
        </NextUIProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
