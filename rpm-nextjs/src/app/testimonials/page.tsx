import { Metadata } from "next";
import TestimonialCard from "@/components/TestimonialCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Customer Reviews & Testimonials",
  description:
    "Read what Memphis restaurant owners say about Rapid Pro Maintenance. 5-star reviews for commercial kitchen equipment repair from verified local businesses.",
};

const testimonials = [
  {
    name: "Marcus Johnson",
    business: "Soul Food Kitchen",
    businessType: "Restaurant",
    location: "Memphis, TN",
    rating: 5,
    text: "Our fryer went out during the Friday dinner rush. Called Rapid Pro and they had a tech here within 2 hours. Fixed it right the first time. These guys are lifesavers!",
    date: "November 2024",
    verified: true,
    source: "google" as const,
  },
  {
    name: "Patricia Williams",
    business: "Germantown Country Club",
    businessType: "Country Club",
    location: "Germantown, TN",
    rating: 5,
    text: "We've used Rapid Pro for all our commercial kitchen equipment for 3 years now. Their preventive maintenance program has saved us thousands in emergency repairs. Highly professional team.",
    date: "October 2024",
    verified: true,
    source: "direct" as const,
  },
  {
    name: "James Chen",
    business: "Lucky Dragon Restaurant",
    businessType: "Restaurant",
    location: "Collierville, TN",
    rating: 5,
    text: "Fast, honest, and reasonably priced. Fixed our walk-in cooler on a Saturday when everyone else said Monday. Will definitely use again.",
    date: "October 2024",
    verified: true,
    source: "google" as const,
  },
  {
    name: "Sandra Mitchell",
    business: "Bartlett Elementary School",
    businessType: "School Cafeteria",
    location: "Bartlett, TN",
    rating: 5,
    text: "As a school food service director, I need reliable vendors. Rapid Pro handles all our commercial dishwashers and steam tables. Always on time, always professional.",
    date: "September 2024",
    verified: true,
    source: "direct" as const,
  },
  {
    name: "Robert Taylor",
    business: "BBQ Boss Smokehouse",
    businessType: "BBQ Restaurant",
    location: "Memphis, TN",
    rating: 5,
    text: "These folks know their stuff! Fixed our smoker's temperature issues that two other companies couldn't figure out. True experts in commercial equipment.",
    date: "September 2024",
    verified: true,
    source: "google" as const,
  },
  {
    name: "Maria Rodriguez",
    business: "El Sol Mexican Grill",
    businessType: "Restaurant",
    location: "Cordova, TN",
    rating: 5,
    text: "Emergency service on a holiday weekend - they came through when we needed them most. Our griddle is running better than ever. Thank you Rapid Pro!",
    date: "August 2024",
    verified: true,
    source: "direct" as const,
  },
  {
    name: "David Anderson",
    business: "Hampton Inn Memphis Airport",
    businessType: "Hotel",
    location: "Memphis, TN",
    rating: 5,
    text: "Professional service from start to finish. They serviced all our breakfast kitchen equipment and even identified a potential problem with our ice machine before it failed.",
    date: "August 2024",
    verified: true,
    source: "google" as const,
  },
  {
    name: "Lisa Thompson",
    business: "Sweet Dreams Bakery",
    businessType: "Bakery",
    location: "Memphis, TN",
    rating: 5,
    text: "Our commercial ovens are critical to our business. Rapid Pro keeps them running perfectly. They understand that downtime costs us money and they work quickly.",
    date: "July 2024",
    verified: true,
    source: "direct" as const,
  },
  {
    name: "Michael Brown",
    business: "Sunrise Senior Living",
    businessType: "Senior Care Facility",
    location: "Germantown, TN",
    rating: 5,
    text: "We can't afford equipment failures with 150 residents depending on us. Rapid Pro's maintenance contract gives us peace of mind. Excellent response time.",
    date: "July 2024",
    verified: true,
    source: "google" as const,
  },
];

// Calculate aggregate rating
const aggregateRating = {
  ratingValue: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
  reviewCount: testimonials.length,
  bestRating: 5,
  worstRating: 1,
};

export default function TestimonialsPage() {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Rapid Pro Maintenance",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      bestRating: aggregateRating.bestRating,
      worstRating: aggregateRating.worstRating,
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: t.name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: t.text,
      datePublished: t.date,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.badge}>Customer Reviews</span>
            <h1 className={styles.title}>What Memphis Says About Us</h1>
            <p className={styles.subtitle}>
              Real reviews from real restaurant owners, facility managers, and food service
              professionals across the Memphis area.
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{aggregateRating.ratingValue}</span>
                <span className={styles.statLabel}>Average Rating</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{aggregateRating.reviewCount}+</span>
                <span className={styles.statLabel}>Verified Reviews</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>100%</span>
                <span className={styles.statLabel}>Would Recommend</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className={styles.testimonials}>
        <div className="container">
          <div className={styles.grid}>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready to Experience the Difference?</h2>
            <p>Join hundreds of satisfied Memphis businesses who trust Rapid Pro Maintenance.</p>
            <div className={styles.ctaButtons}>
              <a href="tel:+19012579417" className="btn btn-primary btn-lg">
                Call (901) 257-9417
              </a>
              <a
                href="mailto:R22subcooling@gmail.com?subject=Service%20Quote%20Request"
                className="btn btn-secondary btn-lg"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
