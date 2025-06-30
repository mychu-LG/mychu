console.log('✅✅✅ Search 컴포넌트 반영 테스트 ✅✅✅');

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Search = ({ placeholder = '검색어를 입력하세요', showSuggestions = true }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef();
  const debounceRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const handleSearchOrClose = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setShowSuggestionsList(false);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim() && query.length >= 2 && showSuggestions) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query.trim());
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      setShowSuggestionsList(true);
    } else if (!isOpen) {
      setShowSuggestionsList(false);
    }
  }, [isOpen, suggestions]);

  const fetchSuggestions = async (searchQuery) => {
    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${API_BASE_URL}/search/?query=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`검색 API 오류: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || data || [];

      if (Array.isArray(results)) {
        setSuggestions(results);
        setShowSuggestionsList(true);
      }
    } catch (error) {
      console.error('검색 자동완성 오류:', error);
      if (error.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setShowSuggestionsList(false);
    }
  };

  const getTitle = (item) => {
  return item.title || item.asset_nm || item.super_asset_nm || '제목 없음';
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (item) => {
    const id = item.idx || item.asset_idx || item.id || '';
    if (id) {
      if (item.is_adult === 'Y' || item.genre?.includes('성인')) {
        navigate(`/adult?id=${id}`);
      } else {
        navigate(`/contents/${id}`);
      }
    }
    setShowSuggestionsList(false);
  };

  return (
    <div ref={searchRef} className={`search-wrapper ${isOpen ? 'open' : ''}`}>
      <div className={`search-component ${isOpen ? 'open' : ''}`}>
        <div className="search-input-container">
          {isOpen && (
            <input
              type="text"
              className="search-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          )}
          <button
            className="search-button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              else if (query.trim()) handleSearch();
              else setIsOpen(false);
            }}
            disabled={loading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && showSuggestionsList && (
        <div className="search-suggestions">
          {loading && (
            <div className="suggestion-item loading">검색 중...</div>
          )}
          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="suggestion-item no-results">검색 결과가 없습니다.</div>
          )}
          {!loading && suggestions.map((item, index) => {
            // ⭐️ 제목 우선순위
            const title = item.super_asset_nm || item.asset_nm || item.title || '제목 없음';
            // ⭐️ 장르 정보
            const genre = item.genre || '';
            
            return (
              <div
                key={item.idx || item.asset_idx || item.id || index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(item)}
              >
                <div className="item-info">
                  <div className="item-title">{title}</div>
                  {genre && (
                    <div className="item-meta">{genre}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;
