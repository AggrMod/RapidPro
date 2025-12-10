import { Metadata } from "next";
import LocationPageTemplate from "@/components/LocationPageTemplate";

export const metadata: Metadata = {
  title: "Commercial Kitchen Repair Germantown TN",
  description: "Commercial kitchen equipment repair in Germantown, TN. Same-day service for restaurants and food service businesses. Call (901) 257-9417.",
  keywords: ["commercial kitchen repair germantown", "restaurant equipment repair germantown tn", "commercial appliance service germantown"],
};

const locationData = {
  city: "Germantown",
  state: "TN",
  tagline: "Professional commercial kitchen repair for Germantown's upscale dining establishments and food service operations.",
  description: "Germantown's thriving restaurant scene demands reliable commercial kitchen equipment. From fine dining establishments on Germantown Parkway to popular local eateries, Rapid Pro Maintenance provides the professional service Germantown businesses expect. Our EPA-certified technicians deliver fast, expert repairs that minimize downtime for your operation.",
  neighborhoods: [
    "Old Germantown",
    "Germantown Village",
    "Forest Hill-Irene",
    "Dogwood Park area",
    "Riverdale",
    "Germantown Parkway corridor",
  ],
  landmarks: [
    "Germantown Performing Arts Center",
    "Saddle Creek shopping district",
    "Germantown Athletic Club",
    "Germantown Municipal Park",
    "Germantown Village Square",
    "Forest Hill Elementary area",
  ],
  responseTime: "Under 3 hours",
};

export default function GermantownPage() {
  return <LocationPageTemplate {...locationData} />;
}
