# CSV 데이터 폴더

이 폴더는 로컬 CSV 파일들을 저장하는 곳입니다.

## 권장 파일 구조

### 1. assets.csv (콘텐츠 데이터)
```csv
idx,full_asset_id,unique_asset_id,asset_nm,super_asset_nm,actr_disp,genre,degree,asset_time,rlse_year,smry,epsd_no,is_adult,is_movie,is_drama,is_main,keyword,poster_path
1,ASSET001,UNIQUE001,영화제목1,시리즈명1,배우1,액션,15,120,2023,줄거리1,0,false,true,false,true,키워드1,/path/to/poster1.jpg
2,ASSET002,UNIQUE002,드라마제목1,시리즈명2,배우2,드라마,12,60,2023,줄거리2,1,false,false,true,true,키워드2,/path/to/poster2.jpg
```

### 2. users.csv (사용자 데이터)
```csv
user_idx,sha2_hash,age,created_at,birth,is_adult,sec_password,nick_name
1,hash1,25,2023-01-01,1998-01-01,false,0000,사용자1
2,hash2,30,2023-01-02,1993-01-01,true,1234,사용자2
```

### 3. ratings.csv (평점 데이터)
```csv
user_idx,asset_idx,rating,created_at
1,1,4.5,2023-01-01
1,2,3.0,2023-01-02
2,1,5.0,2023-01-03
```

### 4. product.csv (제품 데이터)
- **목적:** 다양한 렌탈/판매 제품의 정보를 저장합니다. (예: 가전, 가구, 반려동물 용품 등)
- **주요 컬럼:**
  - `name`: 제품명
  - `price`: 월 렌탈료 또는 가격(숫자)
  - `category_main`: 메인 카테고리 (예: 계절가전, 생활가전 등)
  - `category_sub`: 서브 카테고리 (예: 에어컨, 비데 등)
  - `img_path`: 제품 이미지 URL
  - `product_no`: 제품 고유 번호(숫자)
- **예시:**
  ```csv
  name,price,category_main,category_sub,img_path,product_no
  삼성 창문형 에어컨,28900,계절가전,에어컨,https://example.com/image1.jpg,2214
  LG벽걸이에어컨,30900,계절가전,에어컨,https://example.com/image2.jpg,2204
  ```

## API 엔드포인트

### 기본 CSV 엔드포인트
- `GET /csv/files` - 사용 가능한 CSV 파일 목록
- `GET /csv/info/{filename}` - CSV 파일 정보
- `GET /csv/data/{filename}` - CSV 데이터 조회 (페이지네이션 지원)

### 특화 CSV 엔드포인트
- `GET /csv/assets` - assets.csv 필터링 조회
- `GET /csv/search` - CSV 파일 내 텍스트 검색

### 관리 CSV 엔드포인트
- `POST /csv/reload/{filename}` - CSV 파일 다시 로드
- `DELETE /csv/cache` - 캐시 정리

### 제품 API 엔드포인트 - **NEW**

#### 기본 제품 조회
- `GET /products` - 제품 목록 조회 (필터링, 정렬, 검색 지원)
- `GET /products/{product_no}` - 특정 제품 번호로 제품 정보 조회

#### 카테고리 관련
- `GET /products/categories/main` - 메인 카테고리 목록
- `GET /products/categories/sub` - 서브 카테고리 목록
- `GET /products/categories` - 카테고리 계층 구조

#### 검색 및 추천
- `GET /products/search` - 제품명 검색
- `GET /products/recommendations` - 조건별 제품 추천

#### 통계 정보
- `GET /products/price-range` - 가격 범위 정보
- `GET /products/stats` - 제품 통계 정보

## 사용 예시

### 1. 파일 목록 조회
```bash
curl http://localhost:8000/csv/files
```

### 2. assets.csv 정보 조회
```bash
curl http://localhost:8000/csv/info/assets.csv
```

