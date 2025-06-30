# filepath: server/api/routes/today_recommendation.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from server.core.database import get_db
from server.models.asset import Asset
from server.models.user import RecList
from server.api.schemas.recommendation import RecommendationItem, RecommendationResponse

router = APIRouter(
    prefix="/recommendation/today",
    tags=["recommendation"]
)

@router.get("/personalized/{user_id}", response_model=RecommendationResponse)
def get_personalized_recommendations(
    user_id: int,
    n: int = Query(10, description="추천 개수"),
    db: Session = Depends(get_db),
):
    """
    개인화 추천 리스트 - rec_list 기반
    """
    query = (
        db.query(Asset)
        .join(RecList, Asset.idx == RecList.asset_idx)
        .filter(RecList.user_idx == user_id)
        .order_by(RecList.rnk.asc())
        .limit(n)
    )

    rows = query.all()
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
            print(f"❌ Error while building item: {e}")
            continue

    return RecommendationResponse(items=items)


from fastapi import APIRouter
import csv
import os
from fastapi.responses import JSONResponse

router = APIRouter()

from fastapi import APIRouter, Query
import csv
import os
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/my-data")
async def read_my_data(user_idx: int = Query(..., description="사용자 idx")):
    # 현재 파일 위치 (예: server/api/routes)
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 상대경로 조합
    csv_path = os.path.join(current_dir, "../../core/data/three_users.csv")
    csv_path = os.path.normpath(csv_path)

    data = []
    try:
        with open(csv_path, newline="", encoding="utf-8-sig") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # ✅ user_idx 필터링
                if int(row["user_id"]) == user_idx:
                    data.append(row)
        return JSONResponse(content=data)

    except Exception as e:
        print(f"CSV 읽기 오류: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
