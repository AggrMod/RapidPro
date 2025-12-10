import { Metadata } from "next";
import TestimonialCard from "@/components/TestimonialCard";
import {
  getAllTestimonials,
  getAggregateRating,
  formatTestimonialDate,
} from "@/data/testimonials";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Customer Reviews & Testimonials",
  description:
    "Read what Memphis restaurant owners say about Rapid Pro Maintenance. 5-star reviews for commercial kitchen equipment repair from verified local businesses.",
};

// Get testimonials and aggregate rating from centralized data
const testimonials = getAllTestimonials();
const aggregateRating = getAggregateRating();

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
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                name={testimonial.name}
                business={testimonial.business}
                businessType={testimonial.businessType}
                location={testimonial.location}
                rating={testimonial.rating}
                text={testimonial.text}
                date={formatTestimonialDate(testimonial.date)}
                verified={testimonial.verified}
                source={testimonial.source}
              />
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
