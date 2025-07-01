from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from collections import defaultdict
from sqlalchemy import func

from server.core.database import get_db
from server.models.asset import Asset
from server.api.schemas.asset import AssetOut

router = APIRouter(tags=["assets"])
# ----------------------
# 단일(비시리즈) 콘텐츠 리스트 API (삭제)
# ----------------------
# @router.get("/single")
# def get_single_assets(db: Session = Depends(get_db)):
#     ...

# ----------------------
# 메인 에셋 리스트 API
# ----------------------
@router.get("/main", response_model=List[AssetOut])
def read_main_assets(db: Session = Depends(get_db)):
    """
    is_main == True 인 에셋 전부를 반환
    """
    assets = db.query(Asset).filter(Asset.is_main == True).all()
    return assets

# ----------------------
# 동적 필터링 API
# ----------------------
@router.get("/filter", response_model=List[AssetOut])
def filter_assets(
    is_adult: Optional[bool] = Query(None, description="성인 콘텐츠 포함 여부"),
    is_movie: Optional[bool] = Query(None, description="영화만 필터링"),
    is_drama: Optional[bool] = Query(None, description="드라마만 필터링"),
    is_main: Optional[bool] = Query(None, description="메인 추천만 필터링"),
    genre: Optional[str] = Query(None, description="장르 이름"),
    db: Session = Depends(get_db),
):
    """
    다양한 조건으로 에셋을 필터링하여 반환
    """
    q = db.query(Asset)
    if is_adult is not None:
        q = q.filter(Asset.is_adult == is_adult)
    if is_movie is not None:
        q = q.filter(Asset.is_movie == is_movie)
    if is_drama is not None:
        q = q.filter(Asset.is_drama == is_drama)
    if is_main is not None:
        q = q.filter(Asset.is_main == is_main)
    if genre:
        q = q.filter(Asset.genre == genre)
    return q.all()

# ----------------------
# 단일 에셋 조회 API
# ----------------------
@router.get("/{asset_id}", response_model=AssetOut)
def read_asset(asset_id: int, db: Session = Depends(get_db)):
    """
    단일 에셋 조회 (조건 없이 PK 기준)
    """
    asset = db.query(Asset).filter(Asset.idx == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

# ----------------------
# 특정 시리즈 조회 API
# ----------------------
@router.get("/series/{asset_idx}")
def get_series_by_asset(asset_idx: int, db: Session = Depends(get_db)):
    """
    특정 asset_idx에 해당하는 시리즈의 모든 에피소드 정보 반환 (is_main 조건 없이 전체)
    """
    asset = db.query(Asset).filter(Asset.idx == asset_idx).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    unique_asset_id = asset.unique_asset_id

    # is_main 조건 제거!
    results = (
        db.query(
            Asset.unique_asset_id,
            Asset.super_asset_nm,
            Asset.actr_disp,
            Asset.genre,
            Asset.rlse_year,
            Asset.poster_path,
            Asset.asset_nm,
            Asset.asset_time,
            Asset.epsd_no,
            Asset.smry,
            Asset.smry_shrt
        )
        .filter(Asset.unique_asset_id == unique_asset_id)
        .order_by(Asset.epsd_no)
        .all()
    )

    if not results:
        raise HTTPException(status_code=404, detail="Series not found")

    series_info = {
        'unique_asset_id': results[0].unique_asset_id,
        'super_asset_nm': results[0].super_asset_nm,
        'actr_disp': results[0].actr_disp,
        'genre': results[0].genre,
        'rlse_year': results[0].rlse_year,
        'poster_path': results[0].poster_path,
        'episodes': []
    }
    for row in results:
        series_info['episodes'].append({
            "asset_nm": row.asset_nm,
            "asset_time": row.asset_time,
            "epsd_no": row.epsd_no,
            "smry": row.smry,
            "smry_shrt": row.smry_shrt
        })
    return series_info