from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from pydantic import BaseModel
from ...core.services.csv_data_loader import csv_loader
from server.models.asset import Asset
from server.core.database import SessionLocal

router = APIRouter()

class EmotionAssetRecommendation(BaseModel):
    asset_idx: int
    asset_nm: str
    poster_path: str
    genre: str
    is_movie: Optional[bool] = None
    is_drama: Optional[bool] = None
    similarity: float

class EmotionAssetRecommendationResponse(BaseModel):
    recommendations: List[EmotionAssetRecommendation]
    total_count: int

@router.get("/emotion/recommendations/{user_idx}", response_model=EmotionAssetRecommendationResponse)
async def get_emotion_recommendations(
    user_idx: int,
    is_home: Optional[bool] = Query(None, description="홈 콘텐츠 필터"),
    is_drama: Optional[bool] = Query(None, description="드라마 콘텐츠 필터"),
    is_movie: Optional[bool] = Query(None, description="영화 콘텐츠 필터"),
    genre: Optional[str] = Query(None, description="장르 필터")
):
    """
    사용자별 감정 기반 추천 정보를 반환합니다.
    rec_emotion.csv와 DB의 Asset 테이블을 join하여 상세 정보를 함께 제공합니다.
    """
    try:
        # CSV 파일 로드
        rec_df = csv_loader.load_csv('rec_emotion.csv')
        # 필터링
        rec_df = rec_df[rec_df['user_idx'] == user_idx]
        if is_home is not None:
            rec_df = rec_df[rec_df['is_home'] == is_home]
        if is_drama is not None:
            rec_df = rec_df[rec_df['is_drama'] == is_drama]
        if is_movie is not None:
            rec_df = rec_df[rec_df['is_movie'] == is_movie]
        if genre:
            rec_df = rec_df[rec_df['genre'] == genre]
        if len(rec_df) == 0:
            return EmotionAssetRecommendationResponse(recommendations=[], total_count=0)
        # 상위 10개만
        rec_df = rec_df.sort_values('similarity', ascending=False).head(10)
        content_ids = rec_df['content_id'].tolist()
        # DB에서 Asset 정보 조회
        db = SessionLocal()
        assets = db.query(Asset).filter(Asset.full_asset_id.in_(content_ids)).all()
        db.close()
        asset_map = {a.full_asset_id: a for a in assets}
        # join 결과 생성
        recommendations = []
        for _, row in rec_df.iterrows():
            asset = asset_map.get(row['content_id'])
            if asset:
                recommendations.append(EmotionAssetRecommendation(
                    asset_idx=asset.idx,
                    asset_nm=asset.asset_nm,
                    poster_path=asset.poster_path or '',
                    genre=asset.genre or '',
                    is_movie=asset.is_movie,
                    is_drama=asset.is_drama,
                    similarity=row['similarity']
                ))
        return EmotionAssetRecommendationResponse(
            recommendations=recommendations,
            total_count=len(recommendations)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading emotion recommendations: {str(e)}")