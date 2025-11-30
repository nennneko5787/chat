from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from socketio import ASGIApp

from services.sio import sio

app = FastAPI()
templates = Jinja2Templates("pages")

app.mount("/socket.io", ASGIApp(sio), "socket.io")
app.mount("/static", StaticFiles(directory="static"), "static")


@app.get("/")
def index(request: Request):
    return templates.TemplateResponse(request, "index.html")
