import { Input } from '@nextui-org/react';
import ky from 'ky';
import { useEffect, useState } from 'react';
import { SaveButton, useSaveButtonState } from '@/components/form/SaveButton';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCurrentSession } from '@/hooks/useCurrentSession';

export default function UserIdentify() {
  const { session, reload: reloadSession } = useCurrentSession();
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);
  const [bouncedLoginId, setBouncedLoginId] = useState<string>('');
  const checkLoginIdBounced = (value: string) => {
    if (value === '') {
      setLoginIdAvailable(null);
      setBouncedLoginId('');
    } else {
      setBouncedLoginId(value);
    }
  };
  useEffect(() => {
    if (bouncedLoginId === '') return;
    let ignore = false;
    const timer = setTimeout(() => {
      ky.post('/api/user/idcheck', { json: { loginId: bouncedLoginId } })
        .json<{ isAvailable: boolean }>()
        .then((data) => {
          if (ignore) return;
          setLoginIdAvailable(data.isAvailable);
        })
        .catch((err) => {
          if (ignore) return;
          console.error(err);
          setLoginIdAvailable(null);
        });
    }, 500);
    return () => {
      clearTimeout(timer);
      ignore = true;
    };
  }, [bouncedLoginId]);

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (loginIdAvailable === false) return;

    const data = new FormData(ev.currentTarget);
    const loginId = data.get('loginId');
    const password = data.get('password');
    if (loginId === '' || password === '') return;

    setSaveButtonState('submitting');
    ky.post('/api/user/identify', { json: { loginId, password } })
      .json()
      .then(() => {
        reloadSession();
        setSaveButtonState('success');
      })
      .catch((err) => {
        console.error(err);
        setSaveButtonState('error');
      });
  };

  return (
    <AppLayout>
      <div className="p-3">
        <h1 className="text-center text-2xl mt-5">ログインIDとパスワードの{session?.loginId ? '変更' : '設定'}</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mt-10 w-3/5 mx-auto gap-5">
            <Input
              key="loginIdInput"
              autoFocus
              label="ログインID"
              variant="bordered"
              name="loginId"
              defaultValue={session?.loginId ?? ''}
              autoComplete="username"
              endContent={<span className="icon-[mdi--account] text-4xl text-default-400 pointer-events-none" />}
              color={loginIdAvailable ? 'success' : undefined}
              isInvalid={loginIdAvailable === false}
              description={loginIdAvailable === true ? '利用可能なログインIDです' : undefined}
              errorMessage={loginIdAvailable === false ? 'このログインIDは既に使われています' : undefined}
              onChange={(ev) => {
                checkLoginIdBounced(ev.target.value);
              }}
            />
            <Input
              key="passwordInput"
              label="パスワード"
              type="password"
              variant="bordered"
              name="password"
              defaultValue=""
              autoComplete="new-password"
              endContent={<span className="icon-[mdi--password] text-4xl text-default-400 pointer-events-none" />}
            />
            <SaveButton state={saveButtonState} />
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
