import styles from "./TrustBadges.module.css";

const badges = [
  {
    icon: "⚡",
    title: "Same-Day Service",
    description: "Fast response when you need it most",
  },
  {
    icon: "🛡️",
    title: "EPA Certified",
    description: "Licensed & insured technicians",
  },
  {
    icon: "🏠",
    title: "Locally Owned",
    description: "Memphis-based since day one",
  },
  {
    icon: "🕐",
    title: "24/7 Emergency",
    description: "Round-the-clock availability",
  },
];

export default function TrustBadges() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={`grid grid-4 ${styles.grid}`}>
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={styles.badge}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className={styles.icon}>{badge.icon}</span>
              <h3 className={styles.title}>{badge.title}</h3>
              <p className={styles.description}>{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
