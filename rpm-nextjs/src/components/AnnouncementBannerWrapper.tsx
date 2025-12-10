"use client";

import { useState, useEffect } from "react";
import AnnouncementBanner from "./AnnouncementBanner";
import { getActiveAnnouncement, type Announcement } from "@/data/announcements";

export default function AnnouncementBannerWrapper() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    // Get active announcement on client side
    const active = getActiveAnnouncement();
    setAnnouncement(active);
  }, []);

  if (!announcement) return null;

  return <AnnouncementBanner announcement={announcement} />;
}
