import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../../components/hero/Hero';
import ContentSection from '../../components/content/ContentSection';
import GenreDropdown from '../../components/dropdown/GenreDropdown';
import Slider from '../../components/slider/Slider';
import { getTodayRecommendations } from '../../services/todayRecommendationService';
import { getPopularContent, getEmotionContent, getRecentContent } from '../../services/recommendationService';
import { getCurrentUser } from '../../services/auth';
import { getEmotionRecommendations } from '../../services/emotionRecommendationService';
import './MoviePage.css';
import { getMyData } from "../../services/csvService";
import { mapCsvItemToHero } from "../../utils/mapCsvItemToHero";

/**
 * 영화 전용 페이지 컴포넌트 - 메인 페이지와 동일한 UI 구조
 */
const MoviePage = () => {
  const location = useLocation();
  const userId = getCurrentUserId();

  const emotionTitleMessage =
    (userId === 541 && "소금님, 오늘은 마법 같은 SF 한 편으로 답답함 훌훌 털어보세요!") ||
    (userId === 436971 && "처드님, 짜릿한 액션이나 뜨거운 드라마로 기운 충전 어떠세요?") ||
    (userId === 449791 && "미애님, 오늘은 스릴 넘치는 영화로 숨 막히게 몰입해보는 건 어때요?") ||
    "오늘도 좋은 하루 되세요!";
  const [heroData, setHeroData] = useState([]);
  const [slidersData, setSlidersData] = useState({
    popular: [],
    emotion: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroError, setHeroError] = useState(null);
  const [userName, setUserName] = useState('사용자');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    loadMoviePageData();
  }, []);

  // URL에서 장르 파라미터 읽기 및 API 재요청
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const genre = urlParams.get('genre') || '';
    setSelectedGenre(genre);
    if (genre) {
      loadMoviePageData(genre);
    } else {
      loadMoviePageData();
    }
    // eslint-disable-next-line
  }, [location.search]);

  const loadMoviePageData = async (genreParam = '') => {
    try {
      setLoading(true);
      setError(null);
      setHeroError(null);
      const userId = getCurrentUserId();
      
      // Hero 데이터 로드 (개별 에러 처리)
      let heroResult = [];
      try {
        const rawData = await getMyData(userId);
        heroResult = rawData.map(mapCsvItemToHero).filter(item => item.is_movie === 1 && item.is_drama === 0 && item.poster_path !== 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png').sort((a, b) => Number(a.rank) - Number(b.rank));
      } catch (err) {
        setHeroError('Hero 콘텐츠를 불러올 수 없습니다.');
        heroResult = [];
      }
      // 인기/최신 슬라이더는 기존대로, 감정 슬라이더만 교체
      const [popularResult, recentResult] = await Promise.all([
        getPopularContent({ limit: 10, is_movie: true, is_drama: false, is_adult: false, genre: genreParam || undefined }).catch(() => []),
        getRecentContent({ limit: 10, is_movie: true, is_drama: false, is_adult: false, genre: genreParam || undefined }).catch(() => [])
      ]);
      // 감정 슬라이더 데이터 (is_movie=1)
      const emotionResult = await getEmotionRecommendations({
        userIdx: userId,
        genre: genreParam,
        isMovie: true
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
      setError('데이터를 불러오는 중 문제가 발생했습니다.');
      setHeroError('추천 콘텐츠를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-page">
        <div className="loading-container">
          <h2>영화 콘텐츠를 불러오는 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-page">
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={loadMoviePageData}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-page">
      {/* 장르 드롭다운 */}
      <div className="genre-filter-section">
        <GenreDropdown />
      </div>

      {/* 히어로 섹션 */}
      <Hero 
        items={heroData}
        loading={false}
        error={heroError}
      />
      
      {/* 메인 콘텐츠 - 3개의 슬라이더 */}
      <main className="main-content">
        <div className="container">
          {/* 1. Top 10 인기 영화 슬라이더 */}
          <SliderSection
            id="top10-slider"
            title="오늘의 인기 영화"
            items={slidersData.popular}
          />
          {/* 2. 감정 드라마 슬라이더 */}
          <SliderSection
            id="emotion-slider"
            title={emotionTitleMessage}
            items={slidersData.emotion}
          />

          {/* 3. 최신 영화 슬라이더 */}
          <SliderSection
            id="recent-slider"
            title="따끈따끈한 최신 영화, 지금 만나보세요"
            items={slidersData.recent}
          />
        </div>
      </main>
    </div>
  );
};

// 재사용 가능한 SliderSection 컴포넌트 (HomePage와 동일)
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

// 현재 로그인된 사용자의 ID를 가져오는 함수 (HomePage와 동일)
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

export default MoviePage;
