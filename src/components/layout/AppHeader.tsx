import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import { WelcomeModal } from './WelcomeModal';
import { useCurrentSession } from '@/hooks/useCurrentSession';

export function AppHeader() {
  const { isLoading, session, logout } = useCurrentSession();
  return (
    <header className="flex items-center justify-between p-2">
      {!isLoading && !session ? <WelcomeModal /> : null}

      <Navbar className="rounded-lg bg-transparent">
        <NavbarBrand>
          <img src="/assets/zombals-logo.svg" alt="ZOMBALS ぞんばるず" width="144" height="68" />
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          <NavbarItem isActive={location.pathname === '/'}>
            <Link href="/">ホーム</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#">デッキ編集</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#">対戦履歴</Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {session ? (
            <NavbarItem>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" startContent={<span className="icon-[mdi--account-circle] text-2xl" />}>
                    {session.name}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="ユーザーメニュー" disabledKeys={session.loginId ? [] : ['logout']}>
                  <DropdownItem key="editUse" href="/user/edit" startContent={<span className="icon-[mdi--account-edit] text-2xl" />}>
                    プレイヤー名を変更
                  </DropdownItem>
                  <DropdownItem key="editLogin" href="/user/identify" startContent={<span className="icon-[mdi--key] text-2xl" />}>
                    ログインIDとパスワードを{session.loginId ? '変更' : '設定'}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<span className="icon-[mdi--logout] text-2xl" />}
                    onPress={logout}
                    description={session.loginId ? undefined : 'ログインIDを設定しないとログアウトできません'}
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
