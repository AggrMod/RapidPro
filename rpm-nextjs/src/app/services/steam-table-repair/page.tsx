import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Steam Table Repair Memphis",
  description: "Commercial steam table and hot holding equipment repair in Memphis. Soup well, bain-marie, and food warmer service. Call (901) 257-9417.",
  keywords: ["steam table repair memphis", "hot holding equipment repair", "soup well repair", "food warmer service"],
};

const serviceData = {
  title: "Steam Table Repair",
  subtitle: "Steam table, hot holding, and food warming equipment repair for Memphis food service.",
  icon: "♨️",
  description: "Steam tables and hot holding equipment keep prepared food at safe serving temperatures. When they fail, you risk food safety violations and customer dissatisfaction. Rapid Pro Maintenance provides expert steam table repair throughout Memphis. We service wet and dry steam tables, soup wells, heated holding cabinets, and all hot holding equipment from major manufacturers.",
  features: [
    "Same-day service available",
    "Wet and dry steam table experts",
    "All major brands serviced",
    "Heating element replacement",
    "Thermostat calibration",
    "Water level controls",
    "Drain valve repair",
    "Food safety temperature verification",
  ],
  commonIssues: [
    {
      issue: "Not Heating",
      description: "Heating element failure, thermostat problems, or electrical issues.",
    },
    {
      issue: "Temperature Too Low/High",
      description: "Thermostat calibration, sensor replacement, or control adjustment needed.",
    },
    {
      issue: "Water Leaking",
      description: "Drain valve issues, gasket failure, or pan seal problems.",
    },
    {
      issue: "Water Not Filling",
      description: "Fill valve problems, float switch issues, or water supply restrictions.",
    },
    {
      issue: "Uneven Heating",
      description: "Element failure in multi-well units, or water circulation issues.",
    },
    {
      issue: "Dry Steam Table Issues",
      description: "Element problems, thermostat issues, or heat distribution concerns.",
    },
  ],
  faqs: [
    {
      question: "What temperature should a steam table maintain?",
      answer: "Steam tables should keep food at 140°F or above for food safety. We calibrate thermostats and verify temperatures meet health code requirements.",
    },
    {
      question: "Wet vs dry steam tables - which do you service?",
      answer: "We service both wet (water bath) and dry (no water) steam tables. Each type has different maintenance needs we're experienced with.",
    },
    {
      question: "Why is my steam table using so much water?",
      answer: "Excessive water use often indicates a float valve issue, water level sensor problem, or drain valve leak. We diagnose and repair efficiently.",
    },
    {
      question: "Can you repair heated holding cabinets?",
      answer: "Yes, we service all hot holding equipment including heated cabinets, warming drawers, and heated shelves from all major manufacturers.",
    },
  ],
  relatedServices: [
    { name: "Commercial Oven Repair", href: "/services/commercial-oven-repair", icon: "🔥" },
    { name: "Commercial Dishwasher Repair", href: "/services/dishwasher-repair", icon: "🍽️" },
    { name: "Walk-In Cooler Service", href: "/services/walk-in-cooler-service", icon: "❄️" },
  ],
};

export default function SteamTableRepairPage() {
  return <ServicePageTemplate {...serviceData} />;
}
