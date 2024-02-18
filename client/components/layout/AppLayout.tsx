import useDarkMode, { DarkModeConfig } from '@fisch0920/use-dark-mode';
import { Button } from '@nextui-org/react';
import { AppHeader } from './AppHeader';

const darkModeConfig: DarkModeConfig = {
  classNameDark: 'dark',
  classNameLight: 'light',
  element: document.documentElement,
};

export function AppLayout({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const darkMode = useDarkMode(false, darkModeConfig);

  return (
    <div className="relative">
      <div className="container mx-auto px-1 py-4 max-w-4xl flex flex-col items-center min-h-dvh">
        <div
          className={`${darkMode.value ? 'dark' : ''} bg-default-50 text-foreground flex flex-col box-border outline-none w-full my-auto min-h-unit-9xl rounded-large shadow-small`}
        >
          <AppHeader />
          {children}
        </div>
      </div>

      <div className="absolute right-5 top-5">
        <Button isIconOnly variant="ghost" onClick={darkMode.toggle} aria-label="テーマをダークモードとライトモードで切り替えます">
          {darkMode?.value ? (
            <span className="icon-[mdi--white-balance-sunny] text-2xl" />
          ) : (
            <span className="icon-[mdi--power-sleep] text-2xl" />
          )}
        </Button>
      </div>
    </div>
  );
}
