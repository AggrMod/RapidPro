import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Commercial Oven Repair Memphis",
  description: "Expert commercial oven repair in Memphis. Gas, electric, and convection oven service. Same-day appointments available. Call (901) 257-9417.",
  keywords: ["commercial oven repair memphis", "restaurant oven repair", "convection oven repair", "gas oven repair memphis"],
};

const serviceData = {
  title: "Commercial Oven Repair",
  subtitle: "Gas, electric, and convection oven repair for Memphis restaurants and food service businesses.",
  icon: "🔥",
  description: "Your commercial oven is the heart of your kitchen. When it breaks down, your entire operation suffers. Rapid Pro Maintenance provides fast, reliable commercial oven repair throughout Memphis and surrounding areas. Our EPA-certified technicians have experience with all major brands including Vulcan, Garland, Blodgett, and more. We diagnose and repair gas ovens, electric ovens, convection ovens, and combination units.",
  features: [
    "Same-day service available",
    "EPA-certified technicians",
    "All major brands serviced",
    "Gas and electric expertise",
    "Convection oven specialists",
    "Temperature calibration",
    "Heating element replacement",
    "Thermostat repair",
  ],
  commonIssues: [
    {
      issue: "Oven Not Heating",
      description: "Faulty igniter, burner issues, or heating element failure. We diagnose and repair quickly.",
    },
    {
      issue: "Uneven Cooking",
      description: "Convection fan problems, temperature sensor issues, or calibration needed.",
    },
    {
      issue: "Gas Smell",
      description: "Gas leak detection and repair. Safety is our priority.",
    },
    {
      issue: "Temperature Fluctuations",
      description: "Thermostat calibration, sensor replacement, or control board repair.",
    },
    {
      issue: "Door Not Sealing",
      description: "Gasket replacement to maintain proper heat retention.",
    },
    {
      issue: "Pilot Light Issues",
      description: "Pilot assembly cleaning, thermocouple replacement.",
    },
  ],
  faqs: [
    {
      question: "How quickly can you repair my commercial oven?",
      answer: "We offer same-day service for most commercial oven repairs in the Memphis area. Call before noon and we'll typically have a technician to you the same day.",
    },
    {
      question: "Do you repair all brands of commercial ovens?",
      answer: "Yes, our technicians are trained on all major commercial oven brands including Vulcan, Garland, Blodgett, Bakers Pride, Southbend, Imperial, and many more.",
    },
    {
      question: "What does commercial oven repair cost?",
      answer: "Repair costs vary depending on the issue. We provide upfront pricing after diagnosis. Most repairs range from $150-$500 for parts and labor.",
    },
    {
      question: "Should I repair or replace my commercial oven?",
      answer: "Generally, if repair costs exceed 50% of replacement cost, or if your oven is over 15 years old with frequent issues, replacement may be more economical. We'll give you honest advice.",
    },
  ],
  relatedServices: [
    { name: "Commercial Fryer Repair", href: "/services/commercial-fryer-repair", icon: "🍟" },
    { name: "Griddle & Flat Top Repair", href: "/services/griddle-flat-top-repair", icon: "🍳" },
    { name: "Steam Table Repair", href: "/services/steam-table-repair", icon: "♨️" },
  ],
};

export default function CommercialOvenRepairPage() {
  return <ServicePageTemplate {...serviceData} />;
}
