/**
 * 추천 서비스 (통합 API 사용)
 * 일반 추천 API 통합 관리
 */

import { recommendationAPI } from './api.js';
import { createCacheKey, cachedFetch } from '../utils/apiCache.js';
import { API_CONFIG } from '../utils/apiConfig.js';

/**
 * 포스터 이미지가 유효한지 확인
 * @param {string} posterPath - 포스터 경로
 * @returns {boolean} - 유효한 포스터인지 여부
 */
const isValidPoster = (posterPath) => {
  if (!posterPath) return false;
  
  // "No-Image", "placeholder", "default" 등이 포함된 URL 필터링
  const invalidPatterns = [
    'no-image',
    'placeholder',
    'default',
    'missing',
    'unavailable',
    'not-found',
    'noimage'
  ];
  
  const lowerPosterPath = posterPath.toLowerCase();
  return !invalidPatterns.some(pattern => lowerPosterPath.includes(pattern));
};

/**
 * 응답 아이템을 일관된 형식으로 정규화 (포스터 검증 포함)
 * @param {Array} items - API에서 받은 원본 아이템들
 * @param {boolean} filterInvalidPosters - 유효하지 않은 포스터 필터링 여부
 * @returns {Array} - 정규화된 아이템들
 */
const normalizeItems = (items = [], filterInvalidPosters = false) => {
  const normalizedItems = items.map(item => {
    // 다양한 필드에서 ID 추출
    const contentId = item.idx || item.asset_idx || item.id || null;
    
    return {
      idx: contentId,
      id: contentId,
      asset_idx: contentId,
      asset_nm: item.asset_nm || item.super_asset_nm || '제목 없음',
      genre: item.genre || '',
      poster_path: item.poster_path || `https://via.placeholder.com/300x450?text=${encodeURIComponent(item.asset_nm || 'Content')}`,
      release_year: item.release_year || item.rlse_year || null,
      is_movie: item.is_movie || false,
      is_adult: item.is_adult || false
    };
  });

  // 포스터 필터링이 활성화된 경우 유효하지 않은 포스터 제거
  if (filterInvalidPosters) {
    return normalizedItems.filter(item => isValidPoster(item.poster_path));
  }

  return normalizedItems;
};

/**
 * 히어로 슬라이더 데이터 가져오기
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 히어로 아이템들
 */
export const getHeroContent = async (options = { is_movie: true, limit: 5 }) => {
  const cacheKey = createCacheKey('hero-content', {
    limit: options.limit || 5,
    is_movie: options.is_movie === false ? false : true
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      // 포스터 필터링을 위해 더 많은 데이터를 요청
      const requestLimit = Math.max((options.limit || 5) * 2, 10);
      const results = await recommendationAPI.fetchRecommendations('test', requestLimit, {
        is_movie: options.is_movie === false ? false : true,
        is_main: true
      });
      return results;
    }, API_CONFIG.cacheTimeout);
    
    // 포스터 필터링 적용하여 정규화
    const validItems = normalizeItems(data, true);
    
    // 요청된 개수만큼 반환 (유효한 포스터가 있는 것들만)
    return validItems.slice(0, options.limit || 5);
  } catch (error) {
    console.error('히어로 콘텐츠 가져오기 실패:', error);
    return [];
  }
};

/**
 * 인기 콘텐츠 가져오기
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 인기 아이템들
 */
