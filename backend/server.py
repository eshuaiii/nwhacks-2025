from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from models import db
from routes import register_routes
from dotenv import load_dotenv
import os
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from multiprocessing import Process

# Load environment variables
load_dotenv()

# Initialize Flask app
flask_app = Flask(__name__)

# Configure CORS
# CORS(flask_app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})
CORS(flask_app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:3001"],
            "methods": ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })

# Configure database
flask_app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(flask_app)

# Initialize SocketIO
socketio = SocketIO(flask_app, cors_allowed_origins="*", async_mode='gevent')

# Register routes
register_routes(flask_app, socketio)

# Function to run the Flask HTTP server
def run_http_server():
    http_server = pywsgi.WSGIServer(('0.0.0.0', 3001), flask_app, handler_class=WebSocketHandler)
    print("Starting HTTP server on port 3001...")
    http_server.serve_forever()

if __name__ == "__main__":
    with flask_app.app_context():
        db.create_all()

    # Run both servers in separate processes
    http_process = Process(target=run_http_server)

    # Start HTTP server
    http_process.start()

    # Wait for both processes to finish
    http_process.join()
