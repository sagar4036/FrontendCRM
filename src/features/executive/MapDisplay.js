import React, { useEffect, useState } from "react";

function MapDisplay() {
  const [mapSrc, setMapSrc] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Generate OpenStreetMap URL with user's location
          const url = `https://www.openstreetmap.org/export/embed.html?bbox=${
            userLng - 0.02
          },${userLat - 0.02},${userLng + 0.02},${userLat + 0.02}&layer=mapnik&marker=${userLat},${userLng}`;
          
          setMapSrc(url);
        },
        (error) => {
          console.error("Error fetching location: ", error);

          // Default to India Map if location is not accessible
          setMapSrc(
            "https://www.openstreetmap.org/export/embed.html?bbox=68.1767,8.0883,97.3623,37.0902&layer=mapnik&marker=20.5937,78.9629"
          );
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className="map-container">
      <iframe
        id="embedded-map"
        width="100%"
        height="200"
        style={{ borderRadius: "8px", border: "0" }}
        allowFullScreen
        loading="lazy"
        src={mapSrc}
      ></iframe>
    </div>
  );
}

export default MapDisplay;
