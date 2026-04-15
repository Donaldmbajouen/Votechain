from fastapi import FastAPI

from database import Base, engine
from routers.auth import router as auth_router
from routers.campaigns import router as campaigns_router
from routers.votes import router as votes_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoteChain API", version="1.0.0")

app.include_router(auth_router)
app.include_router(campaigns_router)
app.include_router(votes_router)


@app.get("/")
def read_root():
    return {"message": "VoteChain API is running"}