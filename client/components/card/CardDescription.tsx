import { useMemo } from 'react';
import { regularizeStringForDescription } from '@/utils/string_utils';

export type CardDescriptionProps = {
  children: string;
};

export default function CardDescription({ children }: CardDescriptionProps) {
  const node = useMemo(() => {
    const replaced = regularizeStringForDescription(children)
      .replaceAll(/\*(.+?)\*/g, '<strong>$1</strong>')
      .replaceAll(/\n/g, '<br>');
    return <p dangerouslySetInnerHTML={{ __html: replaced }} />;
  }, [children]);

  return node;
}
