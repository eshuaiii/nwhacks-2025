import React, { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MyLocationMap = () => {
  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_API_KEY; // Ensure your token is set up
  const [viewport, setViewport] = useState({
    latitude: 37.7749, // Default location (San Francisco)
    longitude: -122.4194,
    zoom: 14, // Initial zoom level
  });

  const [userLocation, setUserLocation] = useState(null);

  // Sample list of users with their coordinates
  const users = [
    { id: 1, name: "User 1", latitude: 37.7750, longitude: -122.4195 },
    { id: 2, name: "User 2", latitude: 37.7760, longitude: -122.4180 },
    { id: 3, name: "User 3", latitude: 37.7770, longitude: -122.4175 },
    // Add more users as needed
  ];

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  }, []);

  // Handle zoom in
  const zoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 20), // Max zoom level is 20
    }));
  };

  // Handle zoom out
  const zoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 0), // Min zoom level is 0
    }));
  };

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Marker for the user's location */}
        {userLocation && (
          <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
            <div
              style={{
                backgroundColor: "red",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                border: "2px solid white",
              }}
            />
          </Marker>
        )}

        {/* Markers for other users */}
        {users.map((user) => (
          <Marker key={user.id} latitude={user.latitude} longitude={user.longitude}>
            <div
              style={{
                backgroundColor: "blue",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                border: "2px solid white",
              }}
            />
          </Marker>
        ))}
      </Map>

      {/* Zoom controls */}
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <button onClick={zoomIn} style={buttonStyle}>+</button>
        <button onClick={zoomOut} style={buttonStyle}>-</button>
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: "white",
  border: "1px solid #ccc",
  borderRadius: "50%",
  padding: "12px",  // Increased padding to make the button rounder
  margin: "5px",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "40px",  // Explicit width and height to ensure round shape
  height: "40px", // Explicit width and height to ensure round shape
};

export default MyLocationMap;
