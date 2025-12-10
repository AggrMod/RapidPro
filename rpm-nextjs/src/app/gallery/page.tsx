import { Metadata } from "next";
import Link from "next/link";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Repair Gallery | Before & After Commercial Kitchen Repairs",
  description:
    "See our commercial kitchen repair work in action. Before and after photos of oven repairs, walk-in cooler fixes, fryer overhauls, and ice machine service across Memphis.",
};

export default function GalleryPage() {
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Commercial Kitchen Repair Gallery",
    description:
      "Before and after photos showcasing our commercial kitchen equipment repair services",
    provider: {
      "@type": "LocalBusiness",
      name: "Rapid Pro Maintenance",
      telephone: "+1-901-257-9417",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Memphis",
        addressRegion: "TN",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Repair Gallery</h1>
          <p className={styles.subtitle}>
            See the quality of our work. Drag the slider to compare before and
            after results from real commercial kitchen repairs across Memphis.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Repairs Completed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>98%</span>
              <span className={styles.statLabel}>First-Visit Fix</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>15+</span>
              <span className={styles.statLabel}>Years Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.gallerySection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Before & After</h2>
            <div className={styles.divider} />
            <p className={styles.sectionSubtitle}>
              Drag the slider on each image to see the transformation. Click any
              card for an expanded view with full repair details.
            </p>
          </div>
          <BeforeAfterGallery />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className={styles.trust}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>EPA Certified</span>
              <h3>EPA Certified</h3>
              <p>
                All technicians are EPA 608 certified for safe refrigerant
                handling
              </p>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>Licensed</span>
              <h3>Fully Licensed</h3>
              <p>Licensed and insured for commercial kitchen equipment repair</p>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>Warranty</span>
              <h3>Work Guaranteed</h3>
              <p>90-day warranty on all parts and labor for your peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Need Commercial Kitchen Repair?</h2>
            <p>
              Our expert technicians are ready to restore your equipment to peak
              performance. Fast response times across the Memphis metro area.
            </p>
            <div className={styles.ctaButtons}>
              <a href="tel:+19012579417" className="btn btn-primary btn-lg">
                Call (901) 257-9417
              </a>
              <Link href="/quote" className="btn btn-secondary btn-lg">
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
