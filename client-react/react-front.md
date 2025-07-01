# VOD 추천 서비스 프론트엔드 (React/Vite)

---

## 2025-06-27 기준 구현 현황

- 기존 HTML/CSS 기반 VOD 서비스의 모든 주요 기능을 React SPA로 이식 완료.
- FastAPI 백엔드와 연동하여 시청 기록, 찜하기, 검색, 추천, 성인관 등 실서비스 수준의 기능 구현.
- **시청 기록/찜한 콘텐츠**: 실제 DB와 연동, 중복 제거, 페이지네이션, 실시간 반영.
- **찜하기/해제**: 상세 페이지 및 리스트에서 실시간 반영, DB와 동기화.
- **이미지 처리**: 성인물/일반 콘텐츠 구분, 경로 변환 및 예외 처리.
- **검색/메인/성인관/마이리스트**: 모든 주요 페이지에서 상세 진입, 카드 클릭 시 상세 페이지 이동 완비.
- **UI/UX**: 반응형, 뱃지, 빈 상태, 에러/로딩 처리 등 실사용자 경험 구현.
- **코드 구조**: 컴포넌트/서비스/훅/유틸 분리, 유지보수 및 확장성 확보.
- **백엔드**: CORS, DB 제약조건, API 응답 구조 등 실서비스 수준으로 최적화.

> 현재 WellList 프론트엔드는 실서비스 수준의 SPA로 완성되어 있으며, 모든 주요 기능이 FastAPI 백엔드와 정상적으로 연동되고 있습니다.

---

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.

## 프로젝트 구조

```
client-react/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── home/
│   │   │   └── LandingPage.jsx # 랜딩 페이지 (/)
│   │   ├── main/
│   │   │   └── HomePage.jsx    # 메인 홈 페이지 (/home)
│   │   ├── index/
│   │   │   └── SignupPage.jsx  # 회원가입 (/signup)
│   │   ├── login/
│   │   │   └── LoginPage.jsx   # 로그인 (/login)
│   │   ├── account-select/
│   │   │   └── AccountSelectPage.jsx  # 계정 선택 (/account-select)
│   │   ├── movie/
│   │   │   └── MoviePage.jsx   # 영화 페이지 (/movie)
│   │   ├── drama/
│   │   │   └── DramaPage.jsx   # 드라마 페이지 (/drama)
│   │   └── search/
│   │       └── SearchPage.jsx  # 검색 페이지 (/search)
│   │
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.jsx      # 네비게이션 헤더
│   │   ├── slider/
│   │   │   ├── Slider.jsx      # 콘텐츠 슬라이더
│   │   │   └── Slider.css
│   │   ├── recommendations/
│   │   │   ├── Recommendations.jsx  # 추천 시스템
│   │   │   └── Recommendations.css
│   │   ├── search/
│   │   │   ├── Search.jsx      # 검색 컴포넌트
│   │   │   └── Search.css
│   │   ├── dropdown/
│   │   │   ├── GenreDropdown.jsx    # 장르 드롭다운
│   │   │   └── Dropdown.css
│   │   └── hero/
│   │       ├── Hero.jsx        # 히어로 배너
│   │       └── Hero.css
│   │
│   ├── services/               # API 및 서비스 레이어
│   │   ├── api.js              # 기본 API 클라이언트
│   │   ├── searchAPI.js        # 검색 API 서비스
│   │   ├── recommendationService.js  # 추천 API 서비스
│   │   ├── recommendationHelpers.js  # 추천 헬퍼 함수
│   │   ├── auth.js             # 인증 서비스
│   │   └── firebase.js         # Firebase 설정
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiConfig.js        # API 설정 상수
│   │   └── apiCache.js         # API 캐시 관리
│   │
│   ├── assets/                 # 정적 파일
│   │   └── images/
│   │
│   ├── styles/                 # 전역 스타일
│   │   └── globals.css
│   │
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 진입점
│   ├── index.css
│   └── routes.jsx              # 라우팅 설정
│
├── public/
├── .env.example                # 환경변수 예제
├── vite.config.js
├── package.json
└── README.md
```

## 주요 기능

### 1. 페이지 구성
- **LandingPage**: WellList 브랜드 랜딩 페이지
- **HomePage**: 영화/드라마 구분된 메인 홈 페이지 
- **SignupPage**: 회원가입 페이지
- **LoginPage**: 로그인 페이지  
- **AccountSelectPage**: 프로필 선택 페이지
- **MoviePage**: 영화 전용 페이지
- **DramaPage**: 드라마 전용 페이지
- **SearchPage**: 통합 검색 페이지

### 2. 컴포넌트 시스템
- **Header**: 반응형 네비게이션 헤더
- **Slider**: 콘텐츠 슬라이더 (터치/마우스 지원)
- **Recommendations**: AI 기반 추천 시스템
- **Search**: 실시간 검색 및 자동완성
- **GenreDropdown**: 장르별 필터링
- **Hero**: 메인 배너 및 히어로 섹션