### 3. 필터링된 assets 데이터 조회
```bash
curl "http://localhost:8000/csv/assets?genre=액션&limit=10"
```

### 4. CSV 데이터 검색
```bash
curl "http://localhost:8000/csv/search?filename=assets.csv&query=액션&column=genre"
```

### 5. 제품 목록 조회 - **NEW**
```bash
# 기본 제품 목록
curl "http://localhost:8000/products?limit=20"

# 카테고리별 필터링
curl "http://localhost:8000/products?category_main=계절가전&category_sub=에어컨"

# 가격 범위 필터링
curl "http://localhost:8000/products?min_price=20000&max_price=50000"

# 제품명 검색
curl "http://localhost:8000/products?search=삼성"

# 정렬
curl "http://localhost:8000/products?sort_by=price&sort_order=asc"
```

### 6. 특정 제품 조회 - **NEW**
```bash
curl "http://localhost:8000/products/2214"
```

### 7. 카테고리 정보 조회 - **NEW**
```bash
# 메인 카테고리
curl "http://localhost:8000/products/categories/main"

# 서브 카테고리 (특정 메인 카테고리)
curl "http://localhost:8000/products/categories/sub?category_main=계절가전"

# 전체 카테고리 계층
curl "http://localhost:8000/products/categories"
```

### 8. 제품 검색 - **NEW**
```bash
curl "http://localhost:8000/products/search?query=에어컨&category_main=계절가전"
```

### 9. 제품 추천 - **NEW**
```bash
curl "http://localhost:8000/products/recommendations?category_main=계절가전&max_price=50000"
```

### 10. 통계 정보 - **NEW**
```bash
# 가격 범위
curl "http://localhost:8000/products/price-range"

# 전체 통계
curl "http://localhost:8000/products/stats"
```

## 제품 API 상세 설명

### 제품 목록 조회 (`GET /products`)
**쿼리 파라미터:**
- `limit`: 반환할 제품 수 (기본값: 50)
- `category_main`: 메인 카테고리 필터
- `category_sub`: 서브 카테고리 필터
- `min_price`: 최소 가격
- `max_price`: 최대 가격
- `search`: 제품명 검색어
- `sort_by`: 정렬 기준 (name, price, product_no)
- `sort_order`: 정렬 순서 (asc, desc)

**응답 예시:**
```json
{
  "total_count": 452,
  "returned_count": 20,
  "limit": 20,
  "filters": {
    "category_main": "계절가전",
    "category_sub": "에어컨",
    "min_price": null,
    "max_price": null,
    "search": null
  },
  "sort": {
    "by": "price",
    "order": "asc"
  },
  "products": [
    {
      "name": "삼성 창문형 에어컨",
      "price": 28900,
      "category_main": "계절가전",
      "category_sub": "에어컨",
      "img_path": "https://example.com/image1.jpg",
      "product_no": 2214
    }
  ]
}
```

### 카테고리 계층 구조 (`GET /products/categories`)
**응답 예시:**
```json
{
  "category_hierarchy": {
    "계절가전": {
      "sub_categories": ["에어컨", "공기청정기"],
      "product_count": 150
    },
    "생활가전": {
      "sub_categories": ["비데", "건조기", "반려동물"],
      "product_count": 200
    }
  },
  "total_main_categories": 2
}
```

## 주의사항

1. **파일 크기**: 대용량 CSV 파일은 메모리 사용량에 주의
2. **인코딩**: UTF-8 인코딩 권장
3. **캐시**: 자동 캐싱으로 성능 향상, 필요시 캐시 정리
4. **보안**: 민감한 데이터는 이 폴더에 저장하지 말 것

## 성능 최적화

- 자주 사용하는 데이터는 캐시 활용
- 필요한 컬럼만 선택하여 조회
- 페이지네이션 사용으로 대용량 데이터 처리
- 인덱스가 필요한 경우 별도 처리 고려 