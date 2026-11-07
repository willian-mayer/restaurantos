
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables before importing settings.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .routers.branches import router as branches_router
from .routers.restaurants import router as restaurants_router


settings = get_settings()

cors_origins = [
    origin.strip().rstrip("/")
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

app = FastAPI(
    title="RestaurantOS API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(branches_router)
app.include_router(restaurants_router)


@app.get("/health")
def health():
    return {"status": "ok"}
