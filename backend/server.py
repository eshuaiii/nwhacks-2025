from flask import Flask
from flask_socketio import SocketIO, emit
from app.routes import register_routes

# Initialize Flask app
flask_app = Flask(__name__, template_folder="app/templates")

# Initialize Flask-SocketIO
socketio = SocketIO(flask_app, cors_allowed_origins="*")

# Register Flask routes
register_routes(flask_app)

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
    socketio.run(flask_app, host="127.0.0.1", port=4287)
    print("Server started!")