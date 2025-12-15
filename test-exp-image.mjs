import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0' });

// Try the experimental model
const models = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-image-preview',
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview'
];

const prompt = "Professional technician in uniform repairing a commercial oven in a restaurant kitchen, realistic photo";

for (const model of models) {
  console.log(`\nTrying model: ${model}...`);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log('SUCCESS! Image generated');
        console.log('MIME type:', part.inlineData.mimeType);
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(`test-${model.replace(/[^a-z0-9]/gi, '-')}.png`, buffer);
        console.log(`Saved to: test-${model.replace(/[^a-z0-9]/gi, '-')}.png`);
        process.exit(0);
      } else if (part.text) {
        console.log('Got text response:', part.text.slice(0, 100));
      }
    }
  } catch (error) {
    if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('  Quota exceeded (limit: 0)');
    } else {
      console.log('  Error:', error.message.slice(0, 100));
    }
  }
}

console.log('\nAll models failed. Billing required.');
