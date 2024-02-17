import { useEffect, useState } from 'react';
import type { Session } from '@/server/session';

export function useCurrentSession(): [Session | null, () => void] {
  const [session, setSession] = useState<Session | null>(null);

  const reload = () => {
    fetch('/api/session/current', { method: 'GET', credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  return [session, reload];
}
