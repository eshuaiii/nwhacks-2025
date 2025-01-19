from flask_socketio import emit
from threading import Lock

# Lock for thread-safe access to shared data
locations_lock = Lock()

# In-memory store for client locations
client_locations = {}

def register_socket_handlers(socketio):
    @socketio.on("connect")
    def handle_connect():
        print("Client connected")

    @socketio.on("disconnect")
    def handle_disconnect():
        print("Client disconnected")

    @socketio.on("location_update")
    def handle_location_update(data):
        """
        Handles incoming location updates from clients.
        """
        with locations_lock:
            client_locations[data['client_id']] = data['location']

        # Broadcast updates to all connected clients
        socketio.emit("update_dispatcher", client_locations)