export const getPopularContent = async (options = { is_movie: null, is_drama: null, is_adult: false, limit: 10, filterInvalidPosters: false, genre: null }) => {
  const cacheKey = createCacheKey('popular-content', {
    limit: options.limit || 10,
    is_movie: options.is_movie,
    is_drama: options.is_drama,
    is_adult: options.is_adult,
    filterInvalidPosters: options.filterInvalidPosters,
    genre: options.genre
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      // 포스터 필터링이 활성화된 경우 더 많은 데이터 요청
      const requestLimit = options.filterInvalidPosters ? 
        Math.max((options.limit || 10) * 1.5, 15) : 
        (options.limit || 10);
      
      // 동적으로 apiOptions 생성
      const apiOptions = { is_adult: options.is_adult };
      if (typeof options.is_movie === 'boolean') apiOptions.is_movie = options.is_movie;
      if (typeof options.is_drama === 'boolean') apiOptions.is_drama = options.is_drama;
      if (options.genre) apiOptions.genre = options.genre;
      
      const results = await recommendationAPI.fetchRecommendations('popular', requestLimit, apiOptions);
      return results;
    }, API_CONFIG.cacheTimeout);
    
    let normalizedItems = normalizeItems(data, options.filterInvalidPosters);
    
    // 장르 필터링 (백엔드에서 지원하지 않는 경우를 위한 클라이언트 사이드 필터링)
    if (options.genre && normalizedItems.length > 0) {
      normalizedItems = normalizedItems.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    // 요청된 개수만큼 반환
    return normalizedItems.slice(0, options.limit || 10);
  } catch (error) {
    console.error('인기 콘텐츠 가져오기 실패:', error);
    console.log('Fallback: 인기 콘텐츠 샘플 데이터 사용');
    
    // 백엔드 연결 실패 시 샘플 데이터 반환
    let fallbackData = [
      { idx: 'pop1', asset_nm: '어벤져스: 엔드게임', poster_path: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', genre: '액션', release_year: '2019' },
      { idx: 'pop2', asset_nm: '기생충', poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genre: '스릴러', release_year: '2019' },
      { idx: 'pop3', asset_nm: '조커', poster_path: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', genre: '스릴러', release_year: '2019' },
      { idx: 'pop4', asset_nm: '스파이더맨: 노 웨이 홈', poster_path: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', genre: '액션', release_year: '2021' },
      { idx: 'pop5', asset_nm: '인터스텔라', poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genre: 'SF', release_year: '2014' },
      { idx: 'pop6', asset_nm: '위험한 관계', poster_path: 'https://image.tmdb.org/t/p/w500/7d8bGBp1CWXfPXmXSbgYHvxsJUs.jpg', genre: '드라마', release_year: '2022' },
      { idx: 'pop7', asset_nm: '올드보이', poster_path: 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg', genre: '스릴러', release_year: '2003' },
      { idx: 'pop8', asset_nm: '건축학개론', poster_path: 'https://image.tmdb.org/t/p/w500/q72xD6Hb8l1qs7oYDnlPHZmEKXe.jpg', genre: '로맨스', release_year: '2012' },
      { idx: 'pop9', asset_nm: '아가씨', poster_path: 'https://image.tmdb.org/t/p/w500/e7gOJcSFzYcxUJCfrYvCFbJhJJ7.jpg', genre: '로맨스', release_year: '2016' },
      { idx: 'pop10', asset_nm: '밀양', poster_path: 'https://image.tmdb.org/t/p/w500/xDzxK8nSdlnqfK2nEiuFRzb1RD3.jpg', genre: '드라마', release_year: '2007' }
    ];
    
    // 장르 필터링 적용
    if (options.genre) {
      fallbackData = fallbackData.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    return options.filterInvalidPosters ? 
      fallbackData.filter(item => isValidPoster(item.poster_path)).slice(0, options.limit || 10) :
      fallbackData.slice(0, options.limit || 10);
  }
};

/**
 * 최신 콘텐츠 가져오기
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 최신 아이템들
 */
export const getRecentContent = async (options = { is_movie: null, is_drama: null, is_adult: false, limit: 10, filterInvalidPosters: false, genre: null }) => {
  const cacheKey = createCacheKey('recent-content', {
    limit: options.limit || 10,
    is_movie: options.is_movie,
    is_drama: options.is_drama,
    is_adult: options.is_adult,
    filterInvalidPosters: options.filterInvalidPosters,
    genre: options.genre
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const requestLimit = options.filterInvalidPosters ? 
        Math.max((options.limit || 10) * 1.5, 15) : 
        (options.limit || 10);
      
      // 동적으로 apiOptions 생성
      const apiOptions = { is_adult: options.is_adult };
      if (typeof options.is_movie === 'boolean') apiOptions.is_movie = options.is_movie;
      if (typeof options.is_drama === 'boolean') apiOptions.is_drama = options.is_drama;
      if (options.genre) apiOptions.genre = options.genre;
      
      const results = await recommendationAPI.fetchRecommendations('recent', requestLimit, apiOptions);
      return results;
    }, API_CONFIG.cacheTimeout);
    
    let normalizedItems = normalizeItems(data, options.filterInvalidPosters);
    
    // 장르 필터링
    if (options.genre && normalizedItems.length > 0) {
      normalizedItems = normalizedItems.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    return normalizedItems.slice(0, options.limit || 10);
  } catch (error) {
    console.error('최신 콘텐츠 가져오기 실패:', error);
    console.log('Fallback: 최신 콘텐츠 샘플 데이터 사용');
    
    // 백엔드 연결 실패 시 샘플 데이터 반환
    let fallbackData = [
      { idx: 'rec1', asset_nm: '탑건: 매버릭', poster_path: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', genre: '액션', release_year: '2022' },
      { idx: 'rec2', asset_nm: '엘비스', poster_path: 'https://image.tmdb.org/t/p/w500/qBOKWqAFbveZ4ryjJJwbie6tXkG.jpg', genre: '드라마', release_year: '2022' },
      { idx: 'rec3', asset_nm: '미니언즈: 라이징 구루', poster_path: 'https://image.tmdb.org/t/p/w500/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg', genre: '애니메이션', release_year: '2022' },
      { idx: 'rec4', asset_nm: '토르: 러브 앤 썬더', poster_path: 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', genre: '액션', release_year: '2022' },
      { idx: 'rec5', asset_nm: '닥터 스트레인지 2', poster_path: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg', genre: '액션', release_year: '2022' },
      { idx: 'rec6', asset_nm: '쥬라기 월드: 도미니언', poster_path: 'https://image.tmdb.org/t/p/w500/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg', genre: '액션', release_year: '2022' },
      { idx: 'rec7', asset_nm: '빛나는 만담', poster_path: 'https://image.tmdb.org/t/p/w500/7d8bGBp1CWXfPXmXSbgYHvxsJUs.jpg', genre: '코미디', release_year: '2022' },
      { idx: 'rec8', asset_nm: '헤어질 결심', poster_path: 'https://image.tmdb.org/t/p/w500/yPuMnkqb5cWOcvntW6kWoT7XnWW.jpg', genre: '로맨스', release_year: '2022' },
      { idx: 'rec9', asset_nm: '브로커', poster_path: 'https://image.tmdb.org/t/p/w500/cuAq3zBgYtClsWJFpQ5NJdCIyX3.jpg', genre: '드라마', release_year: '2022' },
      { idx: 'rec10', asset_nm: '한산: 용의 출현', poster_path: 'https://image.tmdb.org/t/p/w500/7kFhLFGlJBCqRDgBdLnJNsQUlQK.jpg', genre: '액션', release_year: '2022' }
    ];
    
    // 장르 필터링 적용
    if (options.genre) {
      fallbackData = fallbackData.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    return options.filterInvalidPosters ? 
      fallbackData.filter(item => isValidPoster(item.poster_path)).slice(0, options.limit || 10) :
      fallbackData.slice(0, options.limit || 10);
  }
};

/**
 * 감정 기반 추천 콘텐츠 가져오기
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 감정 기반 추천 아이템들
 */
export const getEmotionContent = async (options = { is_movie: null, is_drama: null, is_adult: false, limit: 10, filterInvalidPosters: false, genre: null }) => {
  const cacheKey = createCacheKey('emotion-content', {
    limit: options.limit || 10,
    is_movie: options.is_movie,
    is_drama: options.is_drama,
    is_adult: options.is_adult,
    filterInvalidPosters: options.filterInvalidPosters,
    genre: options.genre
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const requestLimit = options.filterInvalidPosters ? 
        Math.max((options.limit || 10) * 1.5, 15) : 
        (options.limit || 10);
      
      // 동적으로 apiOptions 생성
      const apiOptions = { is_adult: options.is_adult };
      if (typeof options.is_movie === 'boolean') apiOptions.is_movie = options.is_movie;
      if (typeof options.is_drama === 'boolean') apiOptions.is_drama = options.is_drama;
      if (options.genre) apiOptions.genre = options.genre;
      
      const results = await recommendationAPI.fetchRecommendations('emotion', requestLimit, apiOptions);
      return results;
    }, API_CONFIG.cacheTimeout);
    
    let normalizedItems = normalizeItems(data, options.filterInvalidPosters);
    
    // 장르 필터링
    if (options.genre && normalizedItems.length > 0) {
      normalizedItems = normalizedItems.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    return normalizedItems.slice(0, options.limit || 10);
  } catch (error) {
    console.error('감정 기반 추천 콘텐츠 가져오기 실패:', error);
    console.log('Fallback: 감정 기반 콘텐츠 샘플 데이터 사용');
    
    // 백엔드 연결 실패 시 감정 기반 샘플 데이터 반환
    let fallbackData = [
      { idx: 15765, asset_nm: '노트북', poster_path: ' https://image.wavve.com/v1/thumbnails/480_720_20_80/movieImg/MovieGroup/2023/GMV_CD01_WR0000011336-Vertical_LogoY_RTC.jpg', genre: '로맨스', release_year: '2013' },
      { idx: 59226, asset_nm: '라라랜드', poster_path: 'https://i.namu.wiki/i/78uTXq-Jd3ME_MYXtiyOo-qBPjwpiNF9qs1ko9YvE1BmaVagE9-h95a5Xuh0jVt6WX9sY8seQLZlU2GidF7Gcg.webp', genre: '로맨스', release_year: '2016' },
      { idx: 22087, asset_nm: '러브액츄얼리', poster_path: 'https://image.wavve.com/v1/thumbnails/480_720_20_80/meta/image/202405/1714713162866926870.jpg', genre: '로맨스', release_year: '2003' },
      { idx: 153127, asset_nm: '포레스트 검프', poster_path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVdHu72V-1sIR4NsXxJ5wn6V7habcNxFbWIw&s', genre: '드라마', release_year: '1994' },
      { idx: 29810, asset_nm: '업', poster_path: ' https://image.wavve.com/v1/thumbnails/480_720_20_80/movieImg/MovieGroup/2022/GMV_CA01_DY0000011265-Vertical_LogoY.jpg', genre: '애니메이션', release_year: '2009' },
      { idx: 86168, asset_nm: '리틀 포레스트', poster_path: 'https://image.wavve.com/v1/thumbnails/480_720_20_80/201908/20190805/d28a944c3eb196fd105c3bc8ecd091ee.jpg', genre: '드라마', release_year: '2018' },
      { idx: 187973, asset_nm: '천공의 성 라퓨타', poster_path: ' https://image.wavve.com/v1/thumbnails/480_720_20_80/movieImg/MovieGroup/2022/GMV_CR01_DN0000011315-Vertical_LogoY.jpg', genre: '애니메이션', release_year: '1986' },
      { idx: 142129, asset_nm: '미드나잇인파리', poster_path: 'https://image.wavve.com/v1/thumbnails/480_720_20_80/meta/image/202503/1742283130595879407.jpg ', genre: '로맨스', release_year: '2011' },
      { idx: 187342, asset_nm: '이웃집 토토로', poster_path: 'https://image.wavve.com/v1/thumbnails/480_720_20_80/movieImg/MovieGroup/2022/GMV_CR01_DN0000011313-Vertical_LogoY.jpg', genre: '애니메이션', release_year: '2001' },
      { idx: 12179, asset_nm: '캐스트어웨이', poster_path: 'https://image.wavve.com/v1/thumbnails/480_720_20_80/movieImg/MovieGroup/2022/GMV_CQ01_PT0000011137-Vertical_LogoY.jpg', genre: '로맨스', release_year: '2000' }
    ];
    
    // 장르 필터링 적용
    if (options.genre) {
      fallbackData = fallbackData.filter(item => 
        item.genre && item.genre.toLowerCase().includes(options.genre.toLowerCase())
      );
    }
    
    return options.filterInvalidPosters ? 
      fallbackData.filter(item => isValidPoster(item.poster_path)).slice(0, options.limit || 10) :
      fallbackData.slice(0, options.limit || 10);
  }
};

/**
 * 유사 콘텐츠 가져오기
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 유사 아이템들
 */
export const getSimilarContent = async (options = { is_movie: null, is_drama: null, is_adult: false, limit: 10 }) => {
  const cacheKey = createCacheKey('similar-content', {
    limit: options.limit || 10,
    is_movie: options.is_movie,
    is_drama: options.is_drama,
    is_adult: options.is_adult
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const results = await recommendationAPI.fetchRecommendations('similar', options.limit || 10, {
        is_movie: options.is_movie,
        is_drama: options.is_drama,
        is_adult: options.is_adult
      });
      return results;
    }, API_CONFIG.cacheTimeout);
    
    return normalizeItems(data);
  } catch (error) {
    console.error('유사 콘텐츠 가져오기 실패:', error);
    return [];
  }
};

/**
 * 테스트 추천 콘텐츠 가져오기 (기존 호환성 유지)
 * @param {Object} options - 가져오기 옵션
 * @returns {Promise<Array>} - 테스트 추천 아이템들
 */
export const getTestRecommendations = async (options = { limit: 10 }) => {
  const cacheKey = createCacheKey('test-recommendations', {
    limit: options.limit || 10
  });
  
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const results = await recommendationAPI.fetchRecommendations('test', options.limit || 10);
      return results;
    }, API_CONFIG.cacheTimeout);
    
    return normalizeItems(data);
  } catch (error) {
    console.error('테스트 추천 콘텐츠 가져오기 실패:', error);
    return [];
  }
};

/**
 * HTML 프로젝트의 rec_test.js에서 사용하던 함수들 (React용으로 변환)
 */

// 오늘의 인기작 가져오기
export const fetchTopRecs = (limit = 10) => getPopularContent({ limit });

// 개인화된 힐링 추천 가져오기  
export const fetchEmotionRecs = (limit = 10) => getEmotionContent({ limit });

// 최근 시청 콘텐츠 가져오기
export const fetchRecentRecs = (limit = 10) => getRecentContent({ limit });

// 기본 내보내기
export default {
  getHeroContent,
  getPopularContent,
  getRecentContent,
  getEmotionContent,
  getSimilarContent,
  getTestRecommendations,
  fetchTopRecs,
  fetchEmotionRecs,
  fetchRecentRecs
};
