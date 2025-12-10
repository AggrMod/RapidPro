import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Griddle & Flat Top Repair Memphis",
  description: "Commercial griddle and flat top repair in Memphis. Gas and electric griddle service, thermostat calibration, and surface repair. Call (901) 257-9417.",
  keywords: ["commercial griddle repair memphis", "flat top grill repair", "restaurant griddle service", "griddle thermostat repair"],
};

const serviceData = {
  title: "Griddle & Flat Top Repair",
  subtitle: "Commercial griddle and flat top grill repair for Memphis restaurants and food service.",
  icon: "🍳",
  description: "Commercial griddles and flat tops are workhorses in busy kitchens. From breakfast diners to burger joints, these units see constant use. Rapid Pro Maintenance provides expert griddle repair throughout Memphis. We service gas and electric griddles from all major manufacturers including Vulcan, Garland, Star, and more. Whether it's uneven heating or thermostat issues, we get your griddle back to perfect performance.",
  features: [
    "Same-day service available",
    "Gas and electric griddle experts",
    "All major brands serviced",
    "Thermostat calibration",
    "Heating element replacement",
    "Surface leveling",
    "Burner tube cleaning",
    "Grease management repair",
  ],
  commonIssues: [
    {
      issue: "Uneven Heating",
      description: "Burner issues, warped surface, or thermostat problems causing hot and cold spots.",
    },
    {
      issue: "Not Heating at All",
      description: "Igniter failure, gas valve problems, or heating element burnout.",
    },
    {
      issue: "Temperature Fluctuations",
      description: "Thermostat calibration needed, sensor issues, or control problems.",
    },
    {
      issue: "Gas Smell",
      description: "Gas leak detection and repair for safe operation.",
    },
    {
      issue: "Grease Trough Issues",
      description: "Drainage problems, trough damage, or grease management system repair.",
    },
    {
      issue: "Surface Damage",
      description: "Warping, pitting, or coating issues affecting cooking performance.",
    },
  ],
  faqs: [
    {
      question: "Why does my griddle have hot and cold spots?",
      answer: "Uneven heating usually indicates burner issues, surface warping, or thermostat problems. We diagnose the cause and restore even heat distribution.",
    },
    {
      question: "How often should commercial griddles be serviced?",
      answer: "We recommend annual professional service including thermostat calibration, burner cleaning, and safety inspection. High-volume operations may benefit from semi-annual service.",
    },
    {
      question: "Can warped griddle surfaces be repaired?",
      answer: "Minor warping can sometimes be addressed, but severe warping typically requires surface replacement. We'll assess and provide honest recommendations.",
    },
    {
      question: "Do you service chrome-top griddles?",
      answer: "Yes, we service all griddle types including chrome-top, steel, and composite surface griddles from all major manufacturers.",
    },
  ],
  relatedServices: [
    { name: "Commercial Oven Repair", href: "/services/commercial-oven-repair", icon: "🔥" },
    { name: "Commercial Fryer Repair", href: "/services/commercial-fryer-repair", icon: "🍟" },
    { name: "Steam Table Repair", href: "/services/steam-table-repair", icon: "♨️" },
  ],
};

export default function GriddleFlatTopRepairPage() {
  return <ServicePageTemplate {...serviceData} />;
}
