from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from datetime import datetime
import os
from flask_cors import CORS
from models import db, Emergency
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Debug: Print environment variables
print("Environment Variables:")
print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_PASSWORD: {os.getenv('DB_PASSWORD')}")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
print(f"DB_NAME: {os.getenv('DB_NAME')}")

# Initialize Flask app
flask_app = Flask(__name__)
CORS(flask_app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure PostgreSQL database using environment variables
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')

flask_app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}?sslmode=require"
flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database with app
db.init_app(flask_app)

# Initialize FastAPI app
fastapi_app = FastAPI()

# Initialize Flask-SocketIO
socketio = SocketIO(flask_app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])

# Import and register routes
from routes import register_routes
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
    location = data.get('location')
    contact = data.get('contact')
    
    # Save message to database
    emergency = Emergency(
        sender=sender,
        message=message,
        location=location,
        contact=contact
    )
    db.session.add(emergency)
    db.session.commit()
    
    print(f"Received message from {sender}: {message}")
    # Broadcast the message to the dispatcher
    emit('message_from_client', data, broadcast=True)

if __name__ == "__main__":
    # Create database tables
    with flask_app.app_context():
        db.create_all()
    
    print("Starting Flask server...")
    socketio.run(flask_app, host="127.0.0.1", port=3001)
    print("Server started!")