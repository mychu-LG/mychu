import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../../components/hero/Hero';
import Slider from '../../components/slider/Slider';
import GenreDropdown from '../../components/dropdown/GenreDropdown';
<<<<<<< Updated upstream
import { getPopularContent, getRecentContent } from '../../services/recommendationService';
=======
//s<<<<<<< HEAD
//import { getTodayRecommendations } from '../../services/todayRecommendationService';
import { getPopularContent, getEmotionContent, getRecentContent } from '../../services/recommendationService';
// =======
//import { getTodayRecommendations } from '../../services/todayRecommendationService';
//import { getPopularContent, getRecentContent } from '../../services/recommendationService';
// >>>>>>> 1d527afbbe30612450c791a4bd26d111094aff90
import { getCurrentUser } from '../../services/auth';
>>>>>>> Stashed changes
import { getEmotionRecommendations } from '../../services/emotionRecommendationService';
import './HomePage.css';
import { getMyData } from "../../services/csvService";
import { mapCsvItemToHero } from "../../utils/mapCsvItemToHero";

/**
 * 재사용 가능한 SliderSection 컴포넌트
 */
const SliderSection = ({ id, title, items }) => {
  return (
    <section className="slider-section" id={`${id}-section`}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="section-controls">
          <button className="control-btn prev-btn" aria-label="이전">
            <span className="icon icon-arrow-left"></span>
          </button>
          <button className="control-btn next-btn" aria-label="다음">
            <span className="icon icon-arrow-right"></span>
          </button>
        </div>
      </div>
      <div className="slider-container">
        {items && items.length > 0 ? (
          <Slider 
            items={items}
            title={title}
            sliderId={id}
            showTitle={false}
          />
        ) : (
          <div className="no-content">
            <p>콘텐츠를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * 현재 로그인된 사용자의 ID를 가져오는 함수
 */
const getCurrentUserId = () => {
  try {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.user_idx) {
        return userData.user_idx;
      }
    }
    
    const sessionUserData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    if (sessionUserData.user_idx) {
      return sessionUserData.user_idx;
    }
    
    return 541; // 기본값
  } catch (error) {
    console.error('사용자 ID 가져오기 실패:', error);
    return 541;
  }
};

/**
 * 메인 홈페이지 컴포넌트 - 단순화된 3개 슬라이더 구조
 */
const HomePage = () => {
  const location = useLocation();
  // 상태 단순화
  const [heroData, setHeroData] = useState([]);
  const [slidersData, setSlidersData] = useState({
    popular: [],
    emotion: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroError, setHeroError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    loadMainPageData();
  }, []);

  // URL에서 장르 파라미터 읽기 및 API 재요청
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const genre = urlParams.get('genre') || '';
    setSelectedGenre(genre);
    if (genre) {
      loadMainPageData(genre);
    } else {
      loadMainPageData();
    }
    // eslint-disable-next-line
  }, [location.search]);

  const loadMainPageData = async (genreParam = '') => {
    let emotionResult = [];
    try {
      setLoading(true);
      setError(null);
      setHeroError(null);
      const userId = getCurrentUserId();
      // Hero 데이터 로드 (개별 에러 처리)
      let heroResult = [];
      try {
        const rawData = await getMyData(userId);
        console.log("⭐ rawData from CSV API:", rawData);
  
        heroResult = rawData
          .map(mapCsvItemToHero)
          .sort((a, b) => Number(a.rank) - Number(b.rank));
  
        console.log("⭐ heroResult:", heroResult);
      } catch (err) {
        console.error(err);
        setHeroError('Hero 콘텐츠를 불러올 수 없습니다.');
        heroResult = [];
      }
      // 인기/최신 슬라이더는 기존대로, 감정 슬라이더만 교체
      const [popularResult, recentResult] = await Promise.all([
        getPopularContent({ limit: 10, is_adult: false, genre: genreParam || undefined }).catch(() => []),
        getRecentContent({ limit: 10, is_adult: false, genre: genreParam || undefined }).catch(() => []),
        getEmotionRecommendations({ userIdx: userId, genre: genreParam, isHome: true }).catch(() => [])
      ]);
      // 감정 슬라이더 데이터 (is_home=1)
      emotionResult = await getEmotionRecommendations({
        userIdx: userId,
        genre: genreParam,
        isHome: true
      }).catch(() => []);
      // Hero 데이터 설정
      if (heroResult && heroResult.length > 0) {
        setHeroData(heroResult);
        setHeroError(null);
      } else {
        setHeroError('추천 데이터가 없습니다.');
      }
      // 슬라이더 데이터 설정
      const newSlidersData = {
        popular: popularResult || [],
        emotion: emotionResult || [],
        recent: recentResult || []
      };
      setSlidersData(newSlidersData);
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는 중 문제가 발생했습니다.');
      setHeroError('추천 콘텐츠를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <h2>콘텐츠를 불러오는 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={loadMainPageData}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* 장르 드롭다운 */}
      <div className="genre-filter-section">
        <GenreDropdown />
      </div>

      {/* Hero 섹션 */}
      <Hero 
        items={heroData}
        loading={false}
        error={heroError}
      />
      
      {/* 메인 콘텐츠 - 3개의 슬라이더 */}
      <main className="main-content">
        <div className="container">
          {/* Top 10 인기 콘텐츠 슬라이더는 한 번만 렌더링 */}
          <SliderSection
            id="top10-slider"
            title={`Top 10 인기 콘텐츠${selectedGenre ? ` (${selectedGenre})` : ''}`}
            items={slidersData.popular}
          />
          {/* 감정, 최신 슬라이더는 그대로 */}
          <SliderSection
            id="emotion-slider"
            title={`감정 콘텐츠${selectedGenre ? ` (${selectedGenre})` : ''}`}
            items={slidersData.emotion}
          />
          <SliderSection
            id="recent-slider"
            title={`최신 콘텐츠${selectedGenre ? ` (${selectedGenre})` : ''}`}
            items={slidersData.recent}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;