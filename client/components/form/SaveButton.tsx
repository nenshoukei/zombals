import { Button, ButtonProps } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export type SaveButtonState = 'initial' | 'submitting' | 'success' | 'error';

export function useSaveButtonState() {
  const [saveButtonState, setSaveButtonState] = useState<SaveButtonState>('initial');

  useEffect(() => {
    if (saveButtonState === 'success' || saveButtonState === 'error') {
      const timer = setTimeout(() => {
        setSaveButtonState('initial');
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [saveButtonState]);

  return [saveButtonState, setSaveButtonState] as const;
}

export type SaveButtonProps = ButtonProps & {
  state: SaveButtonState;
  successLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
};

export function SaveButton({ state, successLabel, errorLabel, children, ...props }: SaveButtonProps) {
  return (
    <Button
      type="submit"
      isLoading={state === 'submitting'}
      {...props}
      color={state === 'success' ? 'success' : state === 'error' ? 'danger' : props.color || 'primary'}
      startContent={
        state === 'success' ? (
          <span className="icon-[mdi--check] text-2xl" />
        ) : state === 'error' ? (
          <span className="icon-[mdi--alert-circle] text-2xl" />
        ) : (
          props.startContent
        )
      }
    >
      {state === 'success' ? (
        <>{successLabel || '保存しました'}</>
      ) : state === 'error' ? (
        <>{errorLabel || 'エラーが発生しました'}</>
      ) : (
        <>{children || '保存'}</>
      )}
    </Button>
  );
}
