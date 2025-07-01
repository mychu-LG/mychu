/**
 * 통합 API 호출 유틸리티 함수
 * HTML 프로젝트의 requests.js와 기존 api.js를 통합
 */

import { API_BASE_URL, API_CONFIG, CURRENT_ENV } from '../utils/apiConfig.js';

/**
 * 기본 fetch 래퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<any>} 응답 데이터
 */
export const fetchAPI = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    if (CURRENT_ENV.enableLogging) {
      console.log(`[API 요청] ${url}`, mergedOptions);
    }

    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorMessage = `API 호출 실패: ${response.status} ${response.statusText}`;
      if (CURRENT_ENV.enableLogging) {
        console.error(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (CURRENT_ENV.enableLogging) {
      console.log(`[API 응답] ${url}`, data);
    }
    
    return data;
  } catch (error) {
    if (CURRENT_ENV.enableLogging) {
      console.error('API 호출 중 오류 발생:', error);
    }
    throw error;
  }
};

/**
 * 추천 API 관련 함수 (HTML requests.js와 통합)
 */
export const recommendationAPI = {
  /**
   * 추천 콘텐츠 가져오기 (통합된 함수)
   * @param {string} type - 추천 타입 (top, emotion, recent, similar, test)
   * @param {number} limit - 가져올 아이템 수
   * @param {Object} options - 추가 옵션
   * @returns {Promise<any>} 추천 목록
   */
  fetchRecommendations: async (type, limit = 10, options = {}) => {
    const endpoints = {
      top: '/recommendation/top',
      emotion: '/recommendation/emotion', 
      recent: '/recommendation/recent',
      similar: '/recommendation/similar',
      test: '/recommendation/test',
      popular: '/recommendation/popular'
    };
    
    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown recommendation type: ${type}`);
    }
    
    try {
      const params = new URLSearchParams({ n: limit.toString() });
      
      // 추가 옵션 처리
      if (options.is_movie !== undefined) params.append('is_movie', options.is_movie.toString());
      if (options.is_drama !== undefined) params.append('is_drama', options.is_drama.toString());
      if (options.is_adult !== undefined) params.append('is_adult', options.is_adult.toString());
      if (options.is_main !== undefined) params.append('is_main', options.is_main.toString());
      if (options.genre) params.append('genre', options.genre);
      if (options.user_id) params.append('user_id', options.user_id);
      
      if (CURRENT_ENV.enableLogging) {
        console.log(`Fetching ${type} recommendations:`, endpoint + '?' + params.toString());
      }
      
      const data = await fetchAPI(`${endpoint}?${params.toString()}`);
      return data.items || data.results || [];
    } catch (error) {
      if (CURRENT_ENV.enableLogging) {  
        console.error(`Error fetching ${type} recommendations:`, error);
      }
      throw error;
    }
  },

  /**
   * 테스트 추천 목록 가져오기 (기존 호환성 유지)
   */
  getTestRecommendations: (n = 10) => {
    return recommendationAPI.fetchRecommendations('test', n);
  },
  
  /**
   * 인기 콘텐츠 가져오기 (기존 호환성 유지)
   */
  getPopular: (limit = 10) => {
    return recommendationAPI.fetchRecommendations('top', limit);
  },
  
  /**
   * 최신 콘텐츠 가져오기 (기존 호환성 유지)
   */
  getRecent: (limit = 10) => {
    return recommendationAPI.fetchRecommendations('recent', limit);
  },
  
  /**
   * 장르별 콘텐츠 가져오기
   */
  getByGenre: (genre, limit = 10) => {
    return fetchAPI(`/assets?genre=${encodeURIComponent(genre)}&limit=${limit}`);
  },
  
  /**
   * 히어로 섹션 데이터 가져오기
   */
  getHero: () => {
    return recommendationAPI.fetchRecommendations('test', 5, { is_movie: true });
  },

  /**
   * 자산 목록 가져오기 (HTML requests.js와 통합)
   */
  fetchAssets: (limit = 10) => {
    return fetchAPI(`/assets?limit=${limit}`);
  }
};

/**
 * 검색 API 관련 함수 (HTML search.js와 통합)
 */
export const searchAPI = {
  /**
   * 기본 검색 (HTML searchContent와 통합)
   * @param {string} query - 검색어
   * @param {Object} options - 검색 옵션
   * @returns {Promise<any>} 검색 결과
   */
  searchContent: async (query, options = {}) => {
    if (!query || query.length < 2) return [];
    
    const params = new URLSearchParams({
      query: query,
      limit: (options.limit || 10).toString()
    });
    
    // 추가 검색 파라미터 처리
    if (options.genre) params.append('genre', options.genre);
    if (options.release_year) params.append('release_year', options.release_year.toString());
    if (options.is_adult !== undefined) params.append('is_adult', options.is_adult.toString());
    if (options.is_movie !== undefined) params.append('is_movie', options.is_movie.toString());
    if (options.is_drama !== undefined) params.append('is_drama', options.is_drama.toString());
    if (options.user_id) params.append('user_id', options.user_id);
    
    // 고급 검색 사용 여부
    const endpoint = options.advanced ? '/search/advanced' : '/search';
    
    const data = await fetchAPI(`${endpoint}?${params.toString()}`);
    return data.results || [];
  },

  /**
   * 일반 검색 (성인 제외) - HTML searchFiltered와 동일
   */
  searchFiltered: async (query, limit = 10) => {
    const data = await searchAPI.searchContent(query, { limit, is_adult: false });
    return data;
  },

  /**
   * 전체 검색 (성인 포함 옵션) - HTML searchAll과 동일
   */
  searchAll: async ({ query, limit = 10, is_adult = false, user_id }) => {
    const data = await fetchAPI(`/search/all?${new URLSearchParams({ 
      query, 
      limit: limit.toString(), 
      is_adult: is_adult.toString(),
      ...(user_id && { user_id })
    }).toString()}`);
    return data.results || [];
  },

  /**
   * 고급 검색 - HTML searchAdvanced와 동일
   */
  searchAdvanced: async ({ query, limit = 10, genre, release_year, is_adult, is_movie, is_drama, user_id }) => {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    if (genre) params.set("genre", genre);
    if (release_year) params.set("release_year", release_year.toString());
    if (typeof is_adult !== "undefined") params.set("is_adult", is_adult.toString());
    if (typeof is_movie !== "undefined") params.set("is_movie", is_movie.toString());
    if (typeof is_drama !== "undefined") params.set("is_drama", is_drama.toString());
    if (user_id) params.set("user_id", user_id);
    
    const data = await fetchAPI(`/search/advanced?${params.toString()}`);
    return data.results || [];
  },

  /**
   * 자동완성 검색 - HTML searchAutocomplete와 동일
   */
  searchAutocomplete: async (query, limit = 5) => {
    if (!query || query.length < 1) return [];
    
    const data = await fetchAPI(`/search/autocomplete?${new URLSearchParams({ 
      query,
      limit: limit.toString() 
    }).toString()}`);
    return data.results || [];
  },

  /**
   * 기존 호환성을 위한 검색 함수
   */
  search: (query, limit = 20) => {
    return searchAPI.searchFiltered(query, limit);
  }
};

export default {
  fetchAPI,
  recommendationAPI,
  searchAPI
};
