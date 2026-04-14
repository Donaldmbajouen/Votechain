from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Mon premier hello word depuis fastApi"}


@app.get("/hello/{name}")
def say_hello(name:str):
    return {"message": f"Hello {name}"}