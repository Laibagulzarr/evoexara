from fastapi import APIRouter

router = APIRouter()

@router.get("/map")
def get_map():
    return {"spots": ["Dubai Mall", "Burj Khalifa", "La Mer"]}
