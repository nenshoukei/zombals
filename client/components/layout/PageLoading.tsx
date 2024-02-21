import { CircularProgress } from '@nextui-org/react';

export function PageLoading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <CircularProgress size="lg" />
    </div>
  );
}
