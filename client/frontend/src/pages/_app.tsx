import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTranslation } from 'react-i18next';
import AppLayout from '../components/Layout/AppLayout';
import '../styles/globals.scss';
import '../styles/antd-mobile.scss';
import '../i18n';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'zh-CN' || storedLang === 'en-US')) {
      i18n.changeLanguage(storedLang);
    } else {
      const browserLang = navigator.language;
      const lang = browserLang.startsWith('zh') ? 'zh-CN' : 'en-US';
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    }
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        {isClient ? <Component {...pageProps} /> : null}
      </AppLayout>
    </QueryClientProvider>
  );
}
