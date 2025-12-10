import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const serviceLinks = [
  { href: "/services/commercial-oven-repair", label: "Commercial Oven Repair" },
  { href: "/services/commercial-fryer-repair", label: "Commercial Fryer Repair" },
  { href: "/services/commercial-dishwasher-repair", label: "Dishwasher Repair" },
  { href: "/services/ice-machine-service", label: "Ice Machine Service" },
  { href: "/services/walk-in-cooler-maintenance", label: "Walk-In Cooler Service" },
];

const locationLinks = [
  { href: "/locations/germantown", label: "Germantown" },
  { href: "/locations/collierville", label: "Collierville" },
  { href: "/locations/bartlett", label: "Bartlett" },
  { href: "/locations/cordova", label: "Cordova" },
  { href: "/locations/southaven", label: "Southaven, MS" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        {/* Brand Column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Rapid Pro Maintenance"
              width={160}
              height={53}
              className={styles.logoImg}
            />
          </Link>
          <p className={styles.tagline}>
            Memphis&apos; premier commercial kitchen equipment repair specialists.
            EPA Certified technicians available 24/7.
          </p>
          <div className={styles.contact}>
            <a href="tel:+19012579417" className={styles.phone}>
              📞 (901) 257-9417
            </a>
            <a href="mailto:R22subcooling@gmail.com" className={styles.email}>
              R22subcooling@gmail.com
            </a>
          </div>
        </div>

        {/* Services Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Services</h3>
          <ul className={styles.list}>
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Locations Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Service Areas</h3>
          <ul className={styles.list}>
            {locationLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Company</h3>
          <ul className={styles.list}>
            <li>
              <Link href="/testimonials" className={styles.link}>
                Testimonials
              </Link>
            </li>
            <li>
              <Link href="/service-areas" className={styles.link}>
                Service Areas Map
              </Link>
            </li>
          </ul>
          <div className={styles.badges}>
            <span className={styles.badge}>EPA Certified</span>
            <span className={styles.badge}>24/7 Emergency</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Rapid Pro Maintenance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
