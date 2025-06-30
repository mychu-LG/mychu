import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyListPage.css';

// mock 찜한 콘텐츠 데이터
const mockWishlist = [
  {
    idx: '101',
    asset_nm: '찜한 영화 1',
    genre: '코미디',
    poster_path: 'https://picsum.photos/300/450?random=101',
    rlse_year: '2023',
  },
  {
    idx: '102',
    asset_nm: '찜한 드라마 1',
    genre: '스릴러',
    poster_path: 'https://picsum.photos/300/450?random=102',
    rlse_year: '2024',
  },
];

// 성인 썸네일 고정 매핑 함수
const getAdultImage = (idx) => {
  const n = (parseInt(idx, 10) % 20) + 1;
  return `/src/assets/images/adult/adult_${n}.png`;
};

const PAGE_SIZE = 20;

const MyListPage = () => {
  const [activeTab, setActiveTab] = useState('watch-history');

  // 프로필 상태
  const [profile, setProfile] = useState({ nickname: '', joinDate: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // 시청 기록 상태
  const [watchHistory, setWatchHistory] = useState([]);
  const [watchHistoryLoading, setWatchHistoryLoading] = useState(true);
  const [watchHistoryError, setWatchHistoryError] = useState(null);
  const [watchHistoryCount, setWatchHistoryCount] = useState(0);
  const [page, setPage] = useState(1);

  // 찜한 콘텐츠 상태
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  // 유저 idx (실제 서비스에서는 props/context 등으로 받아올 수 있음)
  const userIdx = 541;

  // 프로필 정보 fetch
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch(`http://localhost:8000/users/${userIdx}`);
        if (!res.ok) throw new Error('프로필 정보를 불러오지 못했습니다.');
        const data = await res.json();
        setProfile({
          nickname: data.nick_name || '',
          joinDate: data.created_at ? data.created_at.slice(0, 10) : '',
        });
      } catch (err) {
        setProfileError('프로필 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [userIdx]);

  // 시청 기록 fetch (페이지네이션 적용)
  useEffect(() => {
    const fetchWatchHistory = async () => {
      setWatchHistoryLoading(true);
      setWatchHistoryError(null);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await fetch(`http://localhost:8000/logs/user/${userIdx}?limit=${PAGE_SIZE}&offset=${offset}`);
        if (!res.ok) throw new Error('시청 기록을 불러오지 못했습니다.');
        const data = await res.json();
        setWatchHistory(Array.isArray(data.logs) ? data.logs : []);
        setWatchHistoryCount(data.count || 0);
      } catch (err) {
        setWatchHistoryError('시청 기록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setWatchHistoryLoading(false);
      }
    };
    if (activeTab === 'watch-history') {
      fetchWatchHistory();
    }
  }, [userIdx, page, activeTab]);

  // 찜한 콘텐츠 fetch
  useEffect(() => {
    const fetchWishlist = async () => {
      setWishlistLoading(true);
      setWishlistError(null);
      try {
        // 1. 찜한 asset idx 리스트 가져오기
        const res = await fetch(`http://localhost:8000/logs/mylist/${userIdx}`);
        if (!res.ok) throw new Error('찜한 콘텐츠를 불러오지 못했습니다.');
        const data = await res.json();
        const assetIds = Array.isArray(data.mylist) ? data.mylist : [];
        // 2. 각 asset의 상세 정보 fetch (병렬)
        const detailPromises = assetIds.map(idx =>
          fetch(`http://localhost:8000/assets/${idx}`).then(r => r.json())
        );
        const assetDetails = await Promise.all(detailPromises);
        setWishlist(assetDetails);
      } catch (err) {
        setWishlistError('찜한 콘텐츠를 불러오는 중 오류가 발생했습니다.');
        setWishlist([]);
      } finally {
        setWishlistLoading(false);
      }
    };
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [userIdx, activeTab]);

  // 전체 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(watchHistoryCount / PAGE_SIZE));

  // 탭별 데이터
  const tabData = {
    'watch-history': watchHistory,
    'wishlist': wishlist,
  };
  const displayList = tabData[activeTab];

  // 탭 뱃지 개수
  const TABS = [
    { key: 'watch-history', label: '시청 기록', badge: watchHistoryCount },
    { key: 'wishlist', label: '찜한 콘텐츠', badge: wishlist.length },
  ];

  // 페이지네이션 UI
  const renderPagination = () => (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>&lt; 이전</button>
      <span>{page} / {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>다음 &gt;</button>
    </div>
  );

  // 탭 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  return (
    <div className="mylist-page">
      {/* 프로필/헤더 영역 */}
      <div className="page-header">
        <div className="user-profile">
          <div className="profile-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="profile-info">
            {profileLoading ? (
              <h1 className="profile-name">로딩 중...</h1>
            ) : profileError ? (
              <h1 className="profile-name">오류</h1>
            ) : (
              <h1 className="profile-name">소금 님</h1>
            )}
            <p className="profile-join-date">
              {profileLoading
                ? '가입일: ...'
                : profileError
                ? '가입일: 오류'
                : `가입일: ${profile.joinDate}`}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-button${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            data-tab={tab.key}
          >
            {tab.label}
            <span className="tab-badge">{tab.badge}개</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={`tab-content${activeTab === 'watch-history' ? ' active' : ''}`} id="watch-history">
        {activeTab === 'watch-history' && (
          <>
            {/* {renderPagination()} */}
            <div className="content-section">
              <div className="content-grid grid-view">
                {watchHistoryLoading ? (
                  <div className="empty-state">
                    <h3>시청 기록을 불러오는 중...</h3>
                  </div>
                ) : watchHistoryError ? (
                  <div className="empty-state">
                    <h3>{watchHistoryError}</h3>
                  </div>
                ) : displayList.length === 0 ? (
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line></svg>
                    <h3>시청 기록이 없습니다</h3>
                    <p>영화나 드라마를 시청하면 이곳에 표시됩니다.</p>
                  </div>
                ) : (
                  displayList.map(item => (
                    <div className="content-item" key={item.log_idx || item.idx}>
                      <div className="item-poster">
                        <Link to={`/content/${item.asset_idx || item.idx}`}>
                          <img
                            src={
                              item.genre === '성인'
                                ? getAdultImage(item.idx)
                                : item.poster_path
                            }
                            alt={item.asset_nm}
                            onError={e => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                          />
                        </Link>
                      </div>
                      <div className="item-info">
                        <div className="item-title">{item.asset_nm}</div>
                        <div className="item-meta">
                          <span>{String(item.rlse_year).slice(0, 4)}</span>
                          <span className="meta-divider">•</span>
                          <span>{item.genre}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {renderPagination()}
          </>
        )}
      </div>
      <div className={`tab-content${activeTab === 'wishlist' ? ' active' : ''}`} id="wishlist">
        {activeTab === 'wishlist' && (
          <div className="content-section">
            <div className="content-grid grid-view">
              {displayList.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line></svg>
                  <h3>찜한 콘텐츠가 없습니다</h3>
                  <p>관심있는 영화나 드라마를 찜하면 이곳에 표시됩니다.</p>
                </div>
              ) : (
                displayList.map(item => (
                  <div className="content-item" key={item.idx}>
                    <div className="item-poster">
                      <Link to={`/content/${item.asset_idx || item.idx}`}>
                        <img
                          src={
                            item.genre === '성인'
                              ? getAdultImage(item.idx)
                              : item.poster_path
                          }
                          alt={item.asset_nm}
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                        />
                      </Link>
                    </div>
                    <div className="item-info">
                      <div className="item-title">{item.asset_nm}</div>
                      <div className="item-meta">
                        <span>{String(item.rlse_year).slice(0, 4)}</span>
                        <span className="meta-divider">•</span>
                        <span>{item.genre}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
