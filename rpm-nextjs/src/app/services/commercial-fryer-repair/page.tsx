import { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Commercial Fryer Repair Memphis",
  description: "Professional commercial fryer repair in Memphis. Deep fryer maintenance, thermostat repair, and heating element service. Call (901) 257-9417.",
  keywords: ["commercial fryer repair memphis", "deep fryer repair", "restaurant fryer service", "fryer thermostat repair"],
};

const serviceData = {
  title: "Commercial Fryer Repair",
  subtitle: "Deep fryer repair and maintenance for Memphis restaurants, fast food, and food service operations.",
  icon: "🍟",
  description: "Commercial fryers work hard in busy kitchens, and when they fail, it impacts your menu and profits. Rapid Pro Maintenance specializes in commercial fryer repair throughout Memphis. We service gas and electric fryers from all major manufacturers including Pitco, Frymaster, Henny Penny, and more. From thermostat issues to heating element replacement, we get your fryers back up quickly.",
  features: [
    "Same-day service available",
    "Gas and electric fryer experts",
    "All major brands serviced",
    "Thermostat calibration",
    "Heating element replacement",
    "Oil filtration system repair",
    "Safety valve service",
    "High-efficiency fryer specialists",
  ],
  commonIssues: [
    {
      issue: "Fryer Not Heating",
      description: "Igniter problems, heating element failure, or gas valve issues. Quick diagnosis and repair.",
    },
    {
      issue: "Temperature Problems",
      description: "Thermostat calibration, hi-limit reset, or temperature probe replacement.",
    },
    {
      issue: "Oil Leaking",
      description: "Drain valve repair, gasket replacement, or tank seal service.",
    },
    {
      issue: "Pilot Light Won't Stay Lit",
      description: "Thermocouple replacement, pilot assembly cleaning, or gas pressure adjustment.",
    },
    {
      issue: "Slow Recovery Time",
      description: "Heating element issues, gas pressure problems, or BTU output adjustments.",
    },
    {
      issue: "Automatic Basket Lift Issues",
      description: "Motor repair, timer adjustment, or control board service.",
    },
  ],
  faqs: [
    {
      question: "How often should commercial fryers be serviced?",
      answer: "We recommend professional maintenance every 6 months for high-volume operations, annually for moderate use. Regular service extends equipment life and maintains efficiency.",
    },
    {
      question: "Why is my fryer taking longer to heat up?",
      answer: "Slow heating usually indicates heating element degradation, scale buildup, or gas pressure issues. Our technicians can diagnose and resolve the problem quickly.",
    },
    {
      question: "Can you repair pressure fryers?",
      answer: "Yes, we service all types of commercial fryers including pressure fryers from Henny Penny, BKI, and others. Pressure fryers require specialized knowledge we have.",
    },
    {
      question: "What brands of commercial fryers do you repair?",
      answer: "We repair all major brands including Pitco, Frymaster, Henny Penny, Vulcan, Imperial, Dean, and many more.",
    },
  ],
  relatedServices: [
    { name: "Commercial Oven Repair", href: "/services/commercial-oven-repair", icon: "🔥" },
    { name: "Griddle & Flat Top Repair", href: "/services/griddle-flat-top-repair", icon: "🍳" },
    { name: "Steam Table Repair", href: "/services/steam-table-repair", icon: "♨️" },
  ],
};

export default function CommercialFryerRepairPage() {
  return <ServicePageTemplate {...serviceData} />;
}
