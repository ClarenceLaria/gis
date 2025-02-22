"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

// Define the structure for a city
interface City {
  name: string;
  lat: number;
  lng: number;
  rank: number;
  crimes: number;
}

// List of top 20 high-crime cities
const cities: City[] = [
  { name: "Detroit, MI", lat: 42.3314, lng: -83.0458, rank: 1, crimes: 5000 },
  { name: "Memphis, TN", lat: 35.1495, lng: -90.0490, rank: 2, crimes: 4800 },
  { name: "Birmingham, AL", lat: 33.5186, lng: -86.8104, rank: 3, crimes: 4600 },
  { name: "St. Louis, MO", lat: 38.6270, lng: -90.1994, rank: 4, crimes: 4500 },
  { name: "Little Rock, AR", lat: 34.7465, lng: -92.2896, rank: 5, crimes: 4400 },
  { name: "Cleveland, OH", lat: 41.4993, lng: -81.6944, rank: 6, crimes: 4300 },
  { name: "Kansas City, MO", lat: 39.0997, lng: -94.5786, rank: 7, crimes: 4200 },
  { name: "New Orleans, LA", lat: 29.9511, lng: -90.0715, rank: 8, crimes: 4100 },
  { name: "Tijuana, Mexico", lat: 32.5149, lng: -117.0382, rank: 9, crimes: 4000 },
  { name: "Acapulco, Mexico", lat: 16.8531, lng: -99.8237, rank: 10, crimes: 3900 },
  { name: "Ciudad Obregón, Mexico", lat: 27.4914, lng: -109.9388, rank: 11, crimes: 3800 },
  { name: "Celaya, Mexico", lat: 20.5361, lng: -100.8153, rank: 12, crimes: 3700 },
  { name: "Colima, Mexico", lat: 19.2433, lng: -103.7253, rank: 13, crimes: 3600 },
  { name: "Manzanillo, Mexico", lat: 19.0523, lng: -104.3125, rank: 14, crimes: 3500 },
  { name: "Tlaquepaque, Mexico", lat: 20.6544, lng: -103.2694, rank: 15, crimes: 3400 },
  { name: "Ciudad Juárez, Mexico", lat: 31.6904, lng: -106.4245, rank: 16, crimes: 3300 },
  { name: "Chihuahua, Mexico", lat: 28.6320, lng: -106.0691, rank: 17, crimes: 3200 },
  { name: "Irapuato, Mexico", lat: 20.6767, lng: -101.3634, rank: 18, crimes: 3100 },
  { name: "Zacatecas, Mexico", lat: 22.7709, lng: -102.5833, rank: 19, crimes: 3000 },
  { name: "Cancún, Mexico", lat: 21.1619, lng: -86.8515, rank: 20, crimes: 2900 },
];

// Google Maps container style
const containerStyle = {
  width: "100%",
  height: "100vh",
};

// Default center of the map
const defaultCenter = { lat: 20, lng: -20 };

export default function GoogleCrimeMap() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={3}>
        {cities.map((city, index) => (
          <Marker
            key={index}
            position={{ lat: city.lat, lng: city.lng }}
            onClick={() => setSelectedCity(city)}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Custom icon
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ))}

        {/* Show info window when a marker is clicked */}
        {selectedCity && (
          <InfoWindow
            position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
            onCloseClick={() => setSelectedCity(null)}
          >
            <div>
              <h3>{selectedCity.name}</h3>
              <p>Rank: {selectedCity.rank}</p>
              <p>Crimes: {selectedCity.crimes}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
