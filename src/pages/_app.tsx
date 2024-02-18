import { Modals } from '@generouted/react-router';
import { Outlet } from 'react-router-dom';

export const Catch = () => {
  return <div>エラーが発生しました。画面を再読み込みしてください。</div>;
};

export const Pending = () => {
  return <div>読み込み中…</div>;
};

export default function App() {
  return (
    <section>
      <main>
        <Outlet />
      </main>

      <Modals />
    </section>
  );
}
