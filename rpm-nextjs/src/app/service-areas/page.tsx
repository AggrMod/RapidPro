import { Metadata } from "next";
import Link from "next/link";
import ServiceAreaMapWrapper from "@/components/ServiceAreaMapWrapper";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Service Areas | Memphis Commercial Kitchen Repair",
  description:
    "Commercial kitchen equipment repair across Memphis and surrounding areas. We serve Germantown, Collierville, Bartlett, Cordova, and more. Fast response times.",
};

const locations = [
  {
    slug: "memphis",
    city: "Memphis",
    state: "TN",
    tagline: "Our home base - fastest response times",
    responseTime: "Under 2 hours",
    featured: true,
  },
  {
    slug: "germantown",
    city: "Germantown",
    state: "TN",
    tagline: "Serving upscale dining establishments",
    responseTime: "Under 3 hours",
    featured: true,
  },
  {
    slug: "collierville",
    city: "Collierville",
    state: "TN",
    tagline: "Historic town square and beyond",
    responseTime: "Under 3 hours",
    featured: true,
  },
  {
    slug: "bartlett",
    city: "Bartlett",
    state: "TN",
    tagline: "Stage Road corridor specialists",
    responseTime: "Under 3 hours",
    featured: false,
  },
  {
    slug: "cordova",
    city: "Cordova",
    state: "TN",
    tagline: "Wolfchase area coverage",
    responseTime: "Under 3 hours",
    featured: false,
  },
];

export default function ServiceAreasPage() {
  const serviceAreaSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Commercial Kitchen Equipment Repair",
    provider: {
      "@type": "LocalBusiness",
      name: "Rapid Pro Maintenance",
    },
    areaServed: locations.map((loc) => ({
      "@type": "City",
      name: loc.city,
      containedInPlace: {
        "@type": "State",
        name: loc.state === "TN" ? "Tennessee" : "Mississippi",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Service Areas</h1>
          <p className={styles.subtitle}>
            Fast, reliable commercial kitchen repair across the Memphis metro area.
            Our technicians are strategically located for rapid response times.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>5+</span>
              <span className={styles.statLabel}>Cities Served</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>&lt;3hr</span>
              <span className={styles.statLabel}>Avg Response</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>24/7</span>
              <span className={styles.statLabel}>Emergency Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className={styles.mapSection}>
        <div className="container">
          <ServiceAreaMapWrapper />
        </div>
      </section>

      {/* Locations Grid */}
      <section className={styles.locations}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Areas We Serve</h2>
          <div className={styles.divider} />

          <div className={styles.grid}>
            {locations.map((location) => (
              <Link
                key={location.slug}
                href={`/service-areas/${location.slug}`}
                className={`${styles.card} ${location.featured ? styles.featured : ""}`}
              >
                {location.featured && (
                  <span className={styles.badge}>Popular</span>
                )}
                <div className={styles.cardHeader}>
                  <span className={styles.pinIcon}>📍</span>
                  <div>
                    <h3 className={styles.cardTitle}>
                      {location.city}, {location.state}
                    </h3>
                    <p className={styles.cardTagline}>{location.tagline}</p>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.responseTime}>
                    <span className={styles.clockIcon}>🚗</span>
                    <span>Response: {location.responseTime}</span>
                  </div>
                </div>
                <span className={styles.cardLink}>
                  View Details <span className={styles.arrow}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Not Sure If We Service Your Area?</h2>
            <p>
              Give us a call! We may be able to accommodate locations outside our
              primary service area.
            </p>
            <div className={styles.ctaButtons}>
              <a href="tel:+19012579417" className="btn btn-primary btn-lg">
                Call (901) 257-9417
              </a>
              <Link href="/quote" className="btn btn-secondary btn-lg">
                Request Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
