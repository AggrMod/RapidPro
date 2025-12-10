import styles from "./LocationPageTemplate.module.css";

interface LocationPageProps {
  city: string;
  state: string;
  tagline: string;
  description: string;
  neighborhoods: string[];
  landmarks: string[];
  responseTime: string;
}

const services = [
  { name: "Commercial Oven Repair", href: "/services/commercial-oven-repair", icon: "🔥" },
  { name: "Commercial Fryer Repair", href: "/services/commercial-fryer-repair", icon: "🍟" },
  { name: "Dishwasher Repair", href: "/services/dishwasher-repair", icon: "🍽️" },
  { name: "Ice Machine Service", href: "/services/ice-machine-service", icon: "🧊" },
  { name: "Walk-In Cooler Service", href: "/services/walk-in-cooler-service", icon: "❄️" },
  { name: "Griddle & Flat Top Repair", href: "/services/griddle-flat-top-repair", icon: "🍳" },
  { name: "Steam Table Repair", href: "/services/steam-table-repair", icon: "♨️" },
];

export default function LocationPageTemplate({
  city,
  state,
  tagline,
  description,
  neighborhoods,
  landmarks,
  responseTime,
}: LocationPageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroIcon}>📍</span>
          <h1 className={styles.heroTitle}>
            Commercial Kitchen Repair in {city}, {state}
          </h1>
          <p className={styles.heroSubtitle}>{tagline}</p>
          <div className={styles.responseTime}>
            <span className={styles.responseIcon}>🚐</span>
            <span>Average response time: <strong>{responseTime}</strong></span>
          </div>
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
                <h2>Commercial Kitchen Equipment Repair in {city}</h2>
                <p>{description}</p>
                <p>
                  Whether you run a restaurant, hotel, school cafeteria, or any food service operation in {city}, 
                  Rapid Pro Maintenance is your trusted partner for commercial kitchen equipment repair. 
                  Our EPA-certified technicians provide fast, reliable service with same-day appointments available.
                </p>
              </div>

              {/* Services */}
              <div className={styles.servicesSection}>
                <h2>Services Available in {city}</h2>
                <div className={styles.servicesGrid}>
                  {services.map((service, index) => (
                    <a key={index} href={service.href} className={styles.serviceCard}>
                      <span className={styles.serviceIcon}>{service.icon}</span>
                      <span className={styles.serviceName}>{service.name}</span>
                      <span className={styles.serviceArrow}>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Areas We Serve */}
              <div className={styles.areasSection}>
                <h2>Areas We Serve in {city}</h2>
                <div className={styles.areasGrid}>
                  <div className={styles.areaCard}>
                    <h3>Neighborhoods</h3>
                    <ul>
                      {neighborhoods.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.areaCard}>
                    <h3>Near Local Landmarks</h3>
                    <ul>
                      {landmarks.map((landmark, index) => (
                        <li key={index}>{landmark}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className={styles.whySection}>
                <h2>Why {city} Businesses Choose Rapid Pro</h2>
                <div className={styles.whyGrid}>
                  <div className={styles.whyItem}>
                    <span className={styles.whyIcon}>⚡</span>
                    <h3>Fast Response</h3>
                    <p>Same-day service available for {city} businesses. We understand downtime costs money.</p>
                  </div>
                  <div className={styles.whyItem}>
                    <span className={styles.whyIcon}>🛡️</span>
                    <h3>EPA Certified</h3>
                    <p>Licensed, insured, and EPA-certified technicians you can trust with your equipment.</p>
                  </div>
                  <div className={styles.whyItem}>
                    <span className={styles.whyIcon}>🏠</span>
                    <h3>Local Experts</h3>
                    <p>Memphis-based company serving {city} and the surrounding area since day one.</p>
                  </div>
                  <div className={styles.whyItem}>
                    <span className={styles.whyIcon}>🔧</span>
                    <h3>All Brands</h3>
                    <p>We service all major commercial kitchen equipment brands and models.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <aside className={styles.sidebar}>
              {/* Contact Card */}
              <div className={styles.contactCard}>
                <h3>Need Service in {city}?</h3>
                <p>Our technicians are ready to help your {city} business.</p>
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

              {/* Other Service Areas */}
              <div className={styles.otherAreasCard}>
                <h3>Other Service Areas</h3>
                <ul className={styles.otherAreasList}>
                  <li><a href="/service-areas/memphis">Memphis, TN</a></li>
                  <li><a href="/service-areas/germantown">Germantown</a></li>
                  <li><a href="/service-areas/collierville">Collierville</a></li>
                  <li><a href="/service-areas/bartlett">Bartlett</a></li>
                  <li><a href="/service-areas/cordova">Cordova</a></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready for Service in {city}?</h2>
          <p>Don't let broken equipment cost your {city} business money. Call Memphis' trusted repair experts.</p>
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
