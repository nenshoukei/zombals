import { Modals } from '@generouted/react-router';
import { CircularProgress } from '@nextui-org/react';
import { NextUIProvider } from '@nextui-org/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

export const Catch = () => {
  return <div>エラーが発生しました。画面を再読み込みしてください。</div>;
};

export const Pending = () => {
  return (
    <div className="p-2">
      <CircularProgress label="読み込み中です" />
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <RecoilRoot>
        <div>
          <main>
            <Outlet />
          </main>

          <Modals />
        </div>
      </RecoilRoot>
    </NextUIProvider>
  );
}
