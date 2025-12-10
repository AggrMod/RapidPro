import { Metadata } from "next";
import LocationPageTemplate from "@/components/LocationPageTemplate";

export const metadata: Metadata = {
  title: "Commercial Kitchen Repair Cordova TN",
  description: "Commercial kitchen equipment repair in Cordova, TN. Same-day service for restaurants, hotels, and food service. Call (901) 257-9417.",
  keywords: ["commercial kitchen repair cordova", "restaurant equipment repair cordova tn", "commercial appliance service cordova"],
};

const locationData = {
  city: "Cordova",
  state: "TN",
  tagline: "Fast, professional commercial kitchen repair serving Cordova's diverse restaurant and hospitality scene.",
  description: "Cordova's strategic location makes it a hub for dining and hospitality businesses in the Memphis metro area. From restaurants near Wolfchase to food service operations throughout the community, Rapid Pro Maintenance provides the reliable commercial kitchen equipment repair Cordova businesses need. Our central location means fast response times for your operation.",
  neighborhoods: [
    "Wolfchase area",
    "Germantown Parkway corridor",
    "Macon Road area",
    "Dexter Road corridor",
    "Shelby Farms area",
    "Trinity Road area",
  ],
  landmarks: [
    "Wolfchase Galleria",
    "Shelby Farms Park",
    "Cordova High School",
    "Bert Ferguson Community Center",
    "Germantown Parkway restaurants",
    "Trinity Road shopping",
  ],
  responseTime: "Under 2 hours",
};

export default function CordovaPage() {
  return <LocationPageTemplate {...locationData} />;
}
