from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func
from typing import List, Optional

from server.core.database import get_db
from server.models.asset import Asset, Score
from server.api.schemas.recommendation import RecommendationResponse, RecommendationItem

# Create a separate router for the test endpoint
router = APIRouter(
    prefix="/recommendation",
    tags=["recommendation"]
)

@router.get("/test", response_model=RecommendationResponse)
def get_test_recommendations(
    n: int = Query(10, description="가져올 아이템 수"),
    is_adult: bool = Query(False, description="성인 제외"),
    is_main: bool = Query(True, description="메인 추천만"),
    is_movie: bool = Query(False, description="영화만"),
    is_drama: bool = Query(False, description="드라마만"),
    genre: Optional[str] = Query(None, description="특정 장르 필터링 (예: 로맨스 or !=로맨스)"),
    db: Session = Depends(get_db),
):
    """
    테스트용 추천 API - 다양한 파라미터 지원 -> 아무 실험 하시와요
    """
    import random
    
    # Asset 전체 컬럼을 select
    query = db.query(Asset)
    
    # 기본 필터 적용
    query = query.filter(Asset.is_adult == is_adult)
    if is_main:
        query = query.filter(Asset.is_main == is_main)
    if is_movie:
        query = query.filter(Asset.is_movie == is_movie)
    if is_drama:
        query = query.filter(Asset.is_drama == is_drama)
    if genre:
        if genre.startswith("!="):
            exclude_genre = genre[2:].strip()
            query = query.filter(~Asset.genre.ilike(f"%{exclude_genre}%"))
        else:
            query = query.filter(Asset.genre.ilike(f"%{genre}%"))    # n 개수로 제한 적용하여 성능 개선

    # 추가: 기타 장르 제외
    query = query.filter(~Asset.poster_path.ilike("%upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg%"))
    rows = query.limit(n).all()
    items = []
    for r in rows:
        try:
            items.append(
                RecommendationItem(
                    idx = r.idx,
                    full_asset_id = r.full_asset_id,
                    unique_asset_id = r.unique_asset_id,
                    asset_nm = r.asset_nm,
                    super_asset_nm = r.super_asset_nm,
                    actr_disp = r.actr_disp,
                    genre = r.genre,
                    degree = r.degree,
                    asset_time = r.asset_time,
                    rlse_year = r.rlse_year,
                    smry = r.smry,
                    epsd_no = r.epsd_no,
                    is_adult = r.is_adult,
                    is_movie = r.is_movie,
                    is_drama = r.is_drama,
                    is_main = r.is_main,
                    keyword = r.keyword,
                    poster_path = r.poster_path,
                    smry_shrt = getattr(r, 'smry_shrt', None)
                )
            )
        except Exception as e:
            print(f"Error creating recommendation item: {e}")
            continue

    return RecommendationResponse(items=items)



