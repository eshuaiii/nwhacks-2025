from flask import Flask
from flask_socketio import SocketIO

def create_app(config_class="app.config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    # Import and register routes, socket handlers, etc.
    from app.routes import register_routes
    from app.socket_handlers import register_socket_handlers

    register_routes(app)
    register_socket_handlers(socketio)

    return app, socketio