import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/hero/Hero';
import ContentSection from '../../components/content/ContentSection';
import { useAdultContentGate } from '../../hooks/useAdultContentGate';
import './AdultPage.css';

/**
 * 성인관 페이지 컴포넌트 - 성인 인증 게이트 적용
 * 1. 미성년자: 접근 차단
 * 2. 성인: 비밀번호 인증 후 접근
 */
const AdultPage = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState([]);
  const [top10Content, setTop10Content] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [latestContent, setLatestContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 //const [showNotice, setShowNotice] = useState(true);  // ⬅️ 추가
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [noticeRemoved, setNoticeRemoved] = useState(false);

  // 성인 인증 게이트 사용
  const { isAdultVerified, AdultGateComponent } = useAdultContentGate(() => {
    // 접근 거부 시 메인 페이지로 이동
    navigate('/main');
  });

  // 인증 성공 시 데이터 로드
  useEffect(() => {
    if (isAdultVerified) {
      loadAdultContent();
    }
  }, [isAdultVerified]);

  const loadAdultContent = async () => {
    setLoading(true);
    try {
      //1. top10 콘텐츠
      const top10Res = await fetch('http://127.0.0.1:8000/recommendation/recent?n=10&is_adult=true&is_main=true&is_movie=false&is_drama=true');
      if (!top10Res.ok) throw new Error('top10 응답 실패');
      const top10Json = await top10Res.json();
      setTop10Content(top10Json.items);
      setHeroData(top10Json.items.slice(0, 3));
      

      // 2. 추천 콘텐츠
      const recommendedRes = await fetch('http://127.0.0.1:8000/recommendation/test?n=10&is_adult=true&is_main=true&is_movie=false&is_drama=false');
      if (!recommendedRes.ok) throw new Error('추천 응답 실패');
      const recommendedJson = await recommendedRes.json();
      setRecommendedContent(recommendedJson.items);

      // 3. 최신 작품
      const latestRes = await fetch('http://127.0.0.1:8000/recommendation/recent?n=20&is_adult=true&is_main=false&is_movie=false&is_drama=true');
      if (!latestRes.ok) throw new Error('최신작 응답 실패');
      const latestJson = await latestRes.json();
      setLatestContent(latestJson.items);

     
      
      setLoading(false);
    } catch (err) {
      console.error('성인 콘텐츠 로드 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setNoticeVisible(false); // 먼저 페이드아웃 시작
    }, 4000); // 4초 후 사라지는 애니메이션 시작
  
    const timer2 = setTimeout(() => {
      setNoticeRemoved(true); // 완전히 제거
    }, 5500); // 0.5초 애니메이션 시간 후 제거
  
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 성인 인증이 완료되지 않았으면 인증 게이트 표시
  if (!isAdultVerified) {
    return AdultGateComponent;
  }

  if (loading) {
    return (
      <div className="adult-page">
        <div className="loading-container">
          <h2>성인 콘텐츠를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adult-page">
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adult-page">
      {/* 성인관 안내 문구 */}
    {!noticeRemoved && (
      <div className= {`adult-notice ${!noticeVisible ? 'hide' : ''}`}>
        <div className="container">
          <div className="notice-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notice-icon">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span className="notice-text">성인 인증 완료 - 19세 이상 전용 콘텐츠</span>
          </div>
        </div>
      </div>
    )}

      {/* 히어로 섹션 */}
      {/*
        {heroData && heroData.length > 0 && (
        //<Hero items={heroData} />
      //)}
      */}
      
      {/* 콘텐츠 섹션들 */}
      <div className="content-sections">
        <ContentSection
          title="Top10 인기작"
          items={top10Content}
          id="top10-section"
        />
        
        <ContentSection
          title="추천 콘텐츠"
          items={recommendedContent}
          id="recommended-section"
        />
        
        <ContentSection
          title="최신 작품"
          items={latestContent}
          id="latest-section"
        />
      </div>
    </div>
  );
};

export default AdultPage;