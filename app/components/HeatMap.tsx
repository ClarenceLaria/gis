"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import HeatmapLayer from "ol/layer/Heatmap";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Point, LineString } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

const crimeData = [
  { lat: 42.3314, lon: -83.0458, intensity: 1.0 }, // Detroit
  { lat: 35.1495, lon: -90.0490, intensity: 0.6 }, // Memphis
  { lat: 33.5186, lon: -86.8104, intensity: 0.3 }, // Birmingham
  { lat: 38.6270, lon: -90.1994, intensity: 0.8 }, // St. Louis
  { lat: 34.7465, lon: -92.2896, intensity: 0.2 }, // Little Rock
];

export default function CrimeHeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  const api_key = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

  useEffect(() => {
    if (!mapRef.current) return;

    // **Create Features for Heatmap**
    const crimeFeatures = crimeData.map((crime) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([crime.lon, crime.lat])),
      });
      feature.set("weight", crime.intensity); // Set intensity for heat map
      return feature;
    });

    // **Create Heatmap Layer**
    const heatmapLayer = new HeatmapLayer({
      source: new VectorSource({
        features: crimeFeatures,
      }),
      blur: 20, // Adjust blur for smoother effect
      radius: 15, // Adjust spread of heat points
      weight: (feature) => {
        const intensity = feature.get("weight") || 0.5;
        if (intensity >= 0.8) return 1.0; // 🔴 High danger
        if (intensity >= 0.5) return 0.6; // 🟡 Moderate danger
        return 0.2; // 🟢 Safe Area
      },
      gradient: ["green", "yellow", "red"], // Color gradient
    });

    // **Tile Layer from Carto**
    const tileLayer = new TileLayer({
      source: new OSM(),
    });

    // **Initialize Map**
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, heatmapLayer],
      view: new View({
        center: fromLonLat([-100, 30]), // Center over the US
        zoom: 4,
        projection: "EPSG:3857",
      }),
    });

    // **Function to Fetch and Display Route**
    async function getRoute(start: any[], end: any[]) {
      const apiKey = api_key;
      if(!apiKey) {
        console.error("API key not found!");
        return;
      }
      
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const routeCoords = data.features[0].geometry.coordinates.map((coord: number[]) => fromLonLat([coord[0], coord[1]]));

        const routeFeature = new Feature({
          geometry: new LineString(routeCoords),
        });
        routeFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "blue",
              width: 5,
            }),
          })
        );

        const routeLayer = new VectorLayer({
          source: new VectorSource({
            features: [routeFeature],
          }),
        });

        map.addLayer(routeLayer);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }

    // Example Route: New York City to Washington DC
    getRoute([-74.006, 40.7128], [-77.0369, 38.9072]);

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }}></div>
      {/* Legend Box */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "20px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }} className="text-black">
          🔥 Crime Risk Level
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="border-2 rounded-full" style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "red", marginRight: "5px" }}></span>
          <span className="text-black mx-1">High Danger</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="border-2 rounded-full" style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "yellow", marginRight: "5px" }}></span>
          <span className="text-black mx-1">Moderate Risk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="border-2 rounded-full" style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "green", marginRight: "5px" }}></span>
          <span className="text-black mx-1">Safe Area</span>
        </div>
      </div>
    </div>
  );
}
