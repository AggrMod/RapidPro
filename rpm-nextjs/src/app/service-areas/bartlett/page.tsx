import { Metadata } from "next";
import LocationPageTemplate from "@/components/LocationPageTemplate";

export const metadata: Metadata = {
  title: "Commercial Kitchen Repair Bartlett TN",
  description: "Commercial kitchen equipment repair in Bartlett, TN. Fast, reliable service for restaurants and food service operations. Call (901) 257-9417.",
  keywords: ["commercial kitchen repair bartlett", "restaurant equipment repair bartlett tn", "commercial appliance service bartlett"],
};

const locationData = {
  city: "Bartlett",
  state: "TN",
  tagline: "Reliable commercial kitchen repair for Bartlett's busy restaurants and food service establishments.",
  description: "Bartlett's family-friendly community supports a thriving food service industry. From popular chain restaurants along Stage Road to locally-owned establishments throughout the city, Rapid Pro Maintenance keeps Bartlett businesses running smoothly. Our technicians provide fast, professional repairs that Bartlett business owners can count on.",
  neighborhoods: [
    "Stage Road corridor",
    "Bartlett Station",
    "Appling area",
    "Elmore Park",
    "Singleton area",
    "Yale Road corridor",
  ],
  landmarks: [
    "Bartlett Performing Arts Center",
    "Wolfchase Galleria area",
    "Bartlett Recreation Center",
    "Bartlett City Schools",
    "Stage Road shopping",
    "Singleton Community Center",
  ],
  responseTime: "Under 2.5 hours",
};

export default function BartlettPage() {
  return <LocationPageTemplate {...locationData} />;
}