@router.get("/popular", response_model=RecommendationResponse)
def get_popular_recommendations(
    n: int = Query(10, description="가져올 아이템 수"),
    is_adult: bool = Query(False, description="성인 제외"),
    is_main: bool = Query(True, description="메인 추천만"),
    is_movie: bool = Query(False, description="영화만"),
    is_drama: bool = Query(False, description="드라마만"),
    genre: Optional[str] = Query(None, description="특정 장르로 필터링 (!=로맨스: 제외)"),
    db: Session = Depends(get_db),
):
    # 1. 이미지 없는 것 먼저 제외 (여러 패턴)
    query = (
        db.query(Asset)
        .join(Score, Asset.idx == Score.asset_idx)
        .options(joinedload(Asset.scores))
        .filter(Asset.is_adult == is_adult)
        .filter(~Asset.poster_path.ilike("%No-Image-Placeholder.svg%"))
        .filter(~Asset.poster_path.ilike("%upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg%"))
    )

    if is_main:
        query = query.filter(Asset.is_main == is_main)
    if is_movie:
        query = query.filter(Asset.is_movie == is_movie)
    if is_drama:
        query = query.filter(Asset.is_drama == is_drama)
    query = query.filter(Score.c_rate > 0.3)

    if genre:
        if genre.startswith("!="):
            exclude_genre = genre[2:].strip()
            query = query.filter(~Asset.genre.ilike(f"%{exclude_genre}%"))
        else:
            query = query.filter(Asset.genre.ilike(f"%{genre}%"))

    # 2. 인기순 정렬 후 limit
    rows = query.order_by(Score.cnt.desc()).limit(n).all()

    items = []
    for r in rows:
        try:
            items.append(RecommendationItem(
                idx=r.idx,
                full_asset_id=r.full_asset_id,
                unique_asset_id=r.unique_asset_id,
                asset_nm=r.asset_nm,
                super_asset_nm=r.super_asset_nm,
                actr_disp=r.actr_disp,
                genre=r.genre,
                degree=r.degree,
                asset_time=r.asset_time,
                rlse_year=r.rlse_year,
                smry=r.smry,
                epsd_no=r.epsd_no,
                is_adult=r.is_adult,
                is_movie=r.is_movie,
                is_drama=r.is_drama,
                is_main=r.is_main,
                keyword=r.keyword,
                poster_path=r.poster_path,
                smry_shrt=getattr(r, 'smry_shrt', None)
            ))
        except Exception as e:
            print(f"Error building item: {e}")
            continue

    return RecommendationResponse(items=items)


@router.get("/recent", response_model=RecommendationResponse)
def get_recent_recommendations(
    n: int = Query(10, description="가져올 아이템 수"),
    is_adult: bool = Query(False, description="성인 제외"),
    is_main: bool = Query(True, description="메인 추천만"),
    is_movie: bool = Query(True, description="영화만"),
    is_drama: bool = Query(True, description="드라마만"),
    genre: Optional[str] = Query(None, description="특정 장르 필터링 (예: 로맨스 or !=로맨스)"),
    db: Session = Depends(get_db),
):
    """
    최신 추천 API - 출시년도 기준 최신순
    """
    # 1. 이미지 없는 것 먼저 제외 (여러 패턴)
    query = db.query(Asset)
    query = query.filter(Asset.is_adult == is_adult)
    query = query.filter(~Asset.poster_path.ilike("%No-Image-Placeholder.svg%"))
    query = query.filter(~Asset.poster_path.ilike("%upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg%"))

    if is_main:
        query = query.filter(Asset.is_main == is_main)

    # 영화/드라마 필터 (합집합 방식)
    if is_movie and not is_drama:
        query = query.filter(Asset.is_movie == True)
    elif is_drama and not is_movie:
        query = query.filter(Asset.is_drama == True)
    elif not is_movie and not is_drama:
        pass  # 전체 (필터 없음)
    # 둘 다 True면 전체 (필터 없음)

    if genre:
        if genre.startswith("!="):
            exclude_genre = genre[2:].strip()
            query = query.filter(~Asset.genre.ilike(f"%{exclude_genre}%"))
        else:
            query = query.filter(Asset.genre.ilike(f"%{genre}%"))

    # 2. 최신순 정렬 후 limit
    rows = query.order_by(Asset.rlse_year.desc()).limit(n).all()

    items = []
    for r in rows:
        try:
            items.append(
                RecommendationItem(
                    idx = r.idx,
                    full_asset_id = r.full_asset_id,
                    unique_asset_id = r.unique_asset_id,
                    asset_nm = r.asset_nm,
                    super_asset_nm = r.super_asset_nm,
                    actr_disp = r.actr_disp,
                    genre = r.genre,
                    degree = r.degree,
                    asset_time = r.asset_time,
                    rlse_year = r.rlse_year,
                    smry = r.smry,
                    epsd_no = r.epsd_no,
                    is_adult = r.is_adult,
                    is_movie = r.is_movie,
                    is_drama = r.is_drama,
                    is_main = r.is_main,
                    keyword = r.keyword,
                    poster_path = r.poster_path,
                    smry_shrt = getattr(r, 'smry_shrt', None)
                )
            )
        except Exception as e:
            print(f"Error creating recommendation item: {e}")
            continue

    return RecommendationResponse(items=items)