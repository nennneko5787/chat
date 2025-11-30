from fastapi import FastAPI, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from socketio import ASGIApp

from services.sio import sidToName, sio

app = FastAPI()
templates = Jinja2Templates("pages")

app.mount("/socket.io", ASGIApp(sio), "socket.io")
app.mount("/static", StaticFiles(directory="static"), "static")


@app.get("/")
def index(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/check")
def nameCheck(name: str = Query()):
    users = []

    for username in sidToName.values():
        users.append(username)

    return {"available": name not in users}
