"use client";

import dynamic from "next/dynamic";
import styles from "./ServiceAreaMapWrapper.module.css";

// Lazy load the map component to avoid SSR issues with Leaflet
const ServiceAreaMap = dynamic(
  () => import("@/components/ServiceAreaMap"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.placeholder}>
        <div className={styles.spinner} />
        <p>Loading map...</p>
      </div>
    )
  }
);

export default function ServiceAreaMapWrapper() {
  return <ServiceAreaMap />;
}
