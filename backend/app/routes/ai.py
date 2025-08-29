from fastapi import APIRouter

router = APIRouter()

@router.get("/ai")
def get_ai_response():
    return {"message": "AI endpoint placeholder 🤖"}
