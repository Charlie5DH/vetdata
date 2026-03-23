from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.routes import router

app = FastAPI(
    title="Veterinary Treatment Management API",
    description="API for managing veterinary treatment templates, patients, and medical records",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc alternative documentation
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Veterinary Treatment Management API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
