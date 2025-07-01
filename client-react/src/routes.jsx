import { Routes, Route, Navigate } from 'react-router-dom';

// 페이지 컴포넌트
import LandingPage from './pages/home/LandingPage';
import TestPage from './test/TestPage';
import SignupPage from './pages/index/SignupPage';
import LoginPage from './pages/login/LoginPage';
import AccountSelectPage from './pages/account/AccountSelectPage';
import HomePage from './pages/main/HomePage';
import SearchPage from './pages/search/SearchPage';
import MoviePage from './pages/movie/MoviePage';
import DramaPage from './pages/drama/DramaPage';
import AdultPage from './pages/adult/AdultPage';
import MyListPage from './pages/mylist/MyListPage';
import SettingPage from './pages/setting/SettingPage';
import ContentDetailsPage from './pages/contents/ContentDetailsPage';

// OAuth 콜백 처리
import NaverCallback from './pages/account_oauth/NaverCallback';
import KakaoCallback from './pages/account_oauth/KakaoCallback';

// 레이아웃 컴포넌트
import MainLayout from './components/layout/MainLayout';

/**
 * React 애플리케이션 경로 정의
 * 랜딩 페이지는 레이아웃 없이, 나머지는 기본 레이아웃 적용
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 테스트 페이지 */}
      <Route path="/test" element={<TestPage />} />
      
      {/* 레이아웃 없이 표시할 페이지 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/account" element={<AccountSelectPage />} />

      {/* OAuth 콜백 경로 */}
      <Route path="/login/naver/code" element={<NaverCallback />} />
      <Route path="/login/kakao/code" element={<KakaoCallback />} />
      
      {/* 메인 레이아웃이 적용된 내부 페이지들 */}
      <Route element={<MainLayout />}>
        <Route path="/main" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/drama" element={<DramaPage />} />
        <Route path="/adult" element={<AdultPage />} />
        <Route path="/mylist" element={<MyListPage />} />
        <Route path="/setting" element={<SettingPage />} />
        {/*<Route path="/contents/:id" element={<ContentDetailsPage />} />*/}
        <Route path="/content/:id" element={<ContentDetailsPage />} />
      </Route>

      {/* 존재하지 않는 경로 처리 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;