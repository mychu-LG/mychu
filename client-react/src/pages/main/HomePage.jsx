import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../../components/hero/Hero';
import Slider from '../../components/slider/Slider';
import GenreDropdown from '../../components/dropdown/GenreDropdown';
//<<<<<<< HEAD
//import { getTodayRecommendations } from '../../services/todayRecommendationService';
import { getPopularContent, getEmotionContent, getRecentContent } from '../../services/recommendationService';
// =======
// import { getTodayRecommendations } from '../../services/todayRecommendationService';
// import { getPopularContent, getRecentContent } from '../../services/recommendationService';
// >>>>>>> 1d527afbbe30612450c791a4bd26d111094aff90
import { getCurrentUser } from '../../services/auth';
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
  const userId = getCurrentUserId();

  const emotionTitleMessage =
    (userId === 541 && "소금님, 오늘은 마음 속 답답함을 시원하게 풀어줄 액션이나 무협 한 편 어떠세요? 거친 전투 속 통쾌함이 기분 전환에 딱일 거예요!") ||
    (userId === 436971 && "처드님, 오늘도 멋진 하루 보내고 계시죠? 감정이 벅차오를 땐 몰입감 넘치는 드라마나 짜릿한 액션, 무협으로 힐링해보세요!") ||
    (userId === 449791 && "미애님, 오늘 마음이 싱숭생숭하다면 여러 장르 중 스릴 넘치는 액션이나 판타지로 기분 전환 어때요? 새로운 세계가 기다리고 있을 거예요!") ||
    "오늘도 좋은 하루 되세요!";
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
            title={`오늘의 ${selectedGenre ? ` (${selectedGenre})` : ''} 인기 콘텐츠`}
            items={slidersData.popular}
          />
          
          {/* 2. 감정 드라마 슬라이더 */}
          <SliderSection
            id="emotion-slider"
            title={emotionTitleMessage}
            items={slidersData.emotion}
          />
          <SliderSection
            id="recent-slider"
            title={`따끈따끈한 ${selectedGenre ? ` (${selectedGenre})` : ''}신작, 지금 만나보세요`}
            items={slidersData.recent}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;