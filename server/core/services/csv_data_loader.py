import pandas as pd
import logging
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger("uvicorn")

# 데이터 디렉토리 경로
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# 디렉토리가 없으면 생성
if not DATA_DIR.exists():
    logger.info(f"Creating data directory at {DATA_DIR}")
    DATA_DIR.mkdir(exist_ok=True)

class CSVDataLoader:
    """
    CSV 파일을 로드하고 관리하는 싱글톤 클래스
    """
    _instance = None
    _data_cache = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CSVDataLoader, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialized = True
            logger.info("Initializing CSVDataLoader")
    
    def load_csv(self, filename: str, use_cache: bool = True) -> pd.DataFrame:
        """
        CSV 파일을 로드합니다.
        
        Args:
            filename: CSV 파일명 (예: 'assets.csv')
            use_cache: 캐시 사용 여부 (기본값: True)
            
        Returns:
            pandas DataFrame
        """
        file_path = DATA_DIR / filename
        
        # 캐시된 데이터가 있으면 반환
        if use_cache and filename in self._data_cache:
            logger.info(f"Returning cached data for {filename}")
            return self._data_cache[filename]
        
        if not file_path.exists():
            logger.error(f"CSV file not found: {file_path}")
            raise FileNotFoundError(f"CSV file not found: {file_path}")
        
        try:
            logger.info(f"Loading CSV file: {file_path}")
            df = pd.read_csv(file_path)
            
            if use_cache:
                self._data_cache[filename] = df
                logger.info(f"Cached {filename} with shape {df.shape}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading CSV file {filename}: {str(e)}")
            raise
    
    def get_assets_data(self) -> pd.DataFrame:
        """assets.csv 파일을 로드합니다."""
        return self.load_csv('assets.csv')
    
    def get_users_data(self) -> pd.DataFrame:
        """users.csv 파일을 로드합니다."""
        return self.load_csv('users.csv')
    
    def get_ratings_data(self) -> pd.DataFrame:
        """ratings.csv 파일을 로드합니다."""
        return self.load_csv('ratings.csv')
    
    def clear_cache(self, filename: Optional[str] = None):
        """
        캐시를 정리합니다.
        
        Args:
            filename: 특정 파일의 캐시만 정리 (None이면 전체 정리)
        """
        if filename:
            if filename in self._data_cache:
                del self._data_cache[filename]
                logger.info(f"Cleared cache for {filename}")
        else:
            self._data_cache.clear()
            logger.info("Cleared all cached data")
    
    def reload_csv(self, filename: str) -> pd.DataFrame:
        """
        CSV 파일을 다시 로드합니다 (캐시 무시).
        
        Args:
            filename: CSV 파일명
            
        Returns:
            pandas DataFrame
        """
        # 캐시에서 제거
        if filename in self._data_cache:
            del self._data_cache[filename]
        
        # 다시 로드
        return self.load_csv(filename, use_cache=True)
    
    def get_available_files(self) -> List[str]:
        """사용 가능한 CSV 파일 목록을 반환합니다."""
        csv_files = list(DATA_DIR.glob("*.csv"))
        return [f.name for f in csv_files]
    
    def get_file_info(self, filename: str) -> Dict:
        """
        CSV 파일의 정보를 반환합니다.
        
        Args:
            filename: CSV 파일명
            
        Returns:
            파일 정보 딕셔너리
        """
        file_path = DATA_DIR / filename
        
        if not file_path.exists():
            return {"error": "File not found"}
        
        try:
            df = self.load_csv(filename)
            return {
                "filename": filename,
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "file_size_mb": file_path.stat().st_size / (1024 * 1024),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024)
            }
        except Exception as e:
            return {"error": str(e)}

# 전역 인스턴스
csv_loader = CSVDataLoader() 