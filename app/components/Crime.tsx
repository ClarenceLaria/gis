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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
        center: fromLonLat([-100, 30]), // Default center over North America
        zoom: 4,
      }),
    });

    // **Create Features for Each City**
    const features = cities.map((city) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([city.lon, city.lat])), // Convert lon/lat to OpenLayers coordinates
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

    // **Add Features to Vector Layer**
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
    });

    map.addLayer(vectorLayer);

    // **Create Overlay for Popups**
    const overlay = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      offset: [0, -10],
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;

    // **Click Event to Show Popup**
    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
      if (feature) {
        const coordinates = (feature.getGeometry() as Point)?.getCoordinates();
        overlay.setPosition(coordinates);

        if (popupRef.current) {
          popupRef.current.innerHTML = `
            <strong>${feature.get("name")}</strong><br>
            Rank: ${feature.get("rank")}<br>
            Crimes: ${feature.get("crimes")}
          `;
          popupRef.current.style.display = "block";
        }
      } else {
        overlay.setPosition(undefined);
        if (popupRef.current) popupRef.current.style.display = "none";
      }
    });

    // **Create Star Shape for User Location**
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([-100, 30])), // Default point
    });

    const userStyle = new Style({
      image: new RegularShape({
        points: 5, // Defines a star shape
        radius: 10, // Outer radius
        radius2: 4, // Inner radius for star effect
        angle: 0, // Orientation of the star
        fill: new Fill({ color: "yellow" }),
        stroke: new Stroke({ color: "black", width: 2 }),
      }),
    });

    userFeature.setStyle(userStyle);

    const userLayer = new VectorLayer({
      source: new VectorSource({
        features: [userFeature],
      }),
    });

    map.addLayer(userLayer);

    // **Get User Location and Update Star Position**
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        const coordinates = fromLonLat([longitude, latitude]);
        userFeature.setGeometry(new Point(coordinates));

        // Center map on user’s location when first fetched
        map.getView().setCenter(coordinates);
        map.getView().setZoom(12);
      },
      (error) => {
        console.error("Geolocation Error:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      map.setTarget(undefined);
    };
  }, []);

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
        }}
        className="text-black text-opacity-55 w-36"
      ></div>
    </div>
  );
}
