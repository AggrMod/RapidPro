"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Announcement } from "@/data/announcements";
import styles from "./AnnouncementBanner.module.css";

interface AnnouncementBannerProps {
  announcement: Announcement;
}

export default function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this announcement was previously dismissed
    const dismissedIds = localStorage.getItem("dismissedAnnouncements");
    if (dismissedIds) {
      const ids = JSON.parse(dismissedIds) as string[];
      if (ids.includes(announcement.id)) {
        setIsDismissed(true);
        return;
      }
    }
    // Show banner with animation
    setIsVisible(true);
  }, [announcement.id]);

  const handleDismiss = () => {
    setIsVisible(false);

    // After animation, mark as dismissed
    setTimeout(() => {
      setIsDismissed(true);

      // Save to localStorage
      const dismissedIds = localStorage.getItem("dismissedAnnouncements");
      const ids = dismissedIds ? JSON.parse(dismissedIds) : [];
      ids.push(announcement.id);
      localStorage.setItem("dismissedAnnouncements", JSON.stringify(ids));
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`${styles.banner} ${styles[announcement.type]} ${isVisible ? styles.visible : ""}`}
      role="alert"
    >
      <div className={styles.content}>
        <span className={styles.icon}>
          {announcement.type === "info" && "ℹ️"}
          {announcement.type === "promo" && "🎉"}
          {announcement.type === "warning" && "⚠️"}
          {announcement.type === "success" && "✓"}
        </span>
        <p className={styles.message}>{announcement.message}</p>
        {announcement.link && (
          <Link href={announcement.link.href} className={styles.link}>
            {announcement.link.text}
          </Link>
        )}
      </div>
      {announcement.dismissible && (
        <button
          onClick={handleDismiss}
          className={styles.dismiss}
          aria-label="Dismiss announcement"
        >
          ✕
        </button>
      )}
    </div>
  );
}
