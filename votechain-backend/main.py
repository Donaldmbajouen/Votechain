from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "VoteChain API is running 🚀"}