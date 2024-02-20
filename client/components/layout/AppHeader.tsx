import { DarkMode } from '@fisch0920/use-dark-mode';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WelcomeModal } from './WelcomeModal';
import { useCurrentSession } from '#/hooks/useCurrentSession';

const MenuItem = ({ path, children }: { path: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isCurrent = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  return (
    <Button variant={isCurrent ? 'flat' : 'light'} as={Link} to={path}>
      {children}
    </Button>
  );
};

export type AppHeaderProps = {
  darkMode: DarkMode;
};

export function AppHeader({ darkMode }: AppHeaderProps) {
  const { isLoading, session, logout } = useCurrentSession();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between p-0 md:p-2">
      {!isLoading && !session ? <WelcomeModal /> : null}

      <Navbar className="rounded-lg bg-transparent">
        <NavbarBrand>
          <img src="/assets/zombals-logo.svg" alt="ZOMBALS ぞんばるず" width="144" height="68" />
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-3" justify="center">
          <NavbarItem>
            <MenuItem path="/">ホーム</MenuItem>
          </NavbarItem>
          <NavbarItem>
            <MenuItem path="/deck">デッキ編集</MenuItem>
          </NavbarItem>
          <NavbarItem>
            <MenuItem path="/history">対戦履歴</MenuItem>
          </NavbarItem>
          <NavbarItem>
            <Button variant="solid" color="primary" isDisabled={!session?.hasDeck}>
              対戦する
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {session ? (
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button variant="flat" startContent={<span className="icon-[mdi--account-circle] text-2xl hidden md:inline" />}>
                    {session.name}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="ユーザーメニュー" disabledKeys={session.loginId ? [] : ['logout']}>
                  <DropdownItem
                    key="userEdit"
                    onPress={() => navigate('/user/edit')}
                    startContent={<span className="icon-[mdi--account-edit] text-2xl" />}
                    textValue="プレイヤー名を変更"
                  >
                    プレイヤー名を変更
                  </DropdownItem>
                  <DropdownItem
                    key="userIdentify"
                    onPress={() => navigate('/user/identify')}
                    startContent={<span className="icon-[mdi--key] text-2xl" />}
                    textValue={`ログインIDとパスワードを${session.loginId ? '変更' : '設定'}`}
                  >
                    ログインIDとパスワードを{session.loginId ? '変更' : '設定'}
                  </DropdownItem>
                  <DropdownItem
                    key="theme"
                    onPress={darkMode.toggle}
                    startContent={
                      darkMode.value ? (
                        <span className="icon-[mdi--power-sleep] text-2xl" />
                      ) : (
                        <span className="icon-[mdi--white-balance-sunny] text-2xl" />
                      )
                    }
                  >
                    ラナルータ
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    onPress={logout}
                    color="danger"
                    startContent={<span className="icon-[mdi--logout] text-2xl" />}
                    description={session.loginId ? undefined : 'ログインIDを設定しないとログアウトできません'}
                    textValue="ログアウト"
                  >
                    ログアウト
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          ) : null}
        </NavbarContent>
      </Navbar>
    </header>
  );
}
