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

@router.get("/csv/data/{filename}")
async def get_csv_data(
    filename: str, 
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    columns: Optional[str] = None
):
    """
    CSV 파일의 데이터를 반환합니다.
    
    Args:
        filename: CSV 파일명
        limit: 반환할 행 수 (기본값: 100)
        offset: 시작 위치 (기본값: 0)
        columns: 쉼표로 구분된 컬럼명 (기본값: 모든 컬럼)
    """
    try:
        df = csv_loader.load_csv(filename)
        
        # 특정 컬럼만 선택
        if columns:
            column_list = [col.strip() for col in columns.split(",")]
            available_columns = [col for col in column_list if col in df.columns]
            if available_columns:
                df = df[available_columns]
        
        # 페이지네이션
        total_rows = len(df)
        df = df.iloc[offset:offset + limit]
        
        return {
            "filename": filename,
            "total_rows": total_rows,
            "returned_rows": len(df),
            "offset": offset,
            "limit": limit,
            "data": df.to_dict('records')
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"CSV file '{filename}' not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading CSV data: {str(e)}")

@router.get("/csv/assets")
async def get_assets_data(
    limit: Optional[int] = 50,
    genre: Optional[str] = None,
    is_adult: Optional[bool] = None,
    is_movie: Optional[bool] = None
):
    """
    assets.csv 파일에서 필터링된 데이터를 반환합니다.
    """
    try:
        df = csv_loader.get_assets_data()
        
        # 필터링
        if genre:
            df = df[df['genre'].str.contains(genre, case=False, na=False)]
        
        if is_adult is not None:
            df = df[df['is_adult'] == is_adult]
            
        if is_movie is not None:
            df = df[df['is_movie'] == is_movie]
        
        # 정렬 및 제한
        df = df.head(limit)
        
        return {
            "total_found": len(df),
            "limit": limit,
            "filters": {
                "genre": genre,
                "is_adult": is_adult,
                "is_movie": is_movie
            },
            "data": df.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading assets data: {str(e)}")

@router.get("/csv/search")
async def search_csv_data(
    filename: str,
    query: str,
    column: Optional[str] = None,
    limit: Optional[int] = 50
):
    """
    CSV 파일에서 텍스트 검색을 수행합니다.
    
    Args:
        filename: CSV 파일명
        query: 검색어
        column: 검색할 컬럼명 (None이면 모든 텍스트 컬럼에서 검색)
        limit: 반환할 결과 수
    """
    try:
        df = csv_loader.load_csv(filename)
        
        # 검색 로직
        if column:
            if column not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{column}' not found")
            mask = df[column].astype(str).str.contains(query, case=False, na=False)
        else:
            # 모든 텍스트 컬럼에서 검색
            text_columns = df.select_dtypes(include=['object']).columns
            mask = pd.Series([False] * len(df))
            for col in text_columns:
                mask |= df[col].astype(str).str.contains(query, case=False, na=False)
        
        results = df[mask].head(limit)
        
        return {
            "filename": filename,
            "query": query,
            "column": column,
            "total_found": len(results),
            "limit": limit,
            "data": results.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching CSV data: {str(e)}")

@router.post("/csv/reload/{filename}")
async def reload_csv_file(filename: str):
    """CSV 파일을 다시 로드합니다."""
    try:
        df = csv_loader.reload_csv(filename)
        return {
            "message": f"Successfully reloaded {filename}",
            "rows": len(df),
            "columns": len(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reloading CSV file: {str(e)}")

@router.delete("/csv/cache")
async def clear_csv_cache(filename: Optional[str] = None):
    """CSV 캐시를 정리합니다."""
    try:
        csv_loader.clear_cache(filename)
        message = f"Cleared cache for {filename}" if filename else "Cleared all cached data"
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}") 