### 3. 서비스 레이어
- **API 통합**: 백엔드 API와 완전 연동
- **검색 시스템**: 실시간 검색 및 필터링
- **추천 엔진**: 개인화된 콘텐츠 추천
- **인증 시스템**: Firebase 기반 사용자 인증
- **캐시 관리**: API 응답 캐싱 및 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules, CSS Variables
- **Authentication**: Firebase Auth
- **API**: RESTful API with caching
- **Build Tool**: Vite
- **Package Manager**: npm

## 환경 설정

### 1. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 설정:

```env
# API 설정
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# 기타 설정
VITE_APP_NAME=WellList
VITE_CACHE_DURATION=300000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 특징

### 1. SPA 아키텍처
- React Router를 통한 SPA 네비게이션
- 페이지 간 부드러운 전환
- 브라우저 히스토리 관리

### 2. 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치/마우스 인터랙션 최적화

### 3. 성능 최적화
- API 응답 캐싱
- 이미지 레이지 로딩
- 컴포넌트 코드 분할

### 4. 사용자 경험
- 직관적인 네비게이션
- 실시간 검색 및 필터링
- 개인화된 추천 시스템

## API 연동

### 추천 API
```javascript
// 영화 추천 가져오기
const movieRecommendations = await recommendationService.getRecommendations({
  isMovie: true,
  limit: 20
});

// 드라마 추천 가져오기  
const dramaRecommendations = await recommendationService.getRecommendations({
  isDrama: true,
  limit: 20
});
```

### 검색 API
```javascript
// 콘텐츠 검색
const searchResults = await searchAPI.searchContent({
  query: '검색어',
  contentType: 'movie', // 'movie' | 'drama' | 'all'
  limit: 50
});
```

## 보안 설정

### Firebase 인증
- 환경변수를 통한 API 키 관리
- `.gitignore`에 민감한 정보 제외
- 프로덕션/개발 환경 분리

### API 보안
- CORS 설정
- API 타임아웃 관리
- 에러 핸들링

## 개발 가이드

### 컴포넌트 작성 규칙
1. 각 컴포넌트는 독립된 폴더에 위치
2. CSS 파일은 컴포넌트와 동일한 폴더에 위치
3. PropTypes 또는 TypeScript 타입 정의
4. 재사용 가능하도록 설계

### 서비스 레이어 사용
1. API 호출은 services 폴더의 함수 사용
2. 비즈니스 로직은 컴포넌트에서 분리
3. 에러 처리 및 로딩 상태 관리

### 스타일링 가이드
1. CSS Variables 사용으로 일관성 유지
2. 반응형 디자인 적용
3. 접근성(a11y) 고려

## 프로젝트 현황

### 완료된 기능
- ✅ React SPA 구조 완전 이식
- ✅ 모든 페이지 컴포넌트 구현
- ✅ 추천/검색/슬라이더 시스템 통합
- ✅ Firebase 인증 시스템
- ✅ API 연동 및 캐싱
- ✅ 반응형 UI/UX
- ✅ 환경변수 보안 설정

### 향후 개선 사항
- 성능 최적화 (React.memo, useMemo)
- 에러 바운더리 및 전역 에러 처리
- 단위/E2E 테스트 코드
- 접근성(ARIA) 개선
- 상태관리 라이브러리 도입
- PWA 기능 추가

## 핵심 컴포넌트 예제

### Slider 컴포넌트
```jsx
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

const Slider = ({ 
  items = [], 
  itemsPerView = 5, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  onItemClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-btn prev" onClick={prevSlide}>
        ←
      </button>
      
      <div className="slider-wrapper" ref={sliderRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="slider-item"
              onClick={() => onItemClick?.(item)}
            >
              <img src={item.poster} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="slider-btn next" onClick={nextSlide}>
        →
      </button>
    </div>
  );
};
```

### Recommendations 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import Slider from '../slider/Slider';
import './Recommendations.css';

const Recommendations = ({ 
  userId, 
  contentType = 'all', 
  limit = 20 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationService.getRecommendations({
          userId,
          isMovie: contentType === 'movie',
          isDrama: contentType === 'drama',
          limit
        });
        setRecommendations(data);
      } catch (error) {
        console.error('추천 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, contentType, limit]);

  if (loading) return <div className="loading">추천을 불러오는 중...</div>;

  return (
    <div className="recommendations">
      <h2>맞춤 추천</h2>
      <Slider
        items={recommendations}
        itemsPerView={5}
        onItemClick={(item) => console.log('클릭:', item)}
      />
    </div>
  );
};
```

## 배포 및 운영

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
npm run preview

# Docker 컨테이너 빌드
docker build -t welllist-frontend .

# Docker 실행
docker run -p 3000:3000 welllist-frontend
```

### 성능 모니터링
- Lighthouse 점수 정기 확인
- Bundle 크기 최적화
- 로딩 시간 모니터링
- 사용자 인터랙션 추적

---

**프로젝트 완료**: 기존 HTML/CSS/JS 기반 VOD 서비스가 React SPA로 완전히 이식되었습니다.

## 프로젝트 개요

기존 HTML/CSS/JS 기반 VOD 추천 서비스를 React SPA 구조로 완전히 이식한 프로젝트입니다.
