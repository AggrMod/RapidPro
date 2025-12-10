import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Walk-In Cooler & Freezer Repair Memphis",
  description: "Walk-in cooler and freezer repair in Memphis. Commercial refrigeration service, compressor repair, and emergency cooling. Call (901) 257-9417.",
  keywords: ["walk-in cooler repair memphis", "walk-in freezer repair", "commercial refrigeration service", "cooler compressor repair"],
};

const serviceData = {
  title: "Walk-In Cooler Service",
  subtitle: "Walk-in cooler and freezer repair, maintenance, and emergency service for Memphis businesses.",
  icon: "❄️",
  description: "Walk-in coolers and freezers protect your most valuable inventory. A failure can mean thousands in spoiled food and health code violations. Rapid Pro Maintenance provides 24/7 emergency walk-in cooler service throughout Memphis. Our EPA-certified technicians handle everything from temperature issues to compressor replacement. We service all brands and keep your cold storage running reliably.",
  features: [
    "24/7 emergency service",
    "EPA-certified technicians",
    "All brands serviced",
    "Compressor repair/replacement",
    "Evaporator coil service",
    "Door gasket replacement",
    "Temperature monitoring",
    "Preventive maintenance plans",
  ],
  commonIssues: [
    {
      issue: "Not Cooling Properly",
      description: "Low refrigerant, compressor issues, or evaporator coil problems requiring diagnosis.",
    },
    {
      issue: "Freezing Up",
      description: "Defrost system failure, airflow restrictions, or thermostat malfunction.",
    },
    {
      issue: "Compressor Running Constantly",
      description: "Refrigerant leak, dirty condenser, or door seal issues causing overwork.",
    },
    {
      issue: "Ice Buildup on Coils",
      description: "Defrost timer, heater, or thermostat issues preventing proper defrost cycles.",
    },
    {
      issue: "Door Not Sealing",
      description: "Worn gaskets, misaligned hinges, or door closer problems.",
    },
    {
      issue: "Unusual Noises",
      description: "Fan motor issues, compressor problems, or refrigerant flow restrictions.",
    },
  ],
  faqs: [
    {
      question: "How quickly can you respond to a walk-in cooler emergency?",
      answer: "We offer 24/7 emergency service. For cooler failures threatening food safety, we prioritize same-day response, often within 2-4 hours.",
    },
    {
      question: "What temperature should my walk-in cooler maintain?",
      answer: "Walk-in coolers should maintain 35-38°F. Walk-in freezers should stay at 0°F or below. We calibrate and verify temperatures during service.",
    },
    {
      question: "How can I prevent walk-in cooler breakdowns?",
      answer: "Regular maintenance is key: clean condenser coils monthly, check door seals, and schedule professional service twice yearly.",
    },
    {
      question: "Do you repair walk-in freezers too?",
      answer: "Yes, we service both walk-in coolers and freezers. Our technicians are experienced with all commercial refrigeration systems.",
    },
  ],
  relatedServices: [
    { name: "Ice Machine Service", href: "/services/ice-machine-service", icon: "🧊" },
    { name: "Commercial Dishwasher Repair", href: "/services/dishwasher-repair", icon: "🍽️" },
    { name: "Commercial Oven Repair", href: "/services/commercial-oven-repair", icon: "🔥" },
  ],
};

export default function WalkInCoolerServicePage() {
  return <ServicePageTemplate {...serviceData} />;
}
