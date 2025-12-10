"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "./ServiceAreaMap.module.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

interface ServiceLocation {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  responseTime: string;
  featured?: boolean;
}

const locations: ServiceLocation[] = [
  {
    name: "Memphis",
    slug: "memphis",
    lat: 35.1495,
    lng: -90.049,
    responseTime: "Under 2 hours",
    featured: true,
  },
  {
    name: "Germantown",
    slug: "germantown",
    lat: 35.0868,
    lng: -89.8101,
    responseTime: "Under 3 hours",
    featured: true,
  },
  {
    name: "Collierville",
    slug: "collierville",
    lat: 35.0428,
    lng: -89.6645,
    responseTime: "Under 3 hours",
    featured: true,
  },
  {
    name: "Bartlett",
    slug: "bartlett",
    lat: 35.2045,
    lng: -89.8739,
    responseTime: "Under 3 hours",
  },
  {
    name: "Cordova",
    slug: "cordova",
    lat: 35.1589,
    lng: -89.7876,
    responseTime: "Under 3 hours",
  },
];

// HQ location (Memphis center)
const HQ_LOCATION = { lat: 35.1495, lng: -90.049 };

export default function ServiceAreaMap() {
  const [isClient, setIsClient] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={styles.mapPlaceholder}>
        <div className={styles.loadingSpinner} />
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <MapContainer
          center={[HQ_LOCATION.lat, HQ_LOCATION.lng]}
          zoom={10}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Service area circles */}
          <Circle
            center={[HQ_LOCATION.lat, HQ_LOCATION.lng]}
            radius={25000}
            pathOptions={{
              color: "#facc15",
              fillColor: "#facc15",
              fillOpacity: 0.1,
              weight: 2,
            }}
          />

          {/* Location markers */}
          {locations.map((location) => (
            <Marker
              key={location.slug}
              position={[location.lat, location.lng]}
              eventHandlers={{
                mouseover: () => setHoveredLocation(location.slug),
                mouseout: () => setHoveredLocation(null),
              }}
            >
              <Popup>
                <div className={styles.popup}>
                  <h4>{location.name}</h4>
                  <p className={styles.responseTime}>
                    <span className={styles.clockIcon}>🚗</span>
                    Est. Response: {location.responseTime}
                  </p>
                  <Link
                    href={`/service-areas/${location.slug}`}
                    className={styles.popupLink}
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Location List Sidebar */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Service Areas</h3>
        <ul className={styles.locationList}>
          {locations.map((location) => (
            <li
              key={location.slug}
              className={`${styles.locationItem} ${
                hoveredLocation === location.slug ? styles.active : ""
              } ${location.featured ? styles.featured : ""}`}
            >
              <Link href={`/service-areas/${location.slug}`}>
                <div className={styles.locationInfo}>
                  <span className={styles.locationName}>
                    📍 {location.name}
                  </span>
                  {location.featured && (
                    <span className={styles.badge}>Popular</span>
                  )}
                </div>
                <span className={styles.locationResponse}>
                  {location.responseTime}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.sidebarCta}>
          <p>Not listed? We may still serve your area!</p>
          <a href="tel:+19012579417" className={styles.callButton}>
            Call to Confirm
          </a>
        </div>
      </div>
    </div>
  );
}
