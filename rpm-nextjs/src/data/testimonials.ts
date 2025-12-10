// Testimonials data - easily manageable customer reviews
// Edit this file to add, remove, or modify testimonials

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  businessType: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
  verified: boolean;
  source: "google" | "yelp" | "direct" | "facebook";
  featured?: boolean;
  serviceType?: string;
}

// All testimonials - sorted by date (newest first)
export const testimonials: Testimonial[] = [
  {
    id: "marcus-johnson-2024",
    name: "Marcus Johnson",
    business: "Soul Food Kitchen",
    businessType: "Restaurant",
    location: "Memphis, TN",
    rating: 5,
    text: "Our fryer went out during the Friday dinner rush. Called Rapid Pro and they had a tech here within 2 hours. Fixed it right the first time. These guys are lifesavers!",
    date: "2024-11-15",
    verified: true,
    source: "google",
    featured: true,
    serviceType: "Fryer Repair",
  },
  {
    id: "patricia-williams-2024",
    name: "Patricia Williams",
    business: "Germantown Country Club",
    businessType: "Country Club",
    location: "Germantown, TN",
    rating: 5,
    text: "We've used Rapid Pro for all our commercial kitchen equipment for 3 years now. Their preventive maintenance program has saved us thousands in emergency repairs. Highly professional team.",
    date: "2024-10-20",
    verified: true,
    source: "direct",
    featured: true,
    serviceType: "Preventive Maintenance",
  },
  {
    id: "james-chen-2024",
    name: "James Chen",
    business: "Lucky Dragon Restaurant",
    businessType: "Restaurant",
    location: "Collierville, TN",
    rating: 5,
    text: "Fast, honest, and reasonably priced. Fixed our walk-in cooler on a Saturday when everyone else said Monday. Will definitely use again.",
    date: "2024-10-10",
    verified: true,
    source: "google",
    featured: true,
    serviceType: "Walk-in Cooler Repair",
  },
  {
    id: "sandra-mitchell-2024",
    name: "Sandra Mitchell",
    business: "Bartlett Elementary School",
    businessType: "School Cafeteria",
    location: "Bartlett, TN",
    rating: 5,
    text: "As a school food service director, I need reliable vendors. Rapid Pro handles all our commercial dishwashers and steam tables. Always on time, always professional.",
    date: "2024-09-25",
    verified: true,
    source: "direct",
    serviceType: "Dishwasher Service",
  },
  {
    id: "robert-taylor-2024",
    name: "Robert Taylor",
    business: "BBQ Boss Smokehouse",
    businessType: "BBQ Restaurant",
    location: "Memphis, TN",
    rating: 5,
    text: "These folks know their stuff! Fixed our smoker's temperature issues that two other companies couldn't figure out. True experts in commercial equipment.",
    date: "2024-09-15",
    verified: true,
    source: "google",
    serviceType: "Smoker Repair",
  },
  {
    id: "maria-rodriguez-2024",
    name: "Maria Rodriguez",
    business: "El Sol Mexican Grill",
    businessType: "Restaurant",
    location: "Cordova, TN",
    rating: 5,
    text: "Emergency service on a holiday weekend - they came through when we needed them most. Our griddle is running better than ever. Thank you Rapid Pro!",
    date: "2024-08-30",
    verified: true,
    source: "direct",
    serviceType: "Griddle Repair",
  },
  {
    id: "david-anderson-2024",
    name: "David Anderson",
    business: "Hampton Inn Memphis Airport",
    businessType: "Hotel",
    location: "Memphis, TN",
    rating: 5,
    text: "Professional service from start to finish. They serviced all our breakfast kitchen equipment and even identified a potential problem with our ice machine before it failed.",
    date: "2024-08-15",
    verified: true,
    source: "google",
    serviceType: "Ice Machine Service",
  },
  {
    id: "lisa-thompson-2024",
    name: "Lisa Thompson",
    business: "Sweet Dreams Bakery",
    businessType: "Bakery",
    location: "Memphis, TN",
    rating: 5,
    text: "Our commercial ovens are critical to our business. Rapid Pro keeps them running perfectly. They understand that downtime costs us money and they work quickly.",
    date: "2024-07-20",
    verified: true,
    source: "direct",
    serviceType: "Oven Repair",
  },
  {
    id: "michael-brown-2024",
    name: "Michael Brown",
    business: "Sunrise Senior Living",
    businessType: "Senior Care Facility",
    location: "Germantown, TN",
    rating: 5,
    text: "We can't afford equipment failures with 150 residents depending on us. Rapid Pro's maintenance contract gives us peace of mind. Excellent response time.",
    date: "2024-07-10",
    verified: true,
    source: "google",
    serviceType: "Maintenance Contract",
  },
];

// Helper functions

// Get all testimonials
export function getAllTestimonials(): Testimonial[] {
  return [...testimonials].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get featured testimonials (for homepage)
export function getFeaturedTestimonials(limit = 3): Testimonial[] {
  return testimonials
    .filter((t) => t.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Get testimonials by location
export function getTestimonialsByLocation(location: string): Testimonial[] {
  return testimonials.filter((t) =>
    t.location.toLowerCase().includes(location.toLowerCase())
  );
}

// Get testimonials by service type
export function getTestimonialsByService(serviceType: string): Testimonial[] {
  return testimonials.filter((t) =>
    t.serviceType?.toLowerCase().includes(serviceType.toLowerCase())
  );
}

// Get testimonials by business type
export function getTestimonialsByBusinessType(businessType: string): Testimonial[] {
  return testimonials.filter((t) =>
    t.businessType.toLowerCase().includes(businessType.toLowerCase())
  );
}

// Calculate aggregate rating
export function getAggregateRating() {
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
  return {
    ratingValue: (total / testimonials.length).toFixed(1),
    reviewCount: testimonials.length,
    bestRating: 5,
    worstRating: 1,
  };
}

// Get unique business types
export function getBusinessTypes(): string[] {
  const types = new Set(testimonials.map((t) => t.businessType));
  return Array.from(types).sort();
}

// Get unique locations
export function getLocations(): string[] {
  const locations = new Set(testimonials.map((t) => t.location));
  return Array.from(locations).sort();
}

// Format date for display
export function formatTestimonialDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
