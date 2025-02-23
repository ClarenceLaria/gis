"use client";
import { useEffect, useRef, useState } from "react";
import "ol/ol.css"; // OpenLayers CSS
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon, Fill, Stroke, Circle as CircleStyle, RegularShape } from "ol/style";
import Overlay from "ol/Overlay";

// **Crime Data**
const cities = [
  { name: "Detroit, MI", lat: 42.3314, lon: -83.0458, rank: 1, crimes: 5000 },
  { name: "Memphis, TN", lat: 35.1495, lon: -90.0490, rank: 2, crimes: 4800 },
  { name: "Birmingham, AL", lat: 33.5186, lon: -86.8104, rank: 3, crimes: 4600 },
  { name: "St. Louis, MO", lat: 38.6270, lon: -90.1994, rank: 4, crimes: 4500 },
  { name: "Little Rock, AR", lat: 34.7465, lon: -92.2896, rank: 5, crimes: 4400 },
  { name: "Tijuana, Mexico", lat: 32.5149, lon: -117.0382, rank: 6, crimes: 4000 },
  { name: "Acapulco, Mexico", lat: 16.8531, lon: -99.8237, rank: 7, crimes: 3900 },
  { name: "Ciudad Juárez, Mexico", lat: 31.6904, lon: -106.4245, rank: 8, crimes: 3300 },
  { name: "Zacatecas, Mexico", lat: 22.7709, lon: -102.5833, rank: 9, crimes: 3000 },
  { name: "Cancún, Mexico", lat: 21.1619, lon: -86.8515, rank: 10, crimes: 2900 },
];

// **CrimeMap Component**
export default function CrimeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const [userFeature, setUserFeature] = useState<Feature | null>(null);
  const [town, setTown] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);

  console.log("Your Location:", town, country, userLatitude, userLongitude);
  useEffect(() => {
    if (!mapRef.current) return;

    // **Initialize Map**
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-100, 30]), // Center over North America
        zoom: 4,
      }),
    });

    // **Create Features for Each Crime City**
    const crimeFeatures = cities.map((city) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([city.lon, city.lat])),
        name: city.name,
        rank: city.rank,
        crimes: city.crimes,
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "red" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        })
      );

      return feature;
    });

    // **Add Crime Cities to a Layer**
    const crimeLayer = new VectorLayer({
      source: new VectorSource({
        features: crimeFeatures,
      }),
    });

    map.addLayer(crimeLayer);

    // **Create Overlay for Popups**
    const overlay = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      offset: [0, -10],
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;

    // **Click Event for Popups**
    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
      if (feature) {
        const coordinates = (feature.getGeometry() as Point)?.getCoordinates();
        overlay.setPosition(coordinates);

        const rank = feature.get("rank");
        const crimes = feature.get("crimes");

        if (popupRef.current) {
            if(rank !== undefined && crimes !== undefined ){
                popupRef.current.innerHTML = `
                    <strong>${feature.get("name")}</strong><br>
                    Rank: ${feature.get("rank")}<br>
                    Crimes: ${feature.get("crimes")}
                `;
            } else {
                popupRef.current.innerHTML = `
                    <strong>Your Location</strong><br>
                    Town: ${town}<br>
                    Country: ${country}<br>
                    Latitude: ${userLatitude}, Longitude: ${userLongitude}
                `;
            }
          popupRef.current.style.display = "block";
        }
      } else {
        overlay.setPosition(undefined);
        if (popupRef.current) popupRef.current.style.display = "none";
      }
    });

    // **Get User's Current Location**
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = fromLonLat([longitude, latitude]);

        const userFeature = new Feature({
          geometry: new Point(userCoords),
          name: "Your Location",
        });

        
        userFeature.setStyle(
          new Style({
            image: new RegularShape({
              points: 5, // Star shape
              radius: 10,
              radius2: 4,
              fill: new Fill({ color: "yellow" }),
              stroke: new Stroke({ color: "black", width: 2 }),
            }),
          })
        );

        setUserFeature(userFeature);

        // **Add User Marker to Map**
        const userLayer = new VectorLayer({
          source: new VectorSource({
            features: [userFeature],
          }),
        });

        map.addLayer(userLayer);

        // **Fetch Nearest Town Name**
        const results = await fetchNearestTown(latitude, longitude);
        setUserLatitude(latitude);
        setUserLongitude(longitude);
        if (results) {
          const town = results.town;
          const country = results.country;
          setCountry(country);
          setTown(town);
          console.log("Your Location:", town, country);
        }

        // **Reposition Map to User's Location**
        map.getView().setCenter(userCoords);
        map.getView().setZoom(12);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      map.setTarget(undefined);
    };
  }, [town, country, userLatitude, userLongitude]);

  // **Fetch Town Name**
  async function fetchNearestTown(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      const town = data.address.town || data.address.city || data.address.village || "Unknown";
      const county = data.address.county || "Unknown";
      const country = data.address.country || "Unknown";

      if (overlayRef.current && userFeature) {
        const coordinates = (userFeature.getGeometry() as Point)?.getCoordinates();
        overlayRef.current.setPosition(coordinates);
    }
    return {town, country};
    
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <div
        ref={popupRef}
        style={{
          position: "absolute",
          backgroundColor: "white",
          padding: "5px",
          borderRadius: "5px",
          display: "none",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          zIndex: 100,
        }}
        className="text-black text-opacity-55 w-36"
      ></div>
    </div>
  );
}
