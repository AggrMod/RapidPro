import { Metadata } from "next";
import LocationPageTemplate from "@/components/LocationPageTemplate";

export const metadata: Metadata = {
  title: "Commercial Kitchen Repair Memphis TN",
  description: "Commercial kitchen equipment repair in Memphis, TN. Same-day service for restaurants, hotels, and food service. EPA-certified technicians. Call (901) 257-9417.",
  keywords: ["commercial kitchen repair memphis", "restaurant equipment repair memphis tn", "commercial appliance repair memphis"],
};

const locationData = {
  city: "Memphis",
  state: "TN",
  tagline: "Memphis' premier commercial kitchen equipment repair service. Serving the entire metro area with fast, reliable repairs.",
  description: "As Memphis' locally-owned commercial kitchen repair specialists, we understand the unique needs of the city's diverse food service industry. From world-famous BBQ joints on Beale Street to hotel kitchens downtown, Rapid Pro Maintenance keeps Memphis cooking. Our technicians know the city inside and out, ensuring the fastest possible response times.",
  neighborhoods: [
    "Downtown Memphis",
    "Midtown",
    "East Memphis",
    "South Memphis",
    "North Memphis",
    "Whitehaven",
    "Frayser",
    "Raleigh",
  ],
  landmarks: [
    "Beale Street restaurants",
    "FedExForum food service",
    "Memphis Convention Center",
    "St. Jude campus cafeterias",
    "University of Memphis dining",
    "Memphis International Airport",
    "Graceland area businesses",
    "Crosstown Concourse",
  ],
  responseTime: "Under 2 hours",
};

export default function MemphisPage() {
  return <LocationPageTemplate {...locationData} />;
}
