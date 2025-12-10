import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Video Background */}
      <div className={styles.videoBg}>
        <video autoPlay muted loop playsInline className={styles.video}>
          <source src="/videos/kitchen-background.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>
          Memphis Commercial
          <br />
          <span className={styles.highlight}>Kitchen Repair</span>
        </h1>
        
        <p className={styles.subtitle}>
          Expert repair & maintenance for ovens, fryers, dishwashers,
          and ice machines. Same-day service available.
        </p>

        <div className={styles.ctas}>
          <a href="tel:+19012579417" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
            <span>📞</span> Call Now: (901) 257-9417
          </a>
          <a href="mailto:R22subcooling@gmail.com?subject=Service%20Quote%20Request" className={`btn btn-secondary btn-lg ${styles.ctaSecondary}`}>
            Get a Quote
          </a>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🕘</span>
            <span>Mon-Fri 7AM-6PM</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Same-Day Service</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🛡️</span>
            <span>EPA Certified</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🕐</span>
            <span>24/7 Emergency</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollDot} />
      </div>
    </section>
  );
}
