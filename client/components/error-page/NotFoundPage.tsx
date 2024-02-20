import { AppLayout } from '#/components/layout/AppLayout';

export default function NotFoundPage() {
  return (
    <AppLayout>
      <div className="p-3 text-center">
        <h1 className="text-2xl my-5">404 Not Found</h1>
        <p>お探しのページは見つかりませんでした。</p>
      </div>
    </AppLayout>
  );
}
