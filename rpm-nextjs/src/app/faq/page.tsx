import { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import { defaultFAQs } from "@/data/faqs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FAQ | Commercial Kitchen Equipment Repair Questions Answered",
  description:
    "Get answers to common questions about commercial kitchen equipment repair in Memphis. Learn about our services, response times, warranties, and more.",
};

export default function FAQPage() {
  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: defaultFAQs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Find answers to common questions about our commercial kitchen
            equipment repair services. Can&apos;t find what you&apos;re looking for?
            Give us a call!
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className="container">
          <div className={styles.faqWrapper}>
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className="container">
          <div className={styles.contactCard}>
            <div className={styles.contactContent}>
              <h2>Still Have Questions?</h2>
              <p>
                Our team is happy to answer any questions about your specific
                equipment or situation. Reach out anytime!
              </p>
            </div>
            <div className={styles.contactActions}>
              <a href="tel:+19012579417" className={styles.phoneButton}>
                <span className={styles.phoneIcon}>Phone</span>
                <span className={styles.phoneNumber}>(901) 257-9417</span>
                <span className={styles.phoneLabel}>Call Now</span>
              </a>
              <div className={styles.altActions}>
                <Link href="/quote" className="btn btn-secondary">
                  Request Quote
                </Link>
                <a href="mailto:R22subcooling@gmail.com" className={styles.emailLink}>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className={styles.quickLinks}>
        <div className="container">
          <h2 className={styles.quickLinksTitle}>Explore Our Services</h2>
          <div className={styles.linksGrid}>
            <Link href="/services" className={styles.linkCard}>
              <span className={styles.linkIcon}>Services</span>
              <h3>Equipment We Repair</h3>
              <p>See our full range of commercial kitchen repair services</p>
            </Link>
            <Link href="/service-areas" className={styles.linkCard}>
              <span className={styles.linkIcon}>Areas</span>
              <h3>Service Areas</h3>
              <p>Check if we service your location in the Memphis area</p>
            </Link>
            <Link href="/testimonials" className={styles.linkCard}>
              <span className={styles.linkIcon}>Reviews</span>
              <h3>Customer Reviews</h3>
              <p>Read what our customers say about our service</p>
            </Link>
            <Link href="/gallery" className={styles.linkCard}>
              <span className={styles.linkIcon}>Gallery</span>
              <h3>Our Work</h3>
              <p>See before and after photos of our repairs</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
