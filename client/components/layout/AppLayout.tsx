import useDarkMode, { DarkModeConfig } from '@fisch0920/use-dark-mode';
import { AppHeader } from './AppHeader';
import BlockPortrait from '#/components/layout/BlockPortrait';

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
      <div
        className={`container mx-0 py-0 md:mx-auto md:py-4 flex flex-col items-center min-h-dvh max-w-full ${size === 'lg' ? 'md:px-16' : 'md:px-1 md:max-w-4xl'}`}
      >
        <div
          className={`${darkMode.value ? 'dark' : ''} bg-default-50 text-foreground flex flex-col box-border outline-none w-full md:rounded-large shadow-small ${size === 'lg' ? '' : 'my-auto min-h-dvh md:min-h-unit-9xl'}`}
        >
          <AppHeader darkMode={darkMode} />
          {children}
        </div>
      </div>

      <BlockPortrait />
    </div>
  );
}
