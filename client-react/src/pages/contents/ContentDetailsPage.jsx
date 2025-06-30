import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ContentDetailsPage.css';

const userIdx = 541; // 실제 로그인 유저 정보로 대체

/**
 * 콘텐츠 상세 페이지 컴포넌트
 */
const ContentDetailsPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [isSeries, setIsSeries] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState(null); // 시리즈 정보(상단)
  const [episodes, setEpisodes] = useState([]); // 시리즈 에피소드 리스트
  const [currentPage, setCurrentPage] = useState(1); // 에피소드 페이징
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWish, setIsWish] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const EPISODES_PER_PAGE = 10;

  // 단일 콘텐츠 데이터 매핑 함수
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

  // 시리즈/단일 여부 판별 및 데이터 로드
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. 시리즈/단일 통합 API 호출
        const seriesRes = await fetch(`http://localhost:8000/assets/series/${id}`);
        if (!seriesRes.ok) throw new Error('콘텐츠 정보 오류');
        const seriesInfo = await seriesRes.json();
        const episodes = seriesInfo.episodes || [];
        // 1. epsd_no 기준 중복 제거
        const uniqueEpisodes = [];
        const seen = new Set();
        for (const ep of episodes) {
          if (!seen.has(ep.epsd_no)) {
            uniqueEpisodes.push(ep);
            seen.add(ep.epsd_no);
          }
        }
        // 2. 시리즈/단일 판별
        const epsdNoSet = new Set(uniqueEpisodes.map(ep => ep.epsd_no));
        const isSingle = epsdNoSet.size === 1 && uniqueEpisodes[0]?.epsd_no === 1;
        const isSeries = uniqueEpisodes.length > 1 && !isSingle;
        setIsSeries(isSeries);
        setEpisodes(uniqueEpisodes);
        setSeriesInfo(seriesInfo);
        if (!isSeries) {
          // 단일 콘텐츠 UI를 위해 첫 에피소드 정보만 mapContentData로 변환
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

  // 찜 상태 확인 (시리즈/단일 공통)
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

  // 찜/찜 해제 핸들러 (시리즈/단일 공통)
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

  // ----- 시리즈물 UI -----
  if (isSeries && seriesInfo) {
    const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
    const startIdx = (currentPage - 1) * EPISODES_PER_PAGE;
    const currentEpisodes = episodes.slice(startIdx, startIdx + EPISODES_PER_PAGE);

    return (
      <div className="content-details-page series-mode">
        {/* 시리즈 상단 정보 */}
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
              <span className="meta-divider">•</span>
              <span>{seriesInfo.asset_time}분</span>
            </div>
            <div className="series-actors">
              <span>출연: {seriesInfo.actr_disp}</span>
            </div>
            <button className="add-list-button" onClick={handleWish} disabled={wishLoading}>
              <i className="add-icon">{isWish ? '✔' : '+'}</i> {isWish ? '찜 해제' : '찜하기'}
            </button>
          </div>
        </div>

        {/* 에피소드 리스트 */}
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

          {/* 페이지네이션 */}
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
    );
  }

  // ----- 단일 콘텐츠 UI (기존과 동일) -----
  const displayContent = content;
  return (
    <div className="content-details-page">
      {/* 배경 이미지 */}
      <div 
        className="content-backdrop"
        style={{ 
          backgroundImage: `url(${displayContent?.poster_path})` 
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      {/* 콘텐츠 정보 */}
      <div className="content-info-container">
        <div className="content-poster">
          <img 
            src={displayContent?.poster_path} 
            alt={displayContent?.asset_nm} 
          />
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

      {/* 관련 콘텐츠 섹션 */}
      <div className="related-content">
        <h2>비슷한 콘텐츠</h2>
        <div className="related-content-grid">
          {/* 기존 샘플 데이터 활용 */}
        </div>
      </div>
    </div>
  );
};

export default ContentDetailsPage;
