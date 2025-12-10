// Announcements data - easily manageable service update announcements

export interface Announcement {
  id: string;
  message: string;
  link?: {
    text: string;
    href: string;
  };
  type: "info" | "promo" | "warning" | "success";
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  dismissible: boolean;
}

// Active announcements - edit this array to update the banner
export const announcements: Announcement[] = [
  {
    id: "holiday-hours-2025",
    message: "Holiday Hours: We're available 24/7 for emergency calls through the holiday season!",
    link: {
      text: "Learn More",
      href: "/faq",
    },
    type: "info",
    startDate: "2025-12-01",
    endDate: "2026-01-05",
    dismissible: true,
  },
  // Add more announcements here as needed
  // {
  //   id: "summer-special-2024",
  //   message: "Summer Special: 15% off preventive maintenance for new customers!",
  //   link: {
  //     text: "Get Quote",
  //     href: "/quote",
  //   },
  //   type: "promo",
  //   startDate: "2024-06-01",
  //   endDate: "2024-08-31",
  //   dismissible: true,
  // },
];

// Helper to get current active announcement
export function getActiveAnnouncement(): Announcement | null {
  const now = new Date();

  for (const announcement of announcements) {
    // Check start date
    if (announcement.startDate) {
      const start = new Date(announcement.startDate);
      if (now < start) continue;
    }

    // Check end date
    if (announcement.endDate) {
      const end = new Date(announcement.endDate);
      // Add a day to include the end date fully
      end.setDate(end.getDate() + 1);
      if (now >= end) continue;
    }

    // Return the first active announcement
    return announcement;
  }

  return null;
}
