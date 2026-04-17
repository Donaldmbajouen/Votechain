import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers.auth import router as auth_router
from routers.campaigns import router as campaigns_router
from routers.votes import router as votes_router
from socket_manager import sio

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoteChain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(campaigns_router)
app.include_router(votes_router)


@app.get("/")
def read_root():
    return {"message": "VoteChain API is running"}


# Mount Socket.IO as ASGI sub-app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
