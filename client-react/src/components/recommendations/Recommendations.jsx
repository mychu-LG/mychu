import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationAPI } from '../../services/api.js';
import './Recommendations.css';

/**
 * 추천 콘텐츠 컴포넌트 (통합 API 사용)
 */
const Recommendations = ({ type = 'top', limit = 10, title = '추천 콘텐츠', options = {} }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 추천 데이터 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching ${type} recommendations with limit ${limit}`, options);
        
        // 통합 API 사용
        const data = await recommendationAPI.fetchRecommendations(type, limit, options);
        console.log(`${type} recommendations data:`, data);
        
        // 데이터 정규화
        const normalizedItems = data.map(item => {
          const contentId = item.idx || item.asset_idx || item.id || null;
          return {
            idx: contentId,
            id: contentId,
            asset_idx: contentId,
            asset_nm: item.asset_nm || item.super_asset_nm || '제목 없음',
            genre: item.genre || '',
            poster_path: item.poster_path || `https://via.placeholder.com/300x450?text=${encodeURIComponent(item.asset_nm || 'Content')}`,
            release_year: item.release_year || item.rlse_year || null
          };
        });
        
        setItems(normalizedItems);
      } catch (err) {
        console.error(`Error fetching ${type} recommendations:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, limit, JSON.stringify(options)]);  // options 변경도 감지

  // 콘텐츠 클릭 핸들러
  const handleContentClick = (item) => {
    const contentId = item.id || item.idx || item.asset_idx;
    if (!contentId) {
      console.error('이동할 콘텐츠 ID가 없습니다!');
      return;
    }
    
    console.log(`콘텐츠 ${contentId} 상세 페이지로 이동합니다.`);
    navigate(`/contents?id=${contentId}`);
  };

  if (loading) {
    return (
      <div className="recommendations-section">
        <h2 className="section-title">{title}</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>추천 콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-section">
        <h2 className="section-title">{title}</h2>
        <div className="error-container">
          <p className="error-message">콘텐츠를 불러오는 중 오류가 발생했습니다: {error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="recommendations-section">
        <h2 className="section-title">{title}</h2>
        <div className="empty-container">
          <p>표시할 추천 콘텐츠가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-section">
      <h2 className="section-title">{title}</h2>
      <div className="recommendations-grid">
        {items
          .filter(item =>
            item.poster_path &&
            item.poster_path.trim() !== '' &&
            item.poster_path.trim().toLowerCase() !== 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/no-image-placeholder.svg/1200px-no-image-placeholder.svg.png' &&
            !item.poster_path.toLowerCase().includes('placeholder') &&
            !item.poster_path.toLowerCase().includes('noimage') &&
            !item.poster_path.toLowerCase().includes('no+image') &&
            !item.poster_path.toLowerCase().includes('no-image') &&
            !item.poster_path.toLowerCase().includes('no_image') &&
            !item.poster_path.toLowerCase().includes('notfound') &&
            !item.poster_path.toLowerCase().includes('unavailable')
          )
          .map((item, index) => (
            <div 
              key={item.id || item.idx || index}
              className="recommendation-card"
              onClick={() => handleContentClick(item)}
            >
              <div className="card-image">
                <img 
                  src={item.poster_path} 
                  alt={item.asset_nm}
                  loading="lazy"
                  onError={e => {
                    e.currentTarget.closest('.recommendation-card').style.display = 'none';
                  }}
                />
              </div>
              <div className="card-info">
                <h3 className="card-title">{item.asset_nm}</h3>
                {item.genre && <span className="card-genre">{item.genre}</span>}
                {item.release_year && <span className="card-year">{item.release_year}</span>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Recommendations;
