import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export type SaveButtonState = 'initial' | 'submitting' | 'success' | 'error';

export function useSaveButtonState() {
  const [saveButtonState, setSaveButtonState] = useState<SaveButtonState>('initial');

  useEffect(() => {
    if (saveButtonState === 'success') {
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

export function SaveButton({ state }: { state: SaveButtonState }) {
  return (
    <Button
      type="submit"
      color={state === 'success' ? 'success' : state === 'error' ? 'danger' : 'primary'}
      isLoading={state === 'submitting'}
      startContent={
        state === 'success' ? (
          <span className="icon-[mdi--check] text-2xl" />
        ) : state === 'error' ? (
          <span className="icon-[mdi--alert-circle] text-2xl" />
        ) : (
          <></>
        )
      }
      size="lg"
      className="mx-auto"
    >
      {state === 'success' ? <>保存しました</> : state === 'error' ? <>エラーが発生しました</> : <>保存</>}
    </Button>
  );
}
