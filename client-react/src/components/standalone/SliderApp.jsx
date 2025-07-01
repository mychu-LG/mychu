import { useState, useEffect } from 'react';
import Slider from './components/Slider';
import './SliderApp.css';

// Docker 환경에서는 fastapi 서비스 이름으로, 로컬 개발 시에는 상대 경로로 접근
const API_BASE_URL = window.location.hostname === 'localhost' ? '' : 'http://fastapi:8000';

// 서버 연결이 안 될 때 사용할 샘플 데이터
const SAMPLE_ITEMS = [
  {
    idx: '1',
    asset_idx: '1',
    asset_nm: '샘플 영화 1',
    genre: '액션, 모험',
    poster_path: 'https://via.placeholder.com/300x450?text=Movie+1',
    release_year: 2025
  },
  {
    idx: '2',
    asset_idx: '2',
    asset_nm: '샘플 영화 2',
    genre: '드라마, 로맨스',
    poster_path: 'https://via.placeholder.com/300x450?text=Movie+2',
    release_year: 2024
  },
  {
    idx: '3',
    asset_idx: '3',
    asset_nm: '샘플 영화 3',
    genre: '코미디',
    poster_path: 'https://via.placeholder.com/300x450?text=Movie+3',
    release_year: 2023
  },
  {
    idx: '4',
    asset_idx: '4',
    asset_nm: '샘플 영화 4',
    genre: '스릴러, 미스터리',
    poster_path: 'https://via.placeholder.com/300x450?text=Movie+4',
    release_year: 2025
  },
  {
    idx: '5',
    asset_idx: '5',
    asset_nm: '샘플 영화 5',
    genre: 'SF, 판타지',
    poster_path: 'https://via.placeholder.com/300x450?text=Movie+5',
    release_year: 2024
  }
];

/**
 * SliderApp component that can be mounted into existing HTML pages
 * It loads different types of recommendations and renders them in sliders
 */
const SliderApp = () => {
  const [topItems, setTopItems] = useState([]);
  const [emotionItems, setEmotionItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [testItems, setTestItems] = useState([]);  // 테스트 API 결과를 위한 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch recommendations from API
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        try {
          // Fetch test recommendations
          const testResponse = await fetch(`${API_BASE_URL}/recommendation/test?n=10`);
          if (testResponse.ok) {
            const testData = await testResponse.json();
            setTestItems(normalizeItems(testData.items || []));
          } else {
            console.warn(`서버 에러 (test): ${testResponse.status} - 샘플 데이터 사용`);
            setTestItems(SAMPLE_ITEMS);
          }
        } catch (testErr) {
          console.warn('테스트 데이터 로드 실패:', testErr);
          setTestItems(SAMPLE_ITEMS);
        }

        try {
          // Fetch top recommendations
          const topResponse = await fetch(`${API_BASE_URL}/recommendation/top?n=10`);
          if (topResponse.ok) {
            const topData = await topResponse.json();
            setTopItems(normalizeItems(topData.items || []));
          } else {
            console.warn(`서버 에러 (top): ${topResponse.status} - 샘플 데이터 사용`);
            setTopItems(SAMPLE_ITEMS);
          }
        } catch (topErr) {
          console.warn('인기작 데이터 로드 실패:', topErr);
          setTopItems(SAMPLE_ITEMS);
        }
        
        try {
          // Fetch emotion-based recommendations
          const emotionResponse = await fetch(`${API_BASE_URL}/recommendation/emotion?n=10`);
          if (emotionResponse.ok) {
            const emotionData = await emotionResponse.json();
            setEmotionItems(normalizeItems(emotionData.items || []));
          } else {
            console.warn(`서버 에러 (emotion): ${emotionResponse.status} - 샘플 데이터 사용`);
            setEmotionItems(SAMPLE_ITEMS);
          }
        } catch (emotionErr) {
          console.warn('감정 데이터 로드 실패:', emotionErr);
          setEmotionItems(SAMPLE_ITEMS);
        }
        
        try {
          // Fetch recommendations based on recently watched content
          const recentResponse = await fetch(`${API_BASE_URL}/recommendation/recent?n=8`);
          if (recentResponse.ok) {
            const recentData = await recentResponse.json();
            setRecentItems(normalizeItems(recentData.items || []));
          } else {
            console.warn(`서버 에러 (recent): ${recentResponse.status} - 샘플 데이터 사용`);
            setRecentItems(SAMPLE_ITEMS);
          }
        } catch (recentErr) {
          console.warn('최근 데이터 로드 실패:', recentErr);
          setRecentItems(SAMPLE_ITEMS);
        }
        
        // 에러 상태 해제 (적어도 샘플 데이터는 표시할 수 있으므로)
        setError(null);
        
      } catch (err) {
        console.error('추천 데이터 로드 실패:', err);
        setError(err.message);
        
        // 에러 발생해도 샘플 데이터로 대체
        setTopItems(SAMPLE_ITEMS);
        setEmotionItems(SAMPLE_ITEMS);
        setRecentItems(SAMPLE_ITEMS);
        setTestItems(SAMPLE_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    
    // API 응답 데이터를 컴포넌트에 맞게 정규화하는 함수
    const normalizeItems = (items) => {
      return items.map(item => ({
        // idx가 없으면 asset_idx 사용, 둘 다 없으면 임의의 ID 생성
        idx: item.idx || item.asset_idx || `temp-${Math.random().toString(36).substr(2, 9)}`,
        asset_nm: item.asset_nm || item.super_asset_nm || '제목 없음',
        genre: item.genre || '',
        poster_path: item.poster_path || 'https://via.placeholder.com/300x450?text=No+Image',
        release_year: item.release_year || item.rlse_year || null
      }));
    };
    
    fetchRecommendations();
  }, []);
  
  // Check if we're mounted in a specific container that might pass data-items
  useEffect(() => {
    const container = document.getElementById('react-slider-root');
    if (container && container.dataset.items) {
      try {
        const items = JSON.parse(container.dataset.items);
        if (Array.isArray(items) && items.length > 0) {
          // Use the data passed from the container
          setTopItems(items);
          setLoading(false);
        }
      } catch (err) {
        console.error('데이터 파싱 실패:', err);
      }
    }
  }, []);
  
  // If there's an error, use sample data instead
  const itemsToShow = topItems.length > 0 ? topItems : SAMPLE_ITEMS;
  
  if (loading) {
    return <div className="loading-container">추천 콘텐츠를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div className="error-container">오류 발생: {error}</div>;
  }
  return (
    <div className="slider-app">
      {testItems.length > 0 && (
        <Slider 
          items={testItems} 
          title="" 
          sliderId="test-slider" 
        />
      )}
      
      {topItems.length > 0 && (
        <Slider 
          items={itemsToShow} 
          title="" 
          sliderId="top-slider" 
        />
      )}
      
      {emotionItems.length > 0 && (
        <Slider 
          items={emotionItems} 
          title="" 
          sliderId="emotion-slider" 
        />
      )}
      
      {recentItems.length > 0 && (
        <Slider 
          items={recentItems} 
          title="" 
          sliderId="recent-slider" 
        />
      )}
    </div>
  );
};

export default SliderApp;
