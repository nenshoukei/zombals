import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';
import styles from './home.module.css';
import { AppLayout } from '#/components/layout/AppLayout';
import { useCurrentSession } from '#/hooks/useCurrentSession';

export default function Home() {
  const { session } = useCurrentSession();
  return (
    <AppLayout>
      <section className={`${styles.home} grow md:rounded-b-large relative flex flex-col justify-center`}>
        <div className="rounded-large backdrop-blur-md backdrop-brightness-50 text-white w-3/5 mt-5 ml-5 p-5">
          <h2 className="text-2xl mb-2">ようこそ ZOMBALS へ</h2>
          {session?.hasDeck ? (
            <>
              <p>他のデッキを使いたい時は、メニューの「デッキ編集」から 新しいデッキを作成してください。</p>
            </>
          ) : (
            <>
              <p>対戦をはじめる前に、まずはデッキを作成しましょう。</p>
              <p>下のボタンからデッキを作成してください。</p>
            </>
          )}
        </div>

        <div className="w-3/5 mt-5 ml-5 flex justify-center">
          {session?.hasDeck ? (
            <Button variant="solid" color="primary" className="w-60 text-2xl p-8 shadow-md shadow-gray-700">
              対戦する
            </Button>
          ) : (
            <Button variant="solid" color="success" className="w-60 text-2xl p-8 shadow-md shadow-gray-700" as={Link} to="/deck/new">
              デッキを作成する
            </Button>
          )}
        </div>

        <div className={`absolute right-3 bottom-3 text-white text-small ${styles.punchline}`}>
          <p>バルズは滅びぬ、何度でも蘇るさ！ ── ロムスカ・パロ・ウル・フタギ</p>
        </div>
      </section>
    </AppLayout>
  );
}
