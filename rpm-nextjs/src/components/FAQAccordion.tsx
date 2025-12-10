"use client";

import { useState } from "react";
import styles from "./FAQAccordion.module.css";
import { defaultFAQs, type FAQItem } from "@/data/faqs";

interface FAQAccordionProps {
  items?: FAQItem[];
  showCategories?: boolean;
}

export default function FAQAccordion({
  items = defaultFAQs,
  showCategories = false,
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Group by category if needed
  const categories = showCategories
    ? [...new Set(items.map((item) => item.category || "General"))]
    : null;

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.item} ${openIndex === index ? styles.open : ""}`}
        >
          <button
            className={styles.question}
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <span className={styles.questionText}>{item.question}</span>
            <span className={styles.icon}>
              {openIndex === index ? "−" : "+"}
            </span>
          </button>
          <div
            id={`faq-answer-${index}`}
            className={styles.answer}
            role="region"
            aria-hidden={openIndex !== index}
          >
            <div className={styles.answerContent}>
              {item.category && (
                <span className={styles.category}>{item.category}</span>
              )}
              <p>{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
