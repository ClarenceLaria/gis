import dynamic from "next/dynamic";
import GoogleCrimeMap from "./components/GoogleMaps";
import CrimeHeatMap from "./components/HeatMap";

const CrimeMap = dynamic(() => import("@/app/components/Crime"));

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>High Crime Rate Cities</h1>
      <CrimeHeatMap />
    </div>
  );
}
