import dynamic from "next/dynamic";

const CrimeMap = dynamic(() => import("@/app/components/Crime"));

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>High Crime Rate Cities</h1>
      <CrimeMap />
    </div>
  );
}
