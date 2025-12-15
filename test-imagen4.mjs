import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0' });

// Imagen 4 models use a different API
const models = [
  'imagen-4.0-fast-generate-001',
  'imagen-4.0-generate-001',
];

const prompt = "Professional technician in uniform repairing a commercial oven in a restaurant kitchen, realistic photo";

for (const model of models) {
  console.log(`\nTrying Imagen model: ${model}...`);

  try {
    // Imagen uses generate_images method
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: { numberOfImages: 1 }
    });

    if (response.generatedImages?.length > 0) {
      const img = response.generatedImages[0];
      console.log('SUCCESS! Image generated');
      const buffer = Buffer.from(img.image.imageBytes, "base64");
      fs.writeFileSync(`test-imagen4.png`, buffer);
      console.log('Saved to: test-imagen4.png');
      process.exit(0);
    }
  } catch (error) {
    if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('  Quota exceeded');
    } else {
      console.log('  Error:', error.message.slice(0, 150));
    }
  }
}

console.log('\nAll Imagen models failed too.');
