import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('🔥 ScrollToTop triggered!', pathname);
    setTimeout(() => {
      // scroll-behavior 끄기
      document.documentElement.style.scrollBehavior = 'auto';

      // 가장 강력한 방법 → 둘 다 실행
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      document.documentElement.style.scrollBehavior = '';
      console.log('✅ scrollTop reset executed');
    }, 300);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
