import ky from 'ky';
import { useCallback } from 'react';
import { atom, useRecoilStateLoadable, useRecoilValueLoadable } from 'recoil';
import { z } from 'zod';
import { Locale } from '@/types';
import { Session, zSession } from '@/types/session';

const sessionState = atom<Session | null>({
  key: 'sessionState',
  default: initSession(),
});

async function initSession(): Promise<Session | null> {
  const sessionJson = localStorage.getItem('session');
  if (sessionJson) {
    const parsed = zSession.safeParse(sessionJson);
    if (parsed.success && parsed.data) {
      return parsed.data;
    }
  }

  // ローカルストレージにない場合はサーバーから取得
  return await loadSession();
}

async function loadSession(): Promise<Session | null> {
  const data = await ky.get('/api/session/current').json();
  const parsed = z.object({ session: zSession.nullable() }).parse(data);
  localStorage.setItem('session', JSON.stringify(parsed.session));
  return parsed.session;
}

async function logoutSession(): Promise<void> {
  await ky.post('/api/session/logout');
  localStorage.removeItem('session');
}

export interface UseCurrentSession {
  isLoading: boolean;
  session: Session | null;
  reload: () => void;
  logout: () => void;
}

export function useCurrentSession(): UseCurrentSession {
  const [sessionLoadable, setSession] = useRecoilStateLoadable(sessionState);

  const reload = useCallback(() => {
    loadSession().then(setSession);
  }, [setSession]);

  const logout = useCallback(() => {
    logoutSession().then(() => setSession(null));
  }, [setSession]);

  return {
    isLoading: sessionLoadable.state === 'loading',
    session: sessionLoadable.state === 'hasValue' ? sessionLoadable.contents : null,
    reload,
    logout,
  };
}

export function useCurrentSesionLocale(): Locale {
  const sessionLoadable = useRecoilValueLoadable(sessionState);
  return (sessionLoadable.state === 'hasValue' ? sessionLoadable.contents?.locale : null) ?? 'ja';
}
