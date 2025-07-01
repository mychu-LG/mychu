# 추천 시스템 상세 설명

## 1. 개요
이 VOD 추천 시스템은 콘텐츠 기반 필터링과 감정 기반 필터링을 결합한 하이브리드 추천 시스템을 구현하며, 프론트엔드와 효율적으로 통합되어 실시간 추천을 제공합니다.

## 2. 개선된 하이브리드 추천 알고리즘

### 콘텐츠 특성 결합
```python
# server/core/services/recommender_singleton.py의 주요 로직
- 콘텐츠 특성 추출 및 결합:
  1. 줄거리(smry): TF-IDF 벡터화
  2. 장르(genre): 원-핫 인코딩
  3. 감정(emotion): NRC 감정 사전 기반 특성화
- 특성 가중치 적용 및 통합 벡터 생성
- 코사인 유사도 기반 효율적인 KNN 구현
```

### 다양성 보장 알고리즘
```python
# server/api/routes/recommendation_hybrid.py의 주요 기능
- 다양한 시리즈에서 추천 제공 (super_asset_nm 기반)
- 현재 콘텐츠 시리즈 제외
- top_n 만큼의 추천 항목 보장
- 필터링 적용 (성인 콘텐츠 등)
```

## 2-1. Emotion 기반 추천과 Cosine Similarity 기반 추천의 차이

### Emotion 기반 추천
- 사용자의 감정(예: "기쁨", "슬픔" 등) 또는 콘텐츠의 감정 태그를 기준으로 단순 필터링하여 추천
- DB에서 감정 태그로 조건 검색만 수행하므로 매우 빠름
- 대용량 데이터에서도 인덱스만 잘 되어 있으면 실시간 추천에 적합

### Cosine Similarity 기반 추천
- 각 콘텐츠(또는 사용자)의 특성을 벡터로 변환(TF-IDF, 원-핫, 감정 임베딩 등)
- 코사인 유사도 연산을 통해 가장 유사한 콘텐츠를 추천
- 벡터 수가 많아질수록 연산량이 급증하므로, 실시간 추천에는 최적화(싱글톤, 벡터DB, ANN 등)가 필요
- 하이브리드 추천(장르, 감정, 줄거리 등 특성 결합)도 코사인 유사도 기반으로 동작

### 성능 비교 및 최적화
- Emotion 추천: 단순 필터링 → 빠름
- Cosine Similarity 추천: 벡터 연산 → 데이터가 많으면 느려질 수 있음
- 최적화 방법: 
  - 추천 벡터를 서버 메모리에 싱글톤 패턴으로 상주시킴
  - KNN(NearestNeighbors) 등 라이브러리로 벡터 연산 최적화
  - 필요시 벡터DB(FAISS, Milvus 등)나 캐싱 활용

## 4. API 엔드포인트

### 유사 콘텐츠 추천
```python
@router.get("/recommendation/similar/{asset_idx}")
- 특정 콘텐츠와 유사한 항목 추천
- 하이브리드 특성 (장르, 감정, 줄거리) 기반 유사도 활용
- 시리즈별 다양성 적용 (super_asset_nm 기준으로 하나만 추천)
- 현재 시리즈 제외 기능
```

### 사용자 맞춤 하이브리드 추천
```python
@router.get("/recommendation/hybrid/user/{user_idx}")
- 사용자 시청 기록 기반 맞춤 추천
- 선호 장르 및 감정 분석
- 하이브리드 모델 활용
```

### 테스트용 추천
```python
@router.get("/recommendation/test")
- 다양한 파라미터 기반 테스트 추천
- 장르, 성인여부, 메인여부 등 필터링 옵션
- 프론트엔드 개발 지원용
```

## 5. 성능 최적화

### 싱글톤 패턴 구현
```python
# 추천 모델 싱글톤 패턴
class RecommenderSingleton:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load_models()
        return cls._instance
    
    def load_models(self):
        # 모델 파일 한 번만 로드
        self.hybrid_vectors = np.load(...)
        self.knn = NearestNeighbors(n_neighbors=50)
        self.knn.fit(self.hybrid_vectors)
```

### 계산 최적화
```python
# 다양성 기반 추천 로직
def get_recommendations_with_diversity(self, item_idx, top_n=10):
    # 1. KNN으로 더 많은 후보 추출
    indices, distances = self.knn.kneighbors(...)
    
    # 2. 현재 시리즈와 동일한 시리즈 제외
    current_series = db.query(Asset.super_asset_nm)...
    
    # 3. 시리즈별로 하나의 콘텐츠만 선택
    unique_series_items = {}
    for idx, score in zip(indices, similarity_scores):
        series_name = self.series_mapping.get(idx)
        if series_name not in unique_series_items:
            unique_series_items[series_name] = (idx, score)
    
    # 4. top_n만큼 반환, 부족하면 랜덤 추가
    result = list(unique_series_items.values())[:top_n]
    if len(result) < top_n:
        # 랜덤 콘텐츠로 부족분 채우기
```

## 6. 프론트엔드 통합

### API 응답 구조
```json
{
  "recommendations": [
    {
      "asset_idx": 12345,
      "asset_nm": "콘텐츠 제목",
      "poster_path": "/path/to/image.jpg",
      "similarity": 0.95
    },
  ]
}
```

### 클라이언트 구현
```javascript
// main.js - 콘텐츠 상세 페이지에서 유사 콘텐츠 로드
async function fetchSimilarContent(contentId, limit = 10) {
  const endpoint = `${API_BASE_URL}${ENDPOINTS.recommendations.similar}/${contentId}?top_n=${limit}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.recommendations || [];
}

// Slider.js - 추천 콘텐츠 렌더링
export async function renderSlider(slider, items) {
  slider.innerHTML = '';
  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';

  for (const item of items) {
    const card = await createCard(item);
    cardContainer.appendChild(card);
  }

  slider.appendChild(cardContainer);
}
```

### 사용자 경험 향상
- 로딩 상태 표시: API 요청 중 로딩 인디케이터 표시
- 에러 처리: 추천을 가져오지 못할 경우 대체 콘텐츠 표시
- 반응형 디자인: 모바일 및 데스크탑 모두 최적화된 레이아웃
- 접근성: 키보드 네비게이션 및 스크린 리더 지원

## 7. 시스템 아키텍처 개선

### 싱글톤 패턴 도입
- 서버 시작 시 모델 데이터 한 번만 로딩
- 메모리 사용량 최적화
- 응답 시간 단축

### 불필요한 코드 제거
- 디버그용 엔드포인트 제거
- 캐싱 로직 제거 (싱글톤으로 대체)
- 중복 코드 정리

### 확장성 고려
- 명확한 인터페이스 설계로 새로운 추천 알고리즘 쉽게 통합 가능
- 다양한 콘텐츠 유형 (영화, 드라마, 성인 등) 지원
- 프론트엔드 컴포넌트화로 재사용성 증가

## 8. 추가 설명

- 콘텐츠 클릭 시 URL에는 반드시 고유한 idx(예: `/content/12345`)가 들어가야 하며, emotion1/emotion2 등 문자열이 들어가면 안 됨
- 프론트엔드에서 리스트 렌더링 시 key 값도 idx 등 고유값을 사용해야 함 (중복 key 경고 주의)