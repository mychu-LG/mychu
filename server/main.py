from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse,HTMLResponse
import os
import logging
import sys

 #방금 추가 (성인물..)
from fastapi.responses import StreamingResponse
import requests

# 라우터 import
from server.api.routes.asset import router as asset_router  
from server.api.routes.search import router as search_router
from server.api.routes.user import router as user_router
from server.api.routes.recommendation_test import router as rec_test_router
from server.api.routes.recommendations import router as rec_router
from server.api.routes.log import router as log_router
from server.api.routes.recommendation_hybrid import router as rec_hybrid_router
from server.api.routes.emotion_recommendation import router as emotion_rec_router
#from server.api.routes.adult_recommendation import router as adult_rec_router
from server.api.routes.today_recommendation import router as today_rec_router
from server.api.routes.csv_data import router as csv_data_router
from server.api.routes.product import router as product_router



# 설정 및 초기화
from server.config.settings import CORS_ORIGINS
from server.core.database import init_db
from server.core.firebase import init_firebase


# 앱 생성
app = FastAPI()

# Firebase 초기화
router = APIRouter()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000", "http://localhost", "http://react:5173", "http://fastapi:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_PUBLIC_DIR = os.path.join(BASE_DIR, "client", "public")
CLIENT_SRC_DIR = os.path.join(BASE_DIR, "client", "src")
CLIENT_DIR = os.path.join(BASE_DIR, "client")

# 경로 디버깅 로그
logger = logging.getLogger("uvicorn")
logger.info(f"BASE_DIR: {BASE_DIR}")
logger.info(f"CLIENT_PUBLIC_DIR: {CLIENT_PUBLIC_DIR}")
logger.info(f"CLIENT_SRC_DIR: {CLIENT_SRC_DIR}")

# 템플릿 설정
templates = Jinja2Templates(directory=CLIENT_PUBLIC_DIR)

# 정적 파일 서빙 - 절대 경로 사용
app.mount("/static", StaticFiles(directory=CLIENT_PUBLIC_DIR), name="static")
app.mount("/src", StaticFiles(directory=CLIENT_SRC_DIR), name="src")
app.mount("/client", StaticFiles(directory=CLIENT_DIR), name="client")
app.mount("/components", StaticFiles(directory="client/public/components"), name="components")

# React 컴포넌트 서빙
REACT_DIST_DIR = os.path.join(BASE_DIR, "client-react", "dist")
if os.path.exists(REACT_DIST_DIR):
    logger.info(f"React build directory found at: {REACT_DIST_DIR}")
    app.mount("/react", StaticFiles(directory=REACT_DIST_DIR), name="react")
else:
    logger.warning(f"React build directory not found at: {REACT_DIST_DIR}")

# 정적 파일 존재 여부 확인 및 로깅
css_path = os.path.join(CLIENT_SRC_DIR, "styles", "mylist.css")
if os.path.exists(css_path):
    logger.info(f"CSS file found at: {css_path}")
else:
    logger.error(f"CSS file NOT found at: {css_path}")

# 라우터 등록
app.include_router(user_router,       prefix="/users",  tags=["users"])
app.include_router(asset_router,      prefix="/assets", tags=["assets"])
app.include_router(log_router,        prefix="/logs",   tags=["logs"])
app.include_router(search_router,     prefix="/search", tags=["search"])
app.include_router(rec_test_router,   prefix="",        tags=["recommendation"])
app.include_router(rec_hybrid_router, prefix="",        tags=["recommendation"])
app.include_router(emotion_rec_router, prefix="",        tags=["emotion_recommendation"])
app.include_router(rec_router,        prefix="",        tags=["recommendations"])
app.include_router(today_rec_router, prefix="",        tags=["recommendation"])
app.include_router(csv_data_router,   prefix="",        tags=["csv-data"])
app.include_router(product_router,    prefix="",        tags=["products"])

# 로거 설정
logger = logging.getLogger("uvicorn")

 
# 추가 (성인관 이미지 로드)
@app.get("/image-proxy")
def image_proxy(url: str):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0'  # 일부 서버는 이게 없으면 막음
        }
        res = requests.get(url, headers=headers, stream=True)
        if res.status_code != 200:
            raise Exception("이미지 요청 실패")
        return StreamingResponse(res.raw, media_type=res.headers.get("Content-Type", "image/png"))
    except Exception as e:
        print(f"프록시 에러: {e}")
        raise

# 서버 시작 시 초기화 및 디버깅 로그 출력
@app.on_event("startup")
async def startup_event():
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Working directory: {os.getcwd()}")
    logger.info(f"Template directory: {CLIENT_PUBLIC_DIR}")
    logger.info(f"Templates available: {os.listdir(CLIENT_PUBLIC_DIR)}")
    init_db()
    init_firebase()


