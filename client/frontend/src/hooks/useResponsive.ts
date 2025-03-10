import { useState, useEffect } from 'react';

export interface ResponsiveConfig {
  isMobile: boolean;
  isPad: boolean;
  isLandscape: boolean;
}

export const useResponsive = (): ResponsiveConfig => {
  const [responsive, setResponsive] = useState<ResponsiveConfig>({
    isMobile: true,
    isPad: false,
    isLandscape: false,
  });

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setResponsive({
        isMobile: width <= 767,
        isPad: width > 767 && width <= 1199,
        isLandscape: width > height,
      });
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);
    window.addEventListener('orientationchange', updateResponsive);

    return () => {
      window.removeEventListener('resize', updateResponsive);
      window.removeEventListener('orientationchange', updateResponsive);
    };
  }, []);

  return responsive;
};
