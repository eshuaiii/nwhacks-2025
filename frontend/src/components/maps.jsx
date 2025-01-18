import React, { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MyLocationMap = () => {
  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_API_KEY; // Ensure your token is set up
  const [viewport, setViewport] = useState({
    latitude: 37.7749, // Default location (San Francisco)
    longitude: -122.4194,
    zoom: 14,
  });

  const [userLocation, setUserLocation] = useState(null);

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

  return (
    <Map
      {...viewport}
      onMove={(evt) => setViewport(evt.viewState)}
      mapboxAccessToken={mapboxAccessToken}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      style={{ width: "100%", height: "500px" }}
    >
      {/* Marker for the user's location */}
      {userLocation && (
        <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
          <div style={{ color: "red", fontSize: "24px" }}>📍</div>
        </Marker>
      )}
    </Map>
  );
};

export default MyLocationMap;
