import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Ice Machine Repair Memphis",
  description: "Commercial ice machine repair and maintenance in Memphis. Ice maker service, cleaning, and repair for restaurants and businesses. Call (901) 257-9417.",
  keywords: ["ice machine repair memphis", "commercial ice maker service", "ice machine cleaning", "manitowoc ice machine repair"],
};

const serviceData = {
  title: "Ice Machine Service",
  subtitle: "Commercial ice machine repair, cleaning, and maintenance for Memphis businesses.",
  icon: "🧊",
  description: "Ice is essential for beverages, food preservation, and customer satisfaction. When your ice machine fails, it impacts service quality immediately. Rapid Pro Maintenance provides comprehensive ice machine service throughout Memphis. We repair and maintain all types including cube ice, flake ice, and nugget ice machines. Our technicians are experienced with Manitowoc, Hoshizaki, Scotsman, and all major brands.",
  features: [
    "Same-day emergency service",
    "All ice machine types serviced",
    "EPA-certified technicians",
    "Scale removal and cleaning",
    "Water filter replacement",
    "Compressor repair",
    "Bin thermostat calibration",
    "Preventive maintenance plans",
  ],
  commonIssues: [
    {
      issue: "Not Making Ice",
      description: "Compressor issues, water supply problems, or control board failure.",
    },
    {
      issue: "Ice Production Slow",
      description: "Scale buildup, dirty condenser, or refrigerant issues affecting efficiency.",
    },
    {
      issue: "Ice Tastes Bad",
      description: "Water filter replacement, thorough cleaning, or mold remediation needed.",
    },
    {
      issue: "Ice Melting in Bin",
      description: "Bin thermostat issues, door seal problems, or ambient temperature concerns.",
    },
    {
      issue: "Machine Leaking Water",
      description: "Drain line clogs, water inlet valve issues, or ice buildup in cabinet.",
    },
    {
      issue: "Unusual Noises",
      description: "Fan motor issues, compressor problems, or loose components requiring attention.",
    },
  ],
  faqs: [
    {
      question: "How often should ice machines be cleaned?",
      answer: "We recommend professional cleaning every 6 months. Memphis water is particularly hard, which accelerates scale buildup. High-volume locations may need quarterly service.",
    },
    {
      question: "Why does my ice machine make less ice in summer?",
      answer: "Higher ambient temperatures reduce ice production capacity. Ensure proper ventilation around the unit and consider cleaning the condenser more frequently.",
    },
    {
      question: "Should I use a water filter with my ice machine?",
      answer: "Yes, water filters improve ice quality and protect the machine from scale and sediment. We recommend filter changes every 6 months.",
    },
    {
      question: "What brands of ice machines do you service?",
      answer: "We service all major brands including Manitowoc, Hoshizaki, Scotsman, Ice-O-Matic, Follett, and more.",
    },
  ],
  relatedServices: [
    { name: "Walk-In Cooler Service", href: "/services/walk-in-cooler-service", icon: "❄️" },
    { name: "Commercial Dishwasher Repair", href: "/services/dishwasher-repair", icon: "🍽️" },
    { name: "Commercial Fryer Repair", href: "/services/commercial-fryer-repair", icon: "🍟" },
  ],
};

export default function IceMachineServicePage() {
  return <ServicePageTemplate {...serviceData} />;
}
