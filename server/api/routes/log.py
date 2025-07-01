from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func, desc, and_

from server.core.database import get_db
from server.models.user import VodLog, MyList
from server.models.asset import Asset
from pydantic import BaseModel, ConfigDict

router = APIRouter()

# Define the response schema for user logs with asset details
class UserVodLogWithAsset(BaseModel):
    # VodLog fields
    log_idx: int
    user_idx: int
    asset_idx: int
    strt_dt: datetime
    use_tms: int
    feedback: int
    
    # Asset fields
    idx: int
    full_asset_id: str
    unique_asset_id: str
    asset_nm: str
    super_asset_nm: str
    actr_disp: Optional[str] = None
    genre: Optional[str] = None
    degree: Optional[int] = None
    asset_time: Optional[int] = None
    rlse_year: Optional[int] = None
    smry: Optional[str] = None
    epsd_no: int
    is_adult: bool
    is_movie: bool
    is_drama: bool
    is_main: bool
    keyword: Optional[str] = None
    poster_path: Optional[str] = None
    smry_shrt: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserVodLogsResponse(BaseModel):
    count: int
    logs: List[UserVodLogWithAsset]

class MyListAddRequest(BaseModel):
    user_idx: int
    asset_idx: int
    action: bool = True

@router.get("/user/{user_idx}", response_model=UserVodLogsResponse)
def get_user_vod_logs(
    user_idx: int,
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    특정 사용자의 VOD 시청 기록과 전체 에셋 정보를 조회 가능

    이 엔드포인트는 특정 사용자의 VOD 시청 기록을 가져오며,
    해당 사용자가 시청한 콘텐츠(에셋)에 대한 모든 상세 정보를 포함되어 있음

    (그래서 그런지 이거 로드되는데 시간이 좀 걸림)

    파라미터:

    user_idx: 시청 기록을 조회할 사용자 ID

    limit: 반환할 최대 시청 기록 수 (기본값: 50, 최대값: 100)

    offset: 페이징 처리를 위한 시작 위치 (기록을 건너뛸 수)


    반환값:

    시청한 콘텐츠의 전체 정보가 포함된 VOD 시청 기록 목록
    """
    # Check if user exists
    user_exists = db.query(db.query(VodLog).filter(VodLog.user_idx == user_idx).exists()).scalar()
    if not user_exists:
        raise HTTPException(status_code=404, detail=f"User with ID {user_idx} not found or has no viewing history")

    # 1. 서브쿼리: 각 asset_idx별로 가장 최근(strt_dt) log만 추출
    subq = (
        db.query(
            VodLog.asset_idx,
            func.max(VodLog.strt_dt).label('max_strt_dt')
        )
        .filter(VodLog.user_idx == user_idx)
        .group_by(VodLog.asset_idx)
        .subquery()
    )

    # 2. 메인 쿼리: 서브쿼리와 VodLog, Asset 조인
    logs_query = (
        db.query(VodLog, Asset)
        .join(subq, and_(
            VodLog.asset_idx == subq.c.asset_idx,
            VodLog.strt_dt == subq.c.max_strt_dt
        ))
        .join(Asset, VodLog.asset_idx == Asset.idx)
        .order_by(VodLog.strt_dt.desc())
        .offset(offset)
        .limit(limit)
    )

    logs_with_assets = []
    for log, asset in logs_query:
        log_dict = {
            # VodLog fields
            "log_idx": log.log_idx,
            "user_idx": log.user_idx, 
            "asset_idx": log.asset_idx,
            "strt_dt": log.strt_dt,
            "use_tms": log.use_tms,
            "feedback": log.feedback,
            # Asset fields
            "idx": asset.idx,
            "full_asset_id": asset.full_asset_id,
            "unique_asset_id": asset.unique_asset_id,
            "asset_nm": asset.asset_nm,
            "super_asset_nm": asset.super_asset_nm,
            "actr_disp": asset.actr_disp,
            "genre": asset.genre,
            "degree": asset.degree,
            "asset_time": asset.asset_time,
            "rlse_year": asset.rlse_year,
            "smry": asset.smry,
            "epsd_no": asset.epsd_no,
            "is_adult": asset.is_adult,
            "is_movie": asset.is_movie,
            "is_drama": asset.is_drama,
            "is_main": asset.is_main,
            "keyword": asset.keyword,
            "poster_path": asset.poster_path,
            "smry_shrt": asset.smry_shrt if hasattr(asset, "smry_shrt") else None
        }
        logs_with_assets.append(UserVodLogWithAsset(**log_dict))

    # 전체 중복 제거된 개수
    total_count = db.query(subq).count()

    return UserVodLogsResponse(
        count=total_count,
        logs=logs_with_assets
    )

@router.get("/logs/popular", tags=["logs"])
def get_popular_assets(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get most-watched VOD assets based on viewing logs.
    
    This endpoint aggregates VOD logs to find the most popular content
    within a specified time period.
    
    Parameters:
    - limit: Maximum number of assets to return (default: 10, max: 50)
    - days: Look back period in days (default: 30, max: 365)
    
    Returns:
    - List of popular assets with view counts
    """
    # Implementation for popular assets based on viewing logs
    # This would involve aggregating view counts from vod_log
    # and joining with assets table for details
    pass

@router.post("/mylist/")
def add_to_mylist(
    request: MyListAddRequest,
    db: Session = Depends(get_db)
):
    try:
        exists = db.query(MyList).filter_by(user_idx=request.user_idx, asset_idx=request.asset_idx).first()
        if exists:
            return {"message": "이미 찜한 콘텐츠입니다."}
        new_item = MyList(
            user_idx=request.user_idx,
            asset_idx=request.asset_idx,
            action=request.action,
            time_stamp=datetime.utcnow()
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"msg": "찜 등록 완료", "data": {
            "user_idx": new_item.user_idx,
            "asset_idx": new_item.asset_idx,
            "action": new_item.action,
            "time_stamp": new_item.time_stamp
        }}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB 저장 실패: {e}")

@router.delete("/mylist/")
def remove_from_mylist(
    request: MyListAddRequest,
    db: Session = Depends(get_db)
):
    try:
        item = db.query(MyList).filter_by(user_idx=request.user_idx, asset_idx=request.asset_idx).first()
        if not item:
            return {"message": "이미 찜 목록에 없습니다."}
        db.delete(item)
        db.commit()
        return {"message": "찜 목록에서 삭제되었습니다."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB 삭제 실패: {e}")

@router.get("/mylist/{user_idx}")
def get_mylist(
    user_idx: int,
    db: Session = Depends(get_db)
):
    items = db.query(MyList).filter_by(user_idx=user_idx, action=True).all()
    asset_ids = [item.asset_idx for item in items]
    return {"user_idx": user_idx, "mylist": asset_ids}
