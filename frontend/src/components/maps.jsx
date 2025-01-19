import React, { useState, useEffect } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MyLocationMap = () => {
  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_API_KEY;
  const [viewport, setViewport] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 14,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);  // Track selected user
  const [route, setRoute] = useState(null);  // Route data

  // Sample list of users with their coordinates
  const users = [
    { id: 1, name: "User 1", latitude: 49.7750, longitude: -122.4195 },
    { id: 2, name: "User 2", latitude: 48.7760, longitude: -122.4180 },
    { id: 3, name: "User 3", latitude: 49.1770, longitude: -123.0175 },
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

  // Fetch route data from Mapbox Directions API
  const fetchRoute = (startLat, startLon, endLat, endLon) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&access_token=${mapboxAccessToken}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const routeData = data.routes[0].geometry.coordinates;
        setRoute(routeData);
      })
      .catch((error) => console.error("Error fetching route data:", error));
  };

  // Handle zoom in
  const zoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 20),
    }));
  };

  // Handle zoom out
  const zoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 0),
    }));
  };

  // Handle user selection
  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (userLocation) {
      fetchRoute(userLocation.latitude, userLocation.longitude, user.latitude, user.longitude);
      setViewport({
        ...viewport,
        latitude: user.latitude,
        longitude: user.longitude
      });
    }
  };

  // Handle exit (deselect user)
  const handleExitClick = () => {
    setSelectedUser(null);
    setRoute(null);  // Optionally clear the route
  };

  return (
    <div style={{ display: "flex", height: "80vh", width: "90vw" }}>  {/* Adjusting width and height */}
      <div style={{ width: "250px", padding: "20px", overflowY: "scroll", flex: "0 0 250px" }}>
        <h3>User List</h3>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            style={{
              padding: "10px",
              margin: "5px 0",
              cursor: "pointer",
              backgroundColor: selectedUser?.id === user.id ? "#cce7ff" : "#f0f0f0",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {user.name}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", flex: 1 }}>
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
                onClick={() => handleUserClick(user)}  // OnClick for user selection
                style={{
                  backgroundColor: "blue",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  border: "2px solid white",
                  cursor: "pointer",
                }}
              />
            </Marker>
          ))}

          {/* Display route if selected */}
          {route && (
            <Source
              type="geojson"
              data={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: route },
              }}
            >
              <Layer
                id="route"
                type="line"
                paint={{
                  "line-color": "#0000FF",
                  "line-width": 4,
                }}
              />
            </Source>
          )}
        </Map>

        {/* Zoom controls */}
        <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
          <button onClick={zoomIn} style={buttonStyle}>+</button>
          <button onClick={zoomOut} style={buttonStyle}>-</button>
        </div>

        {/* Navigation Panel */}
        {selectedUser && (
          <div style={panelStyle}>
            <h3>Navigation to {selectedUser.name}</h3>
            <button onClick={handleExitClick} style={exitButtonStyle}>Exit</button>
          </div>
        )}
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: "white",
  border: "1px solid #ccc",
  borderRadius: "50%",
  padding: "12px",
  margin: "5px",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "40px",
  height: "40px",
};

const exitButtonStyle = {
  backgroundColor: "#ff5c5c",
  border: "none",
  borderRadius: "4px",
  padding: "8px 12px",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
};

const panelStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  backgroundColor: "white",
  padding: "10px",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
  width: "250px",
};

export default MyLocationMap;
