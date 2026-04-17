import socketio

# Async Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)


@sio.event
async def connect(sid, environ):
    print(f"[WS] Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"[WS] Client disconnected: {sid}")


@sio.event
async def join_campaign(sid, data):
    """Client joins a campaign room to receive live results."""
    room = f"campaign_{data.get('campaign_id')}"
    await sio.enter_room(sid, room)
    print(f"[WS] {sid} joined room {room}")


@sio.event
async def leave_campaign(sid, data):
    room = f"campaign_{data.get('campaign_id')}"
    await sio.leave_room(sid, room)


async def emit_vote_update(campaign_id: int, results: dict):
    """Broadcast updated results to all clients watching this campaign."""
    room = f"campaign_{campaign_id}"
    await sio.emit("vote_update", results, room=room)
