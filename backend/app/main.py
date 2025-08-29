from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import map, ai, profile, activity

app = FastAPI()

# Allow frontend (localhost:5173) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(map.router)
app.include_router(ai.router)
app.include_router(profile.router)
app.include_router(activity.router)

@app.get("/")
def root():
    return {"message": "Hello from EvoExara backend 👋"}
