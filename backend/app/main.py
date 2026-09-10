from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.simulation import router as simulation_router
from app.api.copilot import router as copilot_router


app = FastAPI(
    title="QubitLabs API",
    description="AI-powered interactive quantum learning platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://qubitlabs-kappa.vercel.app",
        "https://qubitlabs.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(simulation_router)
app.include_router(copilot_router)

@app.get("/")
def root():
    return {
        "name": "QubitLabs API",
        "status": "online",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }