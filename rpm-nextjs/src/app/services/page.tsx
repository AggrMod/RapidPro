import { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Commercial Kitchen Equipment Repair Services",
  description:
    "Full-service commercial kitchen equipment repair in Memphis. Ovens, fryers, dishwashers, ice machines, walk-in coolers, griddles, and steam tables. Same-day service available.",
};

const services = [
  {
    slug: "commercial-oven-repair",
    title: "Commercial Oven Repair",
    icon: "🔥",
    description:
      "Expert repair for convection ovens, deck ovens, and combination ovens. We service all major brands.",
    features: ["Same-day service", "All brands", "Parts in stock"],
  },
  {
    slug: "commercial-fryer-repair",
    title: "Commercial Fryer Repair",
    icon: "🍟",
    description:
      "Fast fryer repair to keep your kitchen running. Gas and electric fryer specialists.",
    features: ["Temperature issues", "Ignition problems", "Oil leaks"],
  },
  {
    slug: "commercial-dishwasher-repair",
    title: "Dishwasher Repair",
    icon: "🍽️",
    description:
      "Commercial dishwasher service for restaurants, hotels, and cafeterias.",
    features: ["Not draining", "Not heating", "Sanitizer issues"],
  },
  {
    slug: "ice-machine-service",
    title: "Ice Machine Service",
    icon: "🧊",
    description:
      "Ice machine repair and maintenance. We fix all types including cube, flake, and nugget.",
    features: ["Low ice production", "Dirty ice", "Preventive maintenance"],
  },
  {
    slug: "walk-in-cooler-maintenance",
    title: "Walk-In Cooler Service",
    icon: "❄️",
    description:
      "Walk-in cooler and freezer repair. 24/7 emergency service to protect your inventory.",
    features: ["Temperature issues", "Compressor repair", "Door seals"],
  },
  {
    slug: "griddle-flat-top-repair",
    title: "Griddle & Flat Top Repair",
    icon: "🥓",
    description:
      "Griddle repair for restaurants and diners. Gas and electric models serviced.",
    features: ["Uneven heating", "Thermostat issues", "Surface damage"],
  },
  {
    slug: "steam-table-repair",
    title: "Steam Table Repair",
    icon: "♨️",
    description:
      "Steam table and hot holding equipment repair for buffets and cafeterias.",
    features: ["Not heating", "Temperature control", "Element replacement"],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Commercial Kitchen Repair Services</h1>
          <p className={styles.subtitle}>
            Expert repair and maintenance for all commercial kitchen equipment.
            EPA-certified technicians with same-day service available.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>7+</span>
              <span className={styles.statLabel}>Equipment Types</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>Brands Serviced</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>24/7</span>
              <span className={styles.statLabel}>Emergency Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.services}>
        <div className="container">
          <div className={styles.grid}>
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={styles.card}
              >
                <div className={styles.cardIcon}>{service.icon}</div>
                <h2 className={styles.cardTitle}>{service.title}</h2>
                <p className={styles.cardDescription}>{service.description}</p>
                <ul className={styles.cardFeatures}>
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <span className={styles.checkIcon}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className={styles.cardLink}>
                  Learn More <span className={styles.arrow}>→</span>
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
            <h2>Need Service Today?</h2>
            <p>
              Our EPA-certified technicians are ready to help with any commercial
              kitchen equipment issue.
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
