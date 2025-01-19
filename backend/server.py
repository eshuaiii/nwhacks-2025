from flask import Flask
from flask_socketio import SocketIO, emit
from app.routes import register_routes
import json
from flask_cors import CORS
from models import db
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
flask_app = Flask(__name__, template_folder="app/templates")

# Configure CORS
CORS(flask_app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure database
db_config = {
    'username': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'name': os.getenv('DB_NAME')
}

# Verify all required environment variables are present
for key, value in db_config.items():
    if value is None:
        raise ValueError(f"Missing required environment variable: DB_{key.upper()}")

flask_app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_config['username']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['name']}"
flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(flask_app)
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
    print(f"Received data: {data}")

    sender = data.get('sender')
    message = data.get('message')
    print(f"Extracted sender: {sender}")
    print(f"Extracted message: {message}")

    # Parse the message to extract latitude and longitude
    try:
        lat_part, lon_part = message.split(", ")
        lat = lat_part.split(": ")[1]
        lon = lon_part.split(": ")[1]
    except (IndexError, ValueError) as e:
        print(f"Error parsing message: {e}")
        return

    # Format the data into JSON
    formatted_data = json.dumps({
        "sender": sender,
        "latitude": lat,
        "longitude": lon
    })

    # Broadcast the message to the dispatcher
    emit('message_from_client', formatted_data, broadcast=True)

if __name__ == "__main__":
    with flask_app.app_context():
        db.create_all()
    
    print("Starting Flask server...")
<<<<<<< HEAD
    socketio.run(flask_app, host="127.0.0.1", port=4287)
=======
    socketio.run(flask_app, host="127.0.0.1", port=3001)
>>>>>>> nickBranch
    print("Server started!")