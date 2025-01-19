from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from models import db
from routes import register_routes
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
flask_app = Flask(__name__)

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

# Register routes
register_routes(flask_app, socketio)

if __name__ == "__main__":
    with flask_app.app_context():
        db.create_all()
    
    print("Starting Flask server...")
    socketio.run(flask_app, host="127.0.0.1", port=3001)
    print("Server started!")