# 추가: 시작 시 인기 콘텐츠에 대한 추천 결과 미리 로드
@app.on_event("startup")
async def initialize_recommender():
    """Initialize recommendation system at application startup."""
    import logging
    from server.core.database import SessionLocal
    from server.models.asset import Asset
    from server.core.services.recommender_singleton import recommender
    
    logger = logging.getLogger("uvicorn")
    logger.info("Initializing recommender system at startup")
    
    try:
        # Create DB session
        db = SessionLocal()
          # Fetch only required fields for all assets (is_main filter 제거)
        main_assets = db.query(
            Asset.idx, Asset.asset_nm, Asset.unique_asset_id, 
            Asset.super_asset_nm, Asset.is_adult, Asset.is_movie,
            Asset.is_drama, Asset.is_main, Asset.poster_path
        ).all()
        
        logger.info(f"Loaded {len(main_assets)} total assets for recommendation system")
        
        # Initialize content mapping in singleton
        if not recommender.is_content_mapping_initialized:
            recommender.initialize_content_mapping(main_assets)
            logger.info("Content mapping initialized in recommender singleton")
        
        db.close()
        logger.info("Recommender system successfully initialized at startup")
        
    except Exception as e:
        logger.error(f"Error initializing recommender: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())


# 페이지 라우트
@app.get("/")
async def read_main(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login")
async def read_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/index")
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/main")
async def read_main(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/drama")
async def read_drama(request: Request):
    return templates.TemplateResponse("drama.html", {"request": request})

@app.get("/movie")
async def read_movie(request: Request):
    return templates.TemplateResponse("movie.html", {"request": request})

@app.get("/api/user/mylist")
async def get_my_list(request: Request):
    return templates.TemplateResponse("mylist.html", {"request": request})

@app.get("/rating")
async def read_rating(request: Request):
    return templates.TemplateResponse("rating.html", {"request": request})

@app.get("/adult")
async def read_adult(request: Request):
    return templates.TemplateResponse("adult.html", {"request": request})

@app.get("/search", response_class=HTMLResponse)
async def read_search(request: Request):
    return templates.TemplateResponse("search.html", {"request": request})

@app.get("/contents", response_class=HTMLResponse)
async def read_contents(request: Request):
    return templates.TemplateResponse("contents.html", {"request": request})

@app.get("/account")
async def read_contents(request: Request):
    return templates.TemplateResponse("account.html", {"request": request})

@app.get("/contents_test")
async def read_contents_test(request: Request):
    return templates.TemplateResponse("contents_test.html", {"request": request})

# React 앱 라우팅을 위한 경로 추가 (React Router 지원)
@app.get("/react-app/{full_path:path}", response_class=HTMLResponse)
async def serve_react_routes(request: Request, full_path: str = ""):
    """
    React Router를 사용하는 SPA에서 클라이언트 사이드 라우팅을 지원합니다.
    모든 경로에 대해 React 앱의 index.html을 제공합니다.
    """
    REACT_DIST_DIR = os.path.join(BASE_DIR, "client-react", "dist")
    index_path = os.path.join(REACT_DIST_DIR, "index.html")
    
    if os.path.exists(index_path):
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                html_content = f.read()
            return HTMLResponse(content=html_content)
        except Exception as e:
            logger.error(f"React 앱 제공 오류: {str(e)}")
            return JSONResponse(status_code=500, content={"error": "React 앱을 제공할 수 없습니다"})
    else:
        logger.error(f"React 빌드를 찾을 수 없습니다: {index_path}")
        return JSONResponse(status_code=404, content={"error": "React 빌드를 찾을 수 없습니다"})

# 템플릿 및 정적 파일 디버깅용 라우터
@app.get("/debug-templates")
async def debug_templates():
    try:
        templates_list = os.listdir(CLIENT_PUBLIC_DIR)
        return {
            "working_directory": os.getcwd(),
            "template_directory": CLIENT_PUBLIC_DIR,
            "available_templates": templates_list,
            "template_exists": "mylist.html" in templates_list,
            "absolute_path": os.path.join(CLIENT_PUBLIC_DIR, "mylist.html")
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug-static")
async def debug_static():
    try:
        css_path = os.path.join(CLIENT_SRC_DIR, "styles", "mylist.css")
        js_path = os.path.join(CLIENT_SRC_DIR, "pages", "mylist.js")
        config_path = os.path.join(CLIENT_SRC_DIR, "firebase", "config.js")
        
        return {
            "base_dir": BASE_DIR,
            "client_src_dir": CLIENT_SRC_DIR,
            "css_exists": os.path.exists(css_path),
            "css_path": css_path,
            "js_exists": os.path.exists(js_path),
            "js_path": js_path,
            "config_exists": os.path.exists(config_path),
            "config_path": config_path,
            "static_mounts": [
                {"route": "/static", "directory": CLIENT_PUBLIC_DIR},
                {"route": "/src", "directory": CLIENT_SRC_DIR},
                {"route": "/client", "directory": CLIENT_DIR}
            ]
        }
    except Exception as e:
        return {"error": str(e)}