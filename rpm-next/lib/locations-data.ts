export interface LocationData {
    slug: string;
    name: string;
    seoTitle: string;
    seoDesc: string;
    description: string;
    landmarks: string[];
    travelTime: string; // e.g. "20 mins from HQ"
}

export const locationsData: LocationData[] = [
    {
        slug: "germantown-restaurant-equipment-repair",
        name: "Germantown",
        seoTitle: "Germantown Commercial Kitchen Repair | Restaurant Equipment Service",
        seoDesc: "Expert restaurant equipment repair in Germantown, TN. We service Saddle Creek, Poplar Ave corridor, and all local eateries. Fast, reliable, local.",
        description: "Serving Germantown's premier dining establishments with discreet, professional equipment repair. From fine dining to fast casual, we keep your kitchen running.",
        landmarks: ["Saddle Creek", "Methodist Germantown Hospital", "Poplar Pike"],
        travelTime: "15-20 mins"
    },
    {
        slug: "collierville-restaurant-equipment-service",
        name: "Collierville",
        seoTitle: "Collierville Restaurant Equipment Service | Commercial Appliance Repair",
        seoDesc: "Collierville's trusted commercial kitchen repair. Serving Town Square and Houston Levee area. Same-day service available.",
        description: "Reliable commercial appliance repair for Collierville businesses. We understand the high standards of the Town Square and Houston Levee dining scenes.",
        landmarks: ["Town Square", "Carriage Crossing", "Houston Levee"],
        travelTime: "25-30 mins"
    },
    {
        slug: "bartlett-commercial-appliance-repair",
        name: "Bartlett",
        seoTitle: "Bartlett Commercial Appliance Repair | Kitchen Equipment",
        seoDesc: "Commercial kitchen repair in Bartlett, TN. Stage Road and Wolfchase area service. Ovens, fryers, and refrigeration.",
        description: "Fast response times for Bartlett restaurants. We cover the entire Stage Road corridor and Wolfchase area.",
        landmarks: ["Wolfchase Galleria", "Stage Road", "Bartlett Blvd"],
        travelTime: "20 mins"
    },
    {
        slug: "cordova-kitchen-equipment-repair",
        name: "Cordova",
        seoTitle: "Cordova Commercial Kitchen Repair Service",
        seoDesc: "Cordova restaurant equipment repair. Germantown Pkwy and Macon Rd coverage. Emergency service available.",
        description: "Supporting the heavy traffic kitchens of Cordova. We know the Germantown Parkway rush requires equipment that works.",
        landmarks: ["Germantown Parkway", "Shelby Farms", "Macon Road"],
        travelTime: "15 mins"
    },
    {
        slug: "southaven-restaurant-equipment-repair",
        name: "Southaven",
        seoTitle: "Southaven MS Restaurant Equipment Repair | DeSoto County",
        seoDesc: "Southaven, MS commercial kitchen repair. Serving Goodman Rd and Tanger Outlets area. Licensed for Mississippi.",
        description: "Cross-border service you can count on. We are fully licensed to operate in Mississippi and serve Southaven daily.",
        landmarks: ["Tanger Outlets", "Goodman Road", "Landers Center"],
        travelTime: "20-25 mins"
    }
];
