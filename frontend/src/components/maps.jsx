import React, { useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    zoom: 10,
  });

  const mapboxAccessToken = process.env.MAPBOX_API_KEY; // Replace with your token

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <Map
        {...viewport}
        style={{ width: "100%", height: "100%" }}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v11" // You can use other styles
        onMove={(evt) => setViewport(evt.viewState)}
      >
        {/* Example Marker */}
        <Marker latitude={37.7749} longitude={-122.4194}>
          <div style={{ color: "red", fontWeight: "bold" }}>📍</div>
        </Marker>
      </Map>
    </div>
  );
};

export default MapboxMap;
