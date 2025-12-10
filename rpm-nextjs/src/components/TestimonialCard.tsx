import styles from "./TestimonialCard.module.css";

interface TestimonialCardProps {
  name: string;
  business: string;
  businessType: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  source?: "google" | "direct";
}

export default function TestimonialCard({
  name,
  business,
  businessType,
  location,
  rating,
  text,
  date,
  verified,
  source = "direct",
}: TestimonialCardProps) {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.business}>{business}</div>
          <div className={styles.meta}>
            <span className={styles.businessType}>{businessType}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.location}>{location}</span>
          </div>
        </div>
      </div>

      <div className={styles.rating}>
        <div className={styles.stars}>{stars}</div>
        <span className={styles.date}>{date}</span>
      </div>

      <p className={styles.text}>"{text}"</p>

      <div className={styles.footer}>
        {verified && (
          <span className={styles.verified}>
            <span className={styles.verifiedIcon}>✓</span>
            Verified Business
          </span>
        )}
        {source === "google" && (
          <span className={styles.source}>
            <span className={styles.googleIcon}>G</span>
            Google Review
          </span>
        )}
      </div>
    </div>
  );
}
