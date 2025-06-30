from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
import pandas as pd
from ...core.services.csv_data_loader import csv_loader

router = APIRouter()

@router.get("/csv/files")
async def get_available_csv_files():
    """사용 가능한 CSV 파일 목록을 반환합니다."""
    try:
        files = csv_loader.get_available_files()
        return {"available_files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting file list: {str(e)}")

@router.get("/csv/info/{filename}")
async def get_csv_file_info(filename: str):
    """CSV 파일의 정보를 반환합니다."""
    try:
        info = csv_loader.get_file_info(filename)
        if "error" in info:
            raise HTTPException(status_code=404, detail=info["error"])
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting file info: {str(e)}")


@router.delete("/csv/cache")
async def clear_csv_cache(filename: Optional[str] = None):
    """CSV 캐시를 정리합니다."""
    try:
        csv_loader.clear_cache(filename)
        message = f"Cleared cache for {filename}" if filename else "Cleared all cached data"
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}") 