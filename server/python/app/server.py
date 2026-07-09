import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.main import router as ai_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered body measurement processing service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "bodyfitai-python-ai"}


if __name__ == "__main__":
    uvicorn.run("app.server:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
