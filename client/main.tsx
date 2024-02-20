import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { SWRConfig, SWRConfiguration } from 'swr';
import './main.css';
import { router } from '#/router';

// Hack for use-dark-mode
window.global = globalThis;

const swrConfig: SWRConfiguration = {
  fetcher: (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json()),
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <SWRConfig value={swrConfig}>
        <RouterProvider router={router} />
      </SWRConfig>
    </RecoilRoot>
  </React.StrictMode>,
);
