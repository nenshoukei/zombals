import { Input } from '@nextui-org/react';
import ky from 'ky';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { AppLayout } from '#/components/layout/AppLayout';
import { useCurrentSession } from '#/hooks/useCurrentSession';

export default function UserEdit() {
  const { reload } = useCurrentSession();
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const name = data.get('name');
    if (name === '') return;

    setSaveButtonState('submitting');
    ky.post('/api/user/update', { json: { name } })
      .json()
      .then(() => {
        reload();
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
        <h1 className="text-center text-2xl mt-5">プレイヤー名の変更</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mt-10 w-3/5 mx-auto gap-5">
            <Input
              key="userNameInput"
              autoFocus
              size="lg"
              label="新しいプレイヤー名"
              description="対戦相手に表示されます。ひらがな、カタカナ、漢字等が使えます。"
              name="name"
              defaultValue=""
              variant="bordered"
              autoComplete="off"
              endContent={<span className="icon-[mdi--account-circle] text-4xl text-default-400 pointer-events-none" />}
            />
            <SaveButton state={saveButtonState} size="lg" className="mx-auto min-w-40" />
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
