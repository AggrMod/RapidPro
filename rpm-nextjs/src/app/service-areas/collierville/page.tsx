import { Metadata } from "next";
import LocationPageTemplate from "@/components/LocationPageTemplate";

export const metadata: Metadata = {
  title: "Commercial Kitchen Repair Collierville TN",
  description: "Commercial kitchen equipment repair in Collierville, TN. Same-day service for restaurants and food service. EPA-certified technicians. Call (901) 257-9417.",
  keywords: ["commercial kitchen repair collierville", "restaurant equipment repair collierville tn", "commercial appliance service collierville"],
};

const locationData = {
  city: "Collierville",
  state: "TN",
  tagline: "Expert commercial kitchen repair serving Collierville's growing restaurant and hospitality industry.",
  description: "Collierville's charming town square and expanding commercial districts are home to diverse dining options. From historic downtown restaurants to new establishments in the growing areas, Rapid Pro Maintenance provides reliable commercial kitchen equipment repair throughout Collierville. We understand the importance of maintaining your equipment to serve this discerning community.",
  neighborhoods: [
    "Historic Town Square",
    "Schilling Farms",
    "Houston Levee corridor",
    "Byhalia Road area",
    "Wolf River area",
    "Bailey Station",
  ],
  landmarks: [
    "Collierville Town Square",
    "Carriage Crossing shopping",
    "Collierville schools",
    "Baptist Memorial Hospital",
    "Collierville Athletic Complex",
    "Wolf River Nature Area",
  ],
  responseTime: "Under 3 hours",
};

export default function ColliervillePage() {
  return <LocationPageTemplate {...locationData} />;
}
