import { useState, useEffect } from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';
import { getMyData } from "../../services/csvService";

/**
 * 히어로 슬라이더 컴포넌트 - props 기반 순수 컴포넌트
 */
const Hero = ({ items = [], loading = false, error = null }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroItems = items || [];
  const totalSlides = heroItems.length;

  // 디버깅: 받은 데이터 확인
  useEffect(() => {
    console.log('=== Hero 컴포넌트 데이터 확인 ===');
    console.log('전체 items:', heroItems);
    heroItems.forEach((item, index) => {
      console.log(`아이템 ${index}:`, {
        idx: item.idx,
        asset_nm: item.asset_nm,
        genre: item.genre,
        release_year: item.release_year,
        description: item.description?.substring(0, 50) + '...'
      });
    });
  }, [heroItems]);

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (loading) {
    return (
      <section className="hero">
        <div className="hero-slider-view">
          <div className="hero-loading">
            <div className="loading-spinner"></div>
            <p>오늘의 추천을 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="hero">
        <div className="hero-slider-view">
          <div className="hero-error">
            <svg className="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!heroItems || heroItems.length === 0) {
    return (
      <section className="hero">
        <div className="hero-slider-view">
          <div className="hero-error">
            <p>추천 콘텐츠가 없습니다.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero-slider-view">
        <div 
          className="hero-slider-track" 
          id="mainHeroSliderTrack"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroItems.map((item, index) => (
            <div key={item.idx || index} className="hero-slide hero-content">
              <div className="hero-poster">
                <div className="poster-container">
                  <Link to={`/content/${item.idx}`}>
                    <img 
                      className={`poster-image main-hero-poster-img-${index}`}
                      src={item.poster_path || 'https://placehold.co/300x450?text=No+Image'} 
                      alt={`${item.asset_nm} 포스터`}
                      loading="lazy"
                      onError={(e) => {
                        console.warn(`이미지 로드 실패: ${item.poster_path}`);
                        e.target.src = 'https://placehold.co/300x450/333/fff?text=이미지\n없음';
                      }}
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      style={{ opacity: '0', transition: 'opacity 0.3s ease-in-out' }}
                    />
                  </Link>
                  <div className="poster-glow"></div>
                </div>
              </div>
              <div className="hero-info">
                <span className="badge">오늘의 추천</span>
                <h2 className="hero-title">{item.asset_nm}</h2>
                <div className="content-meta">
                  <span className="release-year">{item.release_year}</span>
                  <span className="genre">{item.genre}</span>
                  <span className="debug-info" style={{color: '#ff0', fontSize: '12px', marginLeft: '10px'}}>
                  </span>
                </div>
                <p className="hero-description">
                  {item.description}
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-primary">
                    <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    재생
                  </button>
                  <button className="btn btn-outline">찜하기</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 좌우 화살표 - HTML과 동일한 구조 */}
        <button className="hero-slider-nav prev" id="mainHeroPrevBtn" onClick={prevSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="hero-slider-nav next" id="mainHeroNextBtn" onClick={nextSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
