const socket = io("http://localhost:5000");

// Function to send location updates to the server
function sendLocationUpdate(latitude, longitude) {
    socket.emit("location_update", { latitude, longitude });
}

// Simulate periodic location updates
navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;
    sendLocationUpdate(latitude, longitude);
});