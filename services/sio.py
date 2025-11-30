from typing import Any, Dict

from socketio import AsyncServer
from socketio.exceptions import ConnectionRefusedError

sio = AsyncServer(async_mode="asgi")

sidToName: Dict[str, str] = {}
nameToSid: Dict[str, str] = {}


async def updateUserList():
    users = []

    for sid, name in sidToName.items():
        users.append({"sid": sid, "name": name})

    await sio.emit("updateUserList", users)


@sio.event
async def connect(sid: str, environ: Dict[str, Any], auth: Dict[str, Any]):
    if not auth.get("name") or not isinstance(auth["name"], str):
        raise ConnectionRefusedError()

    users = []

    for username in sidToName.values():
        users.append(username)

    name = auth["name"]

    if name in users:
        raise ConnectionRefusedError()

    sidToName[sid] = name
    nameToSid[name] = sid

    await sio.emit("join", {"sid": sid, "name": name})

    await updateUserList()


@sio.event
async def chatMessage(sid: str, message: str):
    name = sidToName[sid]

    await sio.emit("chatMessage", {"sid": sid, "name": name, "message": message})


@sio.event
async def disconnect(sid: str):
    name = sidToName[sid]

    del nameToSid[name]
    del sidToName[sid]

    await sio.emit("quit", {"sid": sid, "name": name})

    await updateUserList()
