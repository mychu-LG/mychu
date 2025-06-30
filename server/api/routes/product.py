from fastapi import APIRouter, HTTPException
from typing import Optional
from fastapi import Query
from ...core.services.csv_data_loader import csv_loader
import pandas as pd

router = APIRouter()

@router.get("/products")
async def get_products():
    """
    전체 제품 목록을 반환합니다.
    """
    try:
        df = csv_loader.load_csv('product.csv')
        return {
            "total_count": len(df),
            "products": df.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading product data: {str(e)}")

@router.get("/products/random")
async def get_random_products():
    """
    제품 목록에서 랜덤으로 10개를 반환합니다.
    """
    try:
        df = csv_loader.load_csv('product.csv')
        sample_df = df.sample(n=10) if len(df) >= 10 else df
        return {
            "count": len(sample_df),
            "products": sample_df.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading random products: {str(e)}")