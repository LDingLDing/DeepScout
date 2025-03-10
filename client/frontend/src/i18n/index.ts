import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

// 客户端获取语言设置
const getClientLanguage = () => {
  if (typeof window === 'undefined') return 'zh-CN';
  
  const storedLang = localStorage.getItem('language');
  if (storedLang && (storedLang === 'zh-CN' || storedLang === 'en-US')) {
    return storedLang;
  }
  
  const browserLang = navigator.language;
  return browserLang.startsWith('zh') ? 'zh-CN' : 'en-US';
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh-CN', // 服务端默认使用中文
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
});

// 客户端初始化后，设置正确的语言
if (typeof window !== 'undefined') {
  const clientLanguage = getClientLanguage();
  i18n.changeLanguage(clientLanguage);
}

export default i18n;
