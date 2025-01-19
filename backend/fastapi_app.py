from fastapi import FastAPI

fastapi_app = FastAPI()

@fastapi_app.get("/fastapi/health")
async def health_check():
    return {"status": "FastAPI is running"}

@fastapi_app.get("/fastapi/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}