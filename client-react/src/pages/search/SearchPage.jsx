import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchPage.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * 검색 결과 페이지 컴포넌트
 */
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL에서 검색어 가져오기
  const searchQuery = searchParams.get('q') || '';

  // 검색 실행
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  // 검색 API 호출
  const performSearch = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('검색 시작:', query);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${API_BASE_URL}/search/?query=${encodeURIComponent(query)}&contentType=all&limit=50`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`검색 API 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('검색 결과:', data);
      
      // API 응답 구조에 따라 결과 추출
      const results = data.results || data.items || data || [];
      
      if (Array.isArray(results)) {
        setSearchResults(results);
      } else {
        console.error('예상치 못한 API 응답 구조:', data);
        setSearchResults([]);
      }
      
    } catch (err) {
      console.error('검색 중 오류 발생:', err);
      
      if (err.name === 'AbortError') {
        setError('검색 시간이 초과되었습니다. 다시 시도해주세요.');
      } else {
        setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 콘텐츠 아이템 클릭 핸들러
  const handleContentClick = (item) => {
    const id = item.idx || item.asset_idx || item.id;
    if (id) {
      // 성인 콘텐츠 확인
      if (item.is_adult === 'Y' || item.genre?.includes('성인')) {
        navigate(`/adult?id=${id}`);
      } else {
        navigate(`/content/${id}`);
      }
    }
  };

  // 재생 버튼 클릭 핸들러
  const handlePlayClick = (e, item) => {
    e.stopPropagation();
    alert(`${item.super_asset_nm || item.asset_nm || '콘텐츠'} 재생을 시작합니다.`);
  };

  // 찜하기 버튼 클릭 핸들러
  const handleWishlistClick = (e, item) => {
    e.stopPropagation();
    // 찜하기 상태 토글 로직
    const button = e.currentTarget;
    const svg = button.querySelector('svg');
    
    if (svg.getAttribute('fill') === 'currentColor') {
      svg.setAttribute('fill', 'none');
      button.style.color = '';
      alert(`${item.super_asset_nm || item.asset_nm || '콘텐츠'}을(를) 찜 목록에서 제거했습니다.`);
    } else {
      svg.setAttribute('fill', 'currentColor');
      button.style.color = '#10b981';
      alert(`${item.super_asset_nm || item.asset_nm || '콘텐츠'}을(를) 찜 목록에 추가했습니다.`);
    }
  };

  return (
    <div className="search-page">
      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <div className="container">
          {/* 검색 결과 헤더 */}
          <div className="search-header">
            <div className="search-info">
              <h1 className="search-title">
                '{searchQuery}' 검색 결과
              </h1>
              <p className="search-count">
                총 <span className="result-count">{searchResults.length}</span>개의 콘텐츠를 찾았습니다
              </p>
            </div>
          </div>

          {/* 검색 결과 그리드 */}
          <section className="search-results">
            <div className="results-grid">
              {loading && (
                <div className="loading-message">
                  <p>검색 중...</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={() => performSearch(searchQuery)} className="retry-btn">
                    다시 시도
                  </button>
                </div>
              )}

              {!loading && !error && searchResults.length === 0 && searchQuery && (
                <div className="no-results">
                  <h3>검색 결과가 없습니다</h3>
                  <p>다른 검색어를 시도해보세요.</p>
                </div>
              )}

              {!loading && !error && searchResults.map((item, index) => {
                const title = item.super_asset_nm || item.asset_nm || item.title || '제목 없음';
                const posterPath = item.poster_path || 'https://via.placeholder.com/200x300';
                const genre = item.genre || '장르 없음';
                const year = item.rlse_year || item.release_year || '';
                
                return (
                  <div 
                    key={item.idx || item.asset_idx || item.id || index} 
                    className="content-item"
                    onClick={() => handleContentClick(item)}
                  >
                    <div className="item-poster">
                      <img 
                        src={posterPath} 
                        alt={title}
                        className="poster-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x300';
                        }}
                      />
                      <div className="item-overlay">
                        <button 
                          className="play-btn"
                          onClick={(e) => handlePlayClick(e, item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </button>
                        <button 
                          className="wishlist-btn"
                          onClick={(e) => handleWishlistClick(e, item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
