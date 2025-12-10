// FAQ data - can be imported by both server and client components

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const defaultFAQs: FAQItem[] = [
  {
    question: "What types of commercial kitchen equipment do you repair?",
    answer:
      "We repair all major commercial kitchen equipment including ovens, ranges, fryers, refrigerators, walk-in coolers, ice machines, dishwashers, steam tables, grills, and ventilation systems. Our EPA-certified technicians are trained to work on all major brands.",
    category: "Services",
  },
  {
    question: "How quickly can you respond to an emergency repair call?",
    answer:
      "For emergency calls in Memphis, we typically respond within 2 hours. For surrounding areas like Germantown, Collierville, Bartlett, and Cordova, our response time is usually under 3 hours. We offer 24/7 emergency service for critical equipment failures.",
    category: "Response Time",
  },
  {
    question: "Do you offer same-day service?",
    answer:
      "Yes! We offer same-day service for most repairs. If you call before noon, we can usually have a technician at your location the same day. Emergency calls are prioritized and handled immediately regardless of the time.",
    category: "Response Time",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We serve the greater Memphis metro area including Memphis, Germantown, Collierville, Bartlett, Cordova, Southaven (MS), and surrounding communities. Contact us if you're outside these areas - we may still be able to help.",
    category: "Service Areas",
  },
  {
    question: "Are your technicians certified?",
    answer:
      "Yes, all our technicians are EPA 608 certified for refrigerant handling, which is required for working on any refrigeration equipment. They also receive ongoing training on the latest commercial kitchen equipment and repair techniques.",
    category: "Qualifications",
  },
  {
    question: "Do you provide warranties on repairs?",
    answer:
      "Yes, we stand behind our work with a 90-day warranty on parts and labor for all repairs. If an issue recurs within the warranty period related to our repair, we'll fix it at no additional charge.",
    category: "Warranty",
  },
  {
    question: "How much does a typical repair cost?",
    answer:
      "Repair costs vary depending on the equipment type, issue, and parts needed. We provide upfront pricing before beginning any work, so you'll know the cost before we start. We also offer free diagnostic visits when you proceed with the repair.",
    category: "Pricing",
  },
  {
    question: "Can you service equipment that's still under manufacturer warranty?",
    answer:
      "Yes, we can work on equipment under warranty. However, we recommend checking with your manufacturer first, as some warranties require authorized service providers. We're happy to coordinate with manufacturers when needed.",
    category: "Warranty",
  },
  {
    question: "Do you stock common replacement parts?",
    answer:
      "Yes, our service vehicles are stocked with common replacement parts for most major brands. This allows us to complete many repairs on the first visit. For specialized parts, we can usually source them within 24-48 hours.",
    category: "Parts",
  },
  {
    question: "What should I do if my walk-in cooler stops working?",
    answer:
      "First, check that the unit is receiving power and the thermostat settings haven't been changed. Avoid opening the door frequently to preserve cold air. If it's still not working, call us immediately - a failing walk-in cooler can lead to significant food loss. We prioritize refrigeration emergencies.",
    category: "Emergency Tips",
  },
];
