import { CircularProgress } from '@nextui-org/react';
import { AppLayout } from '#/components/layout/AppLayout';

export function PageLoading() {
  return (
    <AppLayout>
      <div className="flex-grow flex items-center justify-center">
        <CircularProgress size="lg" />
      </div>
    </AppLayout>
  );
}
