import { Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import ky, { HTTPError } from 'ky';
import { useState } from 'react';
import styles from './WelcomeModal.module.css';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { useCurrentSession } from '#/hooks/useCurrentSession';

export function WelcomeModal() {
  const [isLoginMode, setLoginMode] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const { reload: reloadSession } = useCurrentSession();
  const [buttonState, setButtonState] = useSaveButtonState();

  const toggleLoginMode = () => {
    setLoginMode(!isLoginMode);
    setFormErrors({});
  };

  const handleRegisterSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const name = data.get('name');
    if (name === '') return;

    setButtonState('submitting');
    ky.post('/api/user/register', { json: { name } })
      .json()
      .then(() => {
        reloadSession();
        setButtonState('success');
      })
      .catch((err) => {
        console.error(err);
        setButtonState('error');
        if (err.name === 'HTTPError' && (err as HTTPError).response.status === 400) {
          setFormErrors({ name: '不正な名前です' });
        }
      });
  };

  const handleLoginSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const loginId = data.get('loginId');
    const password = data.get('password');
    if (loginId === '' || password === '') return;

    setButtonState('submitting');
    ky.post('/api/session/login', { json: { loginId, password } })
      .json()
      .then(() => {
        reloadSession();
        setButtonState('success');
      })
      .catch(async (err) => {
        console.error(err);
        setButtonState('error');
        if (err.name === 'HTTPError' && (err as HTTPError).response.status === 400) {
          setFormErrors({ login: 'ログインIDまたはパスワードが違います' });
        }
      });
  };

  return (
    <Modal isOpen placement="top-center" isDismissable={false} hideCloseButton backdrop="blur">
      <ModalContent>
        <form onSubmit={isLoginMode ? handleLoginSubmit : handleRegisterSubmit}>
          <ModalHeader className="place-content-center">
            <div className={`${styles.logo} w-[180px] h-[85px] md:w-[360px] md:h-[170px]`}>ZOMBALS</div>
          </ModalHeader>
          <ModalBody>
            {isLoginMode ? (
              <>
                <Input
                  key="loginIdInput"
                  autoFocus
                  label="ログインID"
                  variant="bordered"
                  name="loginId"
                  defaultValue=""
                  autoComplete="username"
                  endContent={<span className="icon-[mdi--account] text-4xl text-default-400 pointer-events-none" />}
                  isInvalid={!!formErrors.login}
                  errorMessage={formErrors.login}
                />
                <Input
                  key="passwordInput"
                  label="パスワード"
                  type="password"
                  variant="bordered"
                  name="password"
                  defaultValue=""
                  autoComplete="current-password"
                  endContent={<span className="icon-[mdi--password] text-4xl text-default-400 pointer-events-none" />}
                  isInvalid={!!formErrors.login}
                />
              </>
            ) : (
              <Input
                key="userNameInput"
                autoFocus
                size="lg"
                label="あなたのプレイヤー名"
                description="対戦相手に表示されます。ひらがな、カタカナ、漢字等が使えます。"
                name="name"
                defaultValue=""
                variant="bordered"
                autoComplete="off"
                endContent={<span className="icon-[mdi--account-circle] text-4xl text-default-400 pointer-events-none" />}
                isInvalid={!!formErrors.name}
                errorMessage={formErrors.name}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <div className="text-default-400 self-center mr-auto">
              <Link
                href="#"
                onClick={(ev) => {
                  ev.preventDefault();
                  toggleLoginMode();
                }}
              >
                {isLoginMode ? (
                  <>
                    <span className="icon-[mdi--register] text-lg mr-1" aria-hidden="true" />
                    新規登録はこちらから
                  </>
                ) : (
                  <>
                    <span className="icon-[mdi--login] text-lg mr-2" aria-hidden="true" />
                    ログイン
                  </>
                )}
              </Link>
            </div>

            <SaveButton state={buttonState} size="lg" successLabel={isLoginMode ? 'ログインしました' : '登録しました'}>
              {isLoginMode ? 'ログイン' : 'はじめる'}
            </SaveButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
