from flask import Flask
from flask_socketio import SocketIO, emit
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from werkzeug.middleware.dispatcher import DispatcherMiddleware

# Initialize Flask app
flask_app = Flask(__name__)

# Initialize FastAPI app
fastapi_app = FastAPI()

# Initialize Flask-SocketIO
socketio = SocketIO(flask_app, cors_allowed_origins="*")

# Register Flask routes and socket handlers
def register_routes(app):
    @app.route("/")
    def index():
        return "ok"

register_routes(flask_app)

# Combine Flask and FastAPI using DispatcherMiddleware
flask_app.wsgi_app = DispatcherMiddleware(flask_app.wsgi_app, {
    "/fastapi": WSGIMiddleware(fastapi_app),
})

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

@socketio.on('message_to_dispatcher')
def handle_message_to_dispatcher(data):
    sender = data.get('sender')
    message = data.get('message')
    print(f"Received message from {sender}: {message}")
    # Broadcast the message to the dispatcher
    emit('message_from_client', data, broadcast=True)

if __name__ == "__main__":
    print("Starting Flask server...")
    socketio.run(flask_app, host="127.0.0.1", port=3000)
    print("Server started!")