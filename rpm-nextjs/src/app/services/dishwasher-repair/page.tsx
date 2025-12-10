import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Commercial Dishwasher Repair Memphis",
  description: "Commercial dishwasher repair in Memphis. High-temp and low-temp dishwasher service, pump repair, and sanitization system maintenance. Call (901) 257-9417.",
  keywords: ["commercial dishwasher repair memphis", "restaurant dishwasher service", "hobart dishwasher repair", "dish machine repair"],
};

const serviceData = {
  title: "Commercial Dishwasher Repair",
  subtitle: "High-temp and low-temp commercial dishwasher service for Memphis restaurants and food service.",
  icon: "🍽️",
  description: "A broken commercial dishwasher brings your kitchen to a halt. Health codes require proper sanitization, and manual dishwashing can't keep up with restaurant demands. Rapid Pro Maintenance provides expert commercial dishwasher repair throughout Memphis. We service all types including door-type, conveyor, flight-type, and undercounter models from Hobart, Jackson, CMA, and more.",
  features: [
    "Same-day emergency service",
    "High-temp and low-temp specialists",
    "All major brands serviced",
    "Pump and motor repair",
    "Heating element replacement",
    "Sanitization system service",
    "Water temperature calibration",
    "Rinse aid dispenser repair",
  ],
  commonIssues: [
    {
      issue: "Not Cleaning Properly",
      description: "Wash arm clogs, pump issues, or water temperature problems affecting sanitization.",
    },
    {
      issue: "Water Not Draining",
      description: "Drain pump failure, clogged lines, or solenoid valve issues.",
    },
    {
      issue: "Dishes Not Drying",
      description: "Heating element problems, rinse temperature issues, or rinse aid dispenser malfunction.",
    },
    {
      issue: "Machine Not Filling",
      description: "Fill valve issues, float switch problems, or water supply restrictions.",
    },
    {
      issue: "Error Codes Displaying",
      description: "Control board diagnostics, sensor replacement, or system reset.",
    },
    {
      issue: "Sanitization Temperature Low",
      description: "Booster heater repair, thermostat calibration, or heating element service.",
    },
  ],
  faqs: [
    {
      question: "What temperature should my commercial dishwasher reach?",
      answer: "High-temp machines should reach 180°F for sanitization. Low-temp machines use chemical sanitizers at lower temperatures. We calibrate both types.",
    },
    {
      question: "Why is my dishwasher leaving spots on dishes?",
      answer: "Spots usually indicate rinse aid dispenser issues, water temperature problems, or hard water buildup. We can diagnose and fix the cause.",
    },
    {
      question: "How often should commercial dishwashers be serviced?",
      answer: "We recommend quarterly maintenance for high-volume restaurants. This includes deliming, gasket inspection, and temperature verification.",
    },
    {
      question: "Can you repair Hobart dishwashers?",
      answer: "Yes, we're experienced with all Hobart models including AM15, CL44e, and conveyor systems. We also service Jackson, CMA, Meiko, and other brands.",
    },
  ],
  relatedServices: [
    { name: "Ice Machine Service", href: "/services/ice-machine-service", icon: "🧊" },
    { name: "Steam Table Repair", href: "/services/steam-table-repair", icon: "♨️" },
    { name: "Walk-In Cooler Service", href: "/services/walk-in-cooler-service", icon: "❄️" },
  ],
};

export default function DishwasherRepairPage() {
  return <ServicePageTemplate {...serviceData} />;
}
