import { forwardRef, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import './ProductSlider.css';

const normalizeImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x300?text=No+Image';
  return url.replace(/^(https:\/\/[^/]+)\/\/\1/, '$1');
};

const ProductSlider = forwardRef(({ items = [], sliderId = 'product-slider', onItemClick}, ref) => {
  const cardContainerRef = useRef();

  // 외부에서 prev/next 제어 가능하도록
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

  if (!items || items.length === 0) {
    return (
      <div className="slider-section">
        <div className="slider-empty">표시할 상품이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="slider-section" id={sliderId}>
      <div className="slider-container">
        <div className="card-container" ref={cardContainerRef}>
          {items.map((item, index) => {
            const itemId = item.asset_idx || index;
            const imageUrl = normalizeImageUrl(item.poster_path);
            return (
              <div className="card product-card" key={`product-${itemId}`} onClick={() => onItemClick?.(item)}>
                <div className="product-image">
                  <img
                    src={imageUrl}
                    alt={item.asset_nm}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name" title={item.asset_nm}>{item.asset_nm}</div>
                  {item.subtitle && (
                    <div className="product-price">{item.subtitle}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProductSlider.propTypes = {
  items: PropTypes.array,
  sliderId: PropTypes.string,
  onItemClick: PropTypes.func,
};

export default ProductSlider;
