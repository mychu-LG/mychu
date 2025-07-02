import { Outlet, useLocation } from 'react-router-dom';import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import './MainLayout.css';

/**
 * 메인 레이아웃 컴포넌트
 * 모든 페이지에서 공통으로 사용되는 헤더와 푸터를 포함한 레이아웃
 */
const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="main-layout">
      <ScrollToTop key={location.pathname} />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
