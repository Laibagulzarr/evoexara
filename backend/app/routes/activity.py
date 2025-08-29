from fastapi import APIRouter

router = APIRouter()

@router.get("/activity")
def get_activity():
    return {"message": "Activity endpoint placeholder 🔔"}
