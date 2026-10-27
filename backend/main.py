import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import (
    auth,
    ideas,
    categories,
    notes,
    tasks,
    references,
    attachments,
    connections,
    ai,
    rediscover,
    search
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Idea Bubbles — an AI-powered creative universe for capturing, developing, and rediscovering ideas.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload storage for attachments
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under /api/v1
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(ideas.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(notes.router, prefix=api_prefix)
app.include_router(tasks.router, prefix=api_prefix)
app.include_router(references.router, prefix=api_prefix)
app.include_router(attachments.router, prefix=api_prefix)
app.include_router(connections.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(rediscover.router, prefix=api_prefix)
app.include_router(search.router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "ai_configured": settings.GEMINI_API_KEY != "" or settings.OPENAI_API_KEY != ""
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
