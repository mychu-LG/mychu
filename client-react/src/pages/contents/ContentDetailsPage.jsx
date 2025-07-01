import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Slider from '../../components/slider/Slider';
import ProductSlider from '../../components/slider/ProductSlider';
import './ContentDetailsPage.css';

const userIdx = 541;

const ContentDetailsPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [isSeries, setIsSeries] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWish, setIsWish] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [similarList, setSimilarList] = useState([]);

  const EPISODES_PER_PAGE = 10;

  function mapContentData(contentData) {
    return {
      idx: contentData.idx,
      id: contentData.idx,
      asset_nm: contentData.asset_nm || '제목 없음',
      super_asset_nm: contentData.super_asset_nm || contentData.asset_nm || '프로그램명 없음',
      genre: contentData.genre || '',
      rlse_year: contentData.rlse_year ? String(contentData.rlse_year).substring(0, 4) : '',
      actr_disp: contentData.actr_disp || '',
      asset_time: contentData.asset_time ? Math.round(contentData.asset_time / 60) : '',
      poster_path: contentData.poster_path || `https://via.placeholder.com/300x450?text=Content+${contentData.idx}`,
      backdrop_path: contentData.poster_path || `https://via.placeholder.com/1920x1080?text=Content+${contentData.idx}+Background`,
      synopsis: contentData.smry || '',
      actors: contentData.actr_disp ? contentData.actr_disp.split(',') : [],
      runtime: contentData.asset_time ? Math.round(contentData.asset_time / 60) : '',
    };
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const seriesRes = await fetch(`http://localhost:8000/assets/series/${id}`);
        if (!seriesRes.ok) throw new Error('콘텐츠 정보 오류');
        const seriesInfo = await seriesRes.json();
        const episodes = seriesInfo.episodes || [];
        const uniqueEpisodes = [];
        const seen = new Set();
        for (const ep of episodes) {
          if (!seen.has(ep.epsd_no)) {
            uniqueEpisodes.push(ep);
            seen.add(ep.epsd_no);
          }
        }
        const epsdNoSet = new Set(uniqueEpisodes.map(ep => ep.epsd_no));
        const isSingle = epsdNoSet.size === 1 && uniqueEpisodes[0]?.epsd_no === 1;
        const isSeries = uniqueEpisodes.length > 1 && !isSingle;
        setIsSeries(isSeries);
        setEpisodes(uniqueEpisodes);
        setSeriesInfo(seriesInfo);
        if (!isSeries) {
          setContent(mapContentData({ ...seriesInfo, ...uniqueEpisodes[0] }));
        }
      } catch (err) {
        setError('콘텐츠 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchWish() {
      try {
        const res = await fetch(`http://localhost:8000/logs/mylist/${userIdx}`);
        const data = await res.json();
        setIsWish(data.mylist.includes(Number(id)));
      } catch (e) {}
    }

    fetchWish();
  }, [id]);

  useEffect(() => {
    async function fetchExtraContent() {
      try {
        const [productRes, similarRes] = await Promise.all([
          fetch('http://localhost:8000/products/random'),
          fetch(`http://localhost:8000/recommendation/similar/${id}`)
        ]);
        const productData = await productRes.json();
        const similarData = await similarRes.json();

        setProductList((productData.products || []).filter((p) => !!p.page_link).map((p) => {
          const cleanImage = p.img_path?.replace(/.*\/cjhello-hirental\.co\.kr\//, 'https://cjhello-hirental.co.kr/');
          return {
            asset_idx: p.product_no || Math.random(),
            asset_nm: p.name,
            poster_path: cleanImage,
            subtitle: `${p.price.toLocaleString()}원`,
            page_link: p.page_link,
          };
        }));

        setSimilarList((similarData.items || []).map((c) => ({
          ...c,
          subtitle: '',
        })));
      } catch (e) {
        console.error('추천 콘텐츠/상품 로딩 실패', e);
      }
    }

    fetchExtraContent();
  }, [id]);

  const handleWish = async () => {
    setWishLoading(true);
    try {
      const assetIdNum = Number(id);
      if (isWish) {
        await fetch('http://localhost:8000/logs/mylist/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_idx: userIdx, asset_idx: assetIdNum })
        });
        setIsWish(false);
      } else {
        await fetch('http://localhost:8000/logs/mylist/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_idx: userIdx, asset_idx: assetIdNum })
        });
        setIsWish(true);
      }
    } catch (e) {}
    setWishLoading(false);
  };

  if (loading) {
    return (
      <div className="content-details-loading">
        <div className="loading-spinner"></div>
        <p>콘텐츠 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-details-error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  const SliderSection = ({ id, title, items, useProductSlider }) => {
    const sliderRef = useRef();

    const handlePrev = () => {
      sliderRef.current?.prev();
    };

    const handleNext = () => {
      sliderRef.current?.next();
    };

    const SliderComponent = useProductSlider ? ProductSlider : Slider;

    return (
      <section className="slider-section" id={`${id}-section`}>
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <div className="section-controls">
            <button className="control-btn prev-btn" aria-label="이전" onClick={handlePrev}>
              <span className="icon icon-arrow-left"></span>
            </button>
            <button className="control-btn next-btn" aria-label="다음" onClick={handleNext}>
              <span className="icon icon-arrow-right"></span>
            </button>
          </div>
        </div>
        <div className="slider-container">
          <SliderComponent
            ref={sliderRef}
            items={items}
            sliderId={id}
            showTitle={false}
            onItemClick={(item) => {
              if (item.page_link) {
                window.open(item.page_link, "_blank");
              } else {
                // 링크가 없는 경우 다른 처리
                console.log("페이지 링크 없음", item);
              }
            }}
          />
        </div>
      </section>
    );
  };

  if (isSeries && seriesInfo) {
    const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
    const startIdx = (currentPage - 1) * EPISODES_PER_PAGE;
    const currentEpisodes = episodes.slice(startIdx, startIdx + EPISODES_PER_PAGE);

    return (
      <div className="content-details-page series-mode">
        <div className="series-header">
          <div className="series-poster">
            <img src={seriesInfo.poster_path} alt={seriesInfo.super_asset_nm} />
          </div>
          <div className="series-info">
            <h1>{seriesInfo.super_asset_nm}</h1>
            <div className="series-meta">
              <span>{String(seriesInfo.rlse_year).slice(0, 4)}</span>
              <span className="meta-divider">•</span>
              <span>{seriesInfo.genre}</span>
            </div>
            <div className="series-actors">
              <span>출연: {seriesInfo.actr_disp}</span>
            </div>
            <div className="series-actions">
              <button className="play-button">
                <i className="play-icon">▶</i> 재생
              </button>
              <button className="add-list-button" onClick={handleWish} disabled={wishLoading}>
                <i className="add-icon">{isWish ? '✔' : '+'}</i> {isWish ? '찜 해제' : '찜하기'}
              </button>
            </div>
          </div>
        </div>

        <div className="episode-list-wrapper">
          <div className="episode-list-section">
            <h2>에피소드</h2>
            <div className="episode-list">
              {currentEpisodes.map((ep) => (
                <div className="episode-item" key={ep.epsd_no}>
                  <div className="episode-no">{String(ep.epsd_no).padStart(2, '0')}</div>
                  <div className="episode-info">
                    <div className="episode-title">{ep.asset_nm}</div>
                    <div className="episode-summary">{ep.smry_shrt}</div>
                  </div>
                  <button className="play-button episode-play">
                    <i className="play-icon">▶</i> 재생
                  </button>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="episode-pagination">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx}
                    className={`pagination-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {productList.length > 0 && (
          <SliderSection
            id="commerce-slider"
            title="헬로 렌탈 추천 상품"
            items={productList}
            useProductSlider={true}
          />
        )}
        {similarList.length > 0 && (
          <SliderSection
            id="similar-slider"
            title="비슷한 콘텐츠 추천"
            items={similarList}
            useProductSlider={false}
          />
        )}
      </div>
    );
  }

  const displayContent = content;
  return (
    <div className="content-details-page">
      <div className="content-backdrop" style={{ backgroundImage: `url(${displayContent?.poster_path})` }}>
        <div className="backdrop-overlay"></div>
      </div>

      <div className="content-info-container">
        <div className="content-poster">
          <img src={displayContent?.poster_path} alt={displayContent?.asset_nm} />
        </div>

        <div className="content-info">
          <h1>{displayContent?.asset_nm}</h1>
          <div className="content-meta">
            <span>{displayContent?.rlse_year}</span>
            <span className="meta-divider">•</span>
            <span>{displayContent?.genre}</span>
            <span className="meta-divider">•</span>
            <span>{displayContent?.runtime}분</span>
          </div>
          <div className="content-synopsis">
            <h3>개요</h3>
            <p>{displayContent?.synopsis}</p>
          </div>
          <div className="content-people">
            <div className="content-actors">
              <h3>출연</h3>
              <p>{displayContent?.actors?.join(', ')}</p>
            </div>
          </div>
          <div className="content-actions">
            <button className="play-button">
              <i className="play-icon">▶</i> 재생
            </button>
            <button className="add-list-button" onClick={handleWish} disabled={wishLoading}>
              <i className="add-icon">{isWish ? '✔' : '+'}</i> {isWish ? '찜 해제' : '찜하기'}
            </button>
          </div>
        </div>
      </div>

      {productList.length > 0 && (
        <SliderSection
          id="commerce-slider"
          title="헬로 렌탈 추천 상품"
          items={productList}
          useProductSlider={true}
        />
      )}
      {similarList.length > 0 && (
        <SliderSection
          id="similar-slider"
          title="비슷한 콘텐츠 추천"
          items={similarList}
          useProductSlider={false}
        />
      )}
    </div>
  );
};

export default ContentDetailsPage;
