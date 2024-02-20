import useDarkMode, { DarkModeConfig } from '@fisch0920/use-dark-mode';
import { Button } from '@nextui-org/react';
import { AppHeader } from './AppHeader';

const darkModeConfig: DarkModeConfig = {
  classNameDark: 'dark',
  classNameLight: 'light',
  element: document.documentElement,
};

export type AppLayoutProps = {
  size?: 'md' | 'lg';
  children: React.ReactNode | React.ReactNode[];
};

export function AppLayout({ size, children }: AppLayoutProps) {
  const darkMode = useDarkMode(false, darkModeConfig);

  return (
    <div className="relative">
      <div className={`container mx-auto py-4 flex flex-col items-center min-h-dvh ${size === 'lg' ? 'px-16' : 'px-1 max-w-4xl'}`}>
        <div
          className={`${darkMode.value ? 'dark' : ''} bg-default-50 text-foreground flex flex-col box-border outline-none w-full rounded-large shadow-small ${size === 'lg' ? '' : 'my-auto min-h-unit-9xl'}`}
        >
          <AppHeader />
          {children}
        </div>
      </div>

      <div className="absolute right-4 top-4">
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
