import Link from "next/link";
import styles from "./ServicesGrid.module.css";

const services = [
  {
    icon: "🔥",
    title: "Commercial Oven Repair",
    description: "Gas, electric, and convection oven repair. Temperature calibration and heating element replacement.",
    href: "/services/commercial-oven-repair",
    popular: true,
  },
  {
    icon: "🍟",
    title: "Commercial Fryer Repair",
    description: "Deep fryer maintenance and repair. Thermostat, heating element, and filtration system service.",
    href: "/services/commercial-fryer-repair",
    popular: true,
  },
  {
    icon: "🍳",
    title: "Griddle & Flat Top Repair",
    description: "Griddle surface repair, thermostat calibration, and heating element replacement.",
    href: "/services/commercial-griddle-repair",
  },
  {
    icon: "🍽️",
    title: "Dishwasher Repair",
    description: "High-temp and low-temp dishwasher service. Pump, heating, and sanitization system repair.",
    href: "/services/commercial-dishwasher-repair",
    popular: true,
  },
  {
    icon: "🧊",
    title: "Ice Machine Service",
    description: "Ice maker repair and maintenance. Scale removal and water filtration for Memphis water conditions.",
    href: "/services/ice-machine-service",
  },
  {
    icon: "❄️",
    title: "Walk-In Cooler Service",
    description: "Walk-in cooler and freezer maintenance. Emergency repair available 24/7.",
    href: "/services/walk-in-cooler-maintenance",
  },
  {
    icon: "♨️",
    title: "Steam Table Repair",
    description: "Steam table, soup wells, and hot holding equipment service and repair.",
    href: "/services/steam-table-repair",
  },
];

export default function ServicesGrid() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title">Equipment We Repair</h2>
        <div className="section-divider" />
        <p className={styles.intro}>
          From commercial ovens to walk-in coolers, our EPA-certified technicians 
          have the expertise to keep your Memphis kitchen running smoothly.
        </p>

        <div className={`grid grid-3 ${styles.grid}`}>
          {services.map((service, index) => (
            <Link
              key={service.title}
              href={service.href}
              className={styles.card}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {service.popular && (
                <span className={styles.popularBadge}>Popular</span>
              )}
              <span className={styles.icon}>{service.icon}</span>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDesc}>{service.description}</p>
              <span className={styles.learnMore}>
                Learn More →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
