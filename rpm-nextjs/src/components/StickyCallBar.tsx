"use client";

import { useState, useEffect } from "react";
import styles from "./StickyCallBar.module.css";

export default function StickyCallBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approx 500px)
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`${styles.stickyBar} ${isVisible ? styles.visible : ""}`}>
      <a href="tel:+19012579417" className={styles.callBtn}>
        <span className={styles.icon}>📞</span>
        <span className={styles.text}>Call Now: (901) 257-9417</span>
      </a>
    </div>
  );
}
