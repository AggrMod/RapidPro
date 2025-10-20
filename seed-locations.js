const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample Memphis commercial kitchen locations
const memphisLocations = [
  {
    name: "The Arcade Restaurant",
    address: "540 S Main St, Memphis, TN 38103",
    lat: 35.1385,
    lng: -90.0525,
    status: "pending",
    type: "restaurant",
    industry: "casual dining",
    suggestedPhrases: ["preventative maintenance", "health compliance", "equipment reliability"]
  },
  {
    name: "Central BBQ",
    address: "2249 Central Ave, Memphis, TN 38104",
    lat: 35.1371,
    lng: -89.9845,
    status: "pending",
    type: "restaurant",
    industry: "bbq",
    suggestedPhrases: ["smoker maintenance", "walk-in cooler service", "rapid response"]
  },
  {
    name: "Gus's World Famous Fried Chicken",
    address: "310 S Front St, Memphis, TN 38103",
    lat: 35.1410,
    lng: -90.0525,
    status: "pending",
    type: "restaurant",
    industry: "fast casual",
    suggestedPhrases: ["fryer maintenance", "ventilation service", "equipment lifecycle"]
  },
  {
    name: "The Peabody Memphis - Kitchen",
    address: "149 Union Ave, Memphis, TN 38103",
    lat: 35.1426,
    lng: -90.0518,
    status: "pending",
    type: "hotel",
    industry: "hospitality",
    suggestedPhrases: ["commercial kitchen service", "preventative maintenance", "ensure compliance"]
  },
  {
    name: "Blues City Cafe",
    address: "138 Beale St, Memphis, TN 38103",
    lat: 35.1389,
    lng: -90.0503,
    status: "pending",
    type: "restaurant",
    industry: "casual dining",
    suggestedPhrases: ["equipment inspection", "refrigeration service", "health department ready"]
  },
  {
    name: "Huey's Downtown",
    address: "77 S 2nd St, Memphis, TN 38103",
    lat: 35.1450,
    lng: -90.0515,
    status: "pending",
    type: "restaurant",
    industry: "casual dining",
    suggestedPhrases: ["preventative maintenance", "reduce downtime", "equipment reliability"]
  },
  {
    name: "Memphis Pizza Cafe",
    address: "2087 Madison Ave, Memphis, TN 38104",
    lat: 35.1445,
    lng: -89.9890,
    status: "pending",
    type: "restaurant",
    industry: "pizza",
    suggestedPhrases: ["oven maintenance", "walk-in cooler service", "equipment check"]
  },
  {
    name: "Brother Juniper's College Inn",
    address: "3519 Walker Ave, Memphis, TN 38111",
    lat: 35.1152,
    lng: -89.9430,
    status: "pending",
    type: "restaurant",
    industry: "breakfast",
    suggestedPhrases: ["refrigeration service", "preventative maintenance", "compliance check"]
  },
  {
    name: "The Beauty Shop Restaurant",
    address: "966 S Cooper St, Memphis, TN 38104",
    lat: 35.1275,
    lng: -89.9915,
    status: "pending",
    type: "restaurant",
    industry: "fine dining",
    suggestedPhrases: ["commercial kitchen maintenance", "equipment lifecycle", "service contract"]
  },
  {
    name: "Germantown Commissary",
    address: "2290 S Germantown Rd, Germantown, TN 38138",
    lat: 35.0650,
    lng: -89.7985,
    status: "pending",
    type: "restaurant",
    industry: "bbq",
    suggestedPhrases: ["smoker service", "refrigeration maintenance", "rapid response"]
  },
  {
    name: "Cordelia's Table",
    address: "2316 Germantown Pkwy S, Cordova, TN 38016",
    lat: 35.1195,
    lng: -89.7565,
    status: "pending",
    type: "restaurant",
    industry: "southern cuisine",
    suggestedPhrases: ["preventative maintenance", "equipment inspection", "compliance ready"]
  },
  {
    name: "Local Gastropub",
    address: "10 Brookhaven Cir, Memphis, TN 38117",
    lat: 35.1195,
    lng: -89.8850,
    status: "pending",
    type: "restaurant",
    industry: "gastropub",
    suggestedPhrases: ["commercial equipment service", "maintenance plan", "reduce costs"]
  },
  {
    name: "Le Chardonnay Wine Bar & Bistro",
    address: "2100 Overton Square Ln, Memphis, TN 38104",
    lat: 35.1360,
    lng: -89.9900,
    status: "pending",
    type: "restaurant",
    industry: "fine dining",
    suggestedPhrases: ["refrigeration service", "equipment reliability", "preventative care"]
  },
  {
    name: "Porcellino's Craft Italian",
    address: "4828 Summer Ave, Memphis, TN 38122",
    lat: 35.1475,
    lng: -89.9225,
    status: "pending",
    type: "restaurant",
    industry: "italian",
    suggestedPhrases: ["oven maintenance", "walk-in cooler service", "equipment inspection"]
  },
  {
    name: "Methodist Le Bonheur Healthcare - Cafeteria",
    address: "1211 Union Ave, Memphis, TN 38104",
    lat: 35.1385,
    lng: -89.9990,
    status: "pending",
    type: "healthcare",
    industry: "healthcare food service",
    suggestedPhrases: ["commercial kitchen service", "health compliance", "equipment maintenance"]
  }
];

async function seedLocations() {
  console.log('Starting to seed locations...');

  try {
    const batch = db.batch();

    for (const location of memphisLocations) {
      const docRef = db.collection('locations').doc();
      batch.set(docRef, {
        ...location,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastVisited: null,
        lastEfficacyScore: null
      });
      console.log(`Added: ${location.name}`);
    }

    await batch.commit();
    console.log(`\n✓ Successfully seeded ${memphisLocations.length} locations!`);

    // Verify the data
    const snapshot = await db.collection('locations').get();
    console.log(`Total locations in database: ${snapshot.size}`);

  } catch (error) {
    console.error('Error seeding locations:', error);
  } finally {
    process.exit();
  }
}

seedLocations();
