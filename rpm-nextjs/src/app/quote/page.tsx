import { Metadata } from "next";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Get a Quote | Request Service",
  description:
    "Request commercial kitchen equipment repair service in Memphis. Fill out our quick form and a technician will contact you within 15 minutes for emergencies.",
};

export default function QuotePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Request Service</h1>
            <p className={styles.subtitle}>
              Tell us about your equipment issue and we&apos;ll get a technician
              scheduled. For emergencies, call{" "}
              <a href="tel:+19012579417" className={styles.phoneLink}>
                (901) 257-9417
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className={styles.formSection}>
        <div className="container">
          <div className={styles.formWrapper}>
            <div className={styles.formContainer}>
              <ServiceRequestForm />
            </div>

            <div className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3>Why Choose Rapid Pro?</h3>
                <ul className={styles.benefits}>
                  <li>
                    <span className={styles.benefitIcon}>⚡</span>
                    <div>
                      <strong>Same-Day Service</strong>
                      <p>Most repairs completed within 24 hours</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.benefitIcon}>🛡️</span>
                    <div>
                      <strong>EPA Certified</strong>
                      <p>Licensed and insured technicians</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.benefitIcon}>💰</span>
                    <div>
                      <strong>Fair Pricing</strong>
                      <p>Upfront quotes, no hidden fees</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.benefitIcon}>🔧</span>
                    <div>
                      <strong>All Brands</strong>
                      <p>We service every major brand</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className={styles.contactCard}>
                <h4>Prefer to Call?</h4>
                <p>Our team is ready to help:</p>
                <a href="tel:+19012579417" className={styles.callButton}>
                  📞 (901) 257-9417
                </a>
                <div className={styles.hours}>
                  <p>Mon-Fri: 7AM - 6PM</p>
                  <p>24/7 Emergency Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
