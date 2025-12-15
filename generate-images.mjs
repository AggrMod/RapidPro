import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY });

const FUNNELS = [
  {
    slug: 'memphis-commercial-oven-repair',
    prompt: 'Professional technician in uniform repairing a large stainless steel commercial oven in a restaurant kitchen, realistic photo, well-lit, professional setting'
  },
  {
    slug: 'memphis-fryer-repair',
    prompt: 'Professional technician servicing a commercial deep fryer in a restaurant kitchen, realistic photo, clean professional environment'
  },
  {
    slug: 'memphis-dishwasher-repair',
    prompt: 'Professional technician repairing a large commercial dishwasher machine in a restaurant kitchen, realistic photo, industrial setting'
  },
  {
    slug: 'memphis-ice-machine-service',
    prompt: 'Professional technician maintaining a commercial ice machine, realistic photo, restaurant kitchen setting'
  },
  {
    slug: 'memphis-walk-in-cooler-maintenance',
    prompt: 'Professional technician inspecting walk-in cooler door gaskets and seals, realistic photo, commercial kitchen'
  },
  {
    slug: 'memphis-steam-table-repair',
    prompt: 'Professional technician repairing a commercial steam table in a restaurant buffet area, realistic photo'
  },
  {
    slug: 'memphis-griddle-repair',
    prompt: 'Professional technician servicing a flat top commercial griddle in a busy restaurant kitchen, realistic photo'
  },
  {
    slug: 'germantown-kitchen-equipment-repair',
    prompt: 'Professional kitchen equipment technician with tools servicing restaurant equipment, realistic photo, commercial kitchen'
  },
  {
    slug: 'collierville-restaurant-equipment-service',
    prompt: 'Professional technician in uniform repairing commercial restaurant equipment, realistic photo, modern kitchen'
  },
  {
    slug: 'bartlett-commercial-appliance-repair',
    prompt: 'Professional appliance repair technician working on commercial kitchen equipment, realistic photo, professional setting'
  }
];

async function generateImage(funnel) {
  console.log(`Generating image for ${funnel.slug}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: funnel.prompt,
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        const imagePath = path.join('images', 'funnel', `${funnel.slug}.png`);

        // Ensure directory exists
        fs.mkdirSync(path.join('images', 'funnel'), { recursive: true });

        fs.writeFileSync(imagePath, buffer);
        console.log(`  Saved: ${imagePath}`);
        return imagePath;
      }
    }
  } catch (error) {
    console.error(`  Error: ${error.message}`);
  }
  return null;
}

async function main() {
  console.log('Generating funnel images with Gemini 2.5 Flash Image (Nano Banana)...\n');

  for (const funnel of FUNNELS) {
    await generateImage(funnel);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nDone!');
}

main();
