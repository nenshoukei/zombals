import { createPortal } from 'react-dom';

export default function BlockPortrait() {
  return (
    <>
      {createPortal(
        <div
          className={`hidden portrait:flex md:portrait:hidden items-center justify-center absolute top-0 left-0 right-0 bottom-0 bg-black/80 z-[9999]`}
        >
          <div className="text-white text-2xl m-5">本サイトは横向きにしか対応していません。</div>
        </div>,
        document.body,
      )}
    </>
  );
}
