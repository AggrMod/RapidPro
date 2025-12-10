import styles from "./ServicePageTemplate.module.css";

interface FAQ {
  question: string;
  answer: string;
}

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  features: string[];
  commonIssues: { issue: string; description: string }[];
  faqs: FAQ[];
  relatedServices: { name: string; href: string; icon: string }[];
}

export default function ServicePageTemplate({
  title,
  subtitle,
  description,
  icon,
  features,
  commonIssues,
  faqs,
  relatedServices,
}: ServicePageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroIcon}>{icon}</span>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>{subtitle}</p>
          <div className={styles.heroCtas}>
            <a href="tel:+19012579417" className="btn btn-primary btn-lg">
              <span>📞</span> Call Now: (901) 257-9417
            </a>
            <a href="mailto:R22subcooling@gmail.com?subject=Service%20Quote%20Request" className="btn btn-secondary btn-lg">
              Get a Quote
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className="container">
          <div className={styles.contentGrid}>
            {/* Left Column - Main Content */}
            <div className={styles.mainContent}>
              {/* Description */}
              <div className={styles.descriptionCard}>
                <h2>Expert {title} in Memphis</h2>
                <p>{description}</p>
              </div>

              {/* Features */}
              <div className={styles.featuresSection}>
                <h2>Why Choose Rapid Pro Maintenance?</h2>
                <div className={styles.featuresGrid}>
                  {features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <span className={styles.featureCheck}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Issues */}
              <div className={styles.issuesSection}>
                <h2>Common Issues We Fix</h2>
                <div className={styles.issuesGrid}>
                  {commonIssues.map((item, index) => (
                    <div key={index} className={styles.issueCard}>
                      <h3>{item.issue}</h3>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className={styles.faqSection}>
                <h2>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                  {faqs.map((faq, index) => (
                    <details key={index} className={styles.faqItem}>
                      <summary className={styles.faqQuestion}>{faq.question}</summary>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <aside className={styles.sidebar}>
              {/* Contact Card */}
              <div className={styles.contactCard}>
                <h3>Need Service?</h3>
                <p>Our EPA-certified technicians are ready to help.</p>
                <a href="tel:+19012579417" className={styles.phoneLink}>
                  📞 (901) 257-9417
                </a>
                <div className={styles.serviceInfo}>
                  <div className={styles.infoItem}>
                    <span>🕘</span>
                    <span>Mon-Fri 7AM-6PM</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>⚡</span>
                    <span>Same-Day Service</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>🚨</span>
                    <span>24/7 Emergency</span>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className={styles.areasCard}>
                <h3>Service Areas</h3>
                <ul className={styles.areasList}>
                  <li>Memphis, TN</li>
                  <li>Germantown</li>
                  <li>Collierville</li>
                  <li>Bartlett</li>
                  <li>Cordova</li>
                  <li>Southaven, MS</li>
                  <li>Olive Branch, MS</li>
                </ul>
              </div>

              {/* Related Services */}
              <div className={styles.relatedCard}>
                <h3>Other Services</h3>
                <ul className={styles.relatedList}>
                  {relatedServices.map((service, index) => (
                    <li key={index}>
                      <a href={service.href}>
                        <span>{service.icon}</span>
                        <span>{service.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Get Your Equipment Running?</h2>
          <p>Don't let broken equipment cost you money. Call Memphis' trusted repair experts.</p>
          <div className={styles.ctaButtons}>
            <a href="tel:+19012579417" className="btn btn-primary btn-lg">
              Call (901) 257-9417
            </a>
            <a href="mailto:R22subcooling@gmail.com?subject=Service%20Quote%20Request" className="btn btn-secondary btn-lg">
              Request Quote
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
