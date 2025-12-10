import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={`section section-dark ${styles.section}`}>
      <div className={styles.background} />
      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>Ready to Get Your Kitchen Running?</h2>
        <p className={styles.subtitle}>
          Don&apos;t let equipment failures slow down your business. Our Memphis-based 
          technicians are ready to help with same-day service available.
        </p>
        
        <div className={styles.ctas}>
          <a href="tel:+19012579417" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
            <span>📞</span> Call (901) 257-9417
          </a>
          <a href="mailto:R22subcooling@gmail.com?subject=Service%20Quote%20Request" className={`btn btn-secondary btn-lg`}>
            Request Quote
          </a>
        </div>

        <div className={styles.hours}>
          <p><strong>Service Hours:</strong> Mon-Fri 7AM-6PM</p>
          <p><strong>Emergency Service:</strong> Available 24/7</p>
        </div>
      </div>
    </section>
  );
}
