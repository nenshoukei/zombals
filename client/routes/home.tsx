import styles from './home.module.css';
import { AppLayout } from '#/components/layout/AppLayout';

export default function Home() {
  return (
    <AppLayout>
      <section className={`${styles.home} grow  rounded-b-large relative`}>
        <div className="backdrop-blur-md backdrop-brightness-50 text-white w-3/5 mt-5 ml-5 p-5">
          <h2 className="text-2xl mb-2">ようこそ ZOMBALS へ</h2>
          <p>対戦をはじめる前に、まずはデッキを作成しましょう。</p>
          <p>上のメニューの「デッキ編集」からデッキを作成してください。</p>
        </div>
      </section>
    </AppLayout>
  );
}
