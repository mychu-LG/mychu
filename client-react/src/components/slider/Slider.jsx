import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Slider.css';

/**
 * React Slider Component that displays a horizontal scrollable list of content cards
 */
const Slider = forwardRef(({ items = [], title = '', sliderId = 'react-slider', showNavigation = true }, ref) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);  // 누락된 에러 상태 추가
  const navigate = useNavigate();
  const cardContainerRef = useRef();

  // 이미지 로드
  const loadImage = (src, itemId) => {
    if (!src) {
      setLoadedImages(prev => ({
        ...prev,
        [itemId]: 'https://via.placeholder.com/300x450?text=No+Image'
      }));
      return;
    }

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => ({
        ...prev,
        [itemId]: src
      }));
    };
    img.onerror = () => {
      setLoadedImages(prev => ({
        ...prev,
        [itemId]: 'https://via.placeholder.com/300x450?text=No+Image'
      }));
    };
    img.src = src;
  };

  useEffect(() => {
    try {
      items.forEach(item => {
        const itemId = item.id || item.idx || item.asset_idx;
        if (itemId && !loadedImages[itemId]) {
          loadImage(item.poster_path, itemId);
        }
      });
    } catch (err) {
      console.error('이미지 로드 오류:', err);
      setHasError(true);
    }
  }, [items]);

  // 외부에서 prev/next 제어를 위한 함수
  useImperativeHandle(ref, () => ({
    prev: () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      }
    },
    next: () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  }));

  const handleCardClick = (item) => {
    const itemId = item.id || item.idx || item.asset_idx;
    if (itemId) {
      console.log(`카드 클릭! 콘텐츠 ${itemId} 상세 페이지로 이동합니다.`);
      navigate(`/content/${itemId}`);
    } else {
      console.error('이동할 콘텐츠 ID가 없습니다!', item);
    }
  };

  if (isLoading) {
    return <div className="slider-loading">로딩 중...</div>;
  }

  if (hasError) {
    return <div className="slider-error">콘텐츠를 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="slider-section">
        <div className="slider-empty">표시할 콘텐츠가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="slider-section" id={sliderId}>
      <div className="slider-container">
        <div className="card-container" ref={cardContainerRef} style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth' }}>
          {items.map((item, index) => {
            const itemId = item.id || item.idx || item.asset_idx || index;
            // 콘텐츠의 고유 식별자와 슬라이더 구분을 위한 안전한 key 생성
            const contentHash = item.asset_nm ? item.asset_nm.replace(/[^a-zA-Z0-9]/g, '') : '';
            const uniqueKey = `slider-${sliderId}-${itemId}-${contentHash}-${index}`;
            const posterSrc = loadedImages[itemId] || item.poster_path || 'https://via.placeholder.com/300x450?text=No+Image';

            return (
              <div
                key={uniqueKey}
                className="card product-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="product-image">
                  <img
                    src={posterSrc}
                    alt={item.asset_nm || item.super_asset_nm || 'Poster'}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

Slider.propTypes = {
  items: PropTypes.array,
  title: PropTypes.string,
  sliderId: PropTypes.string,
  showNavigation: PropTypes.bool
};

export default Slider;