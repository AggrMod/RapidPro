import { GoogleGenAI } from "@google/genai";

// Direct API key - the linda-app pattern
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0';
console.log('Using API key:', apiKey.slice(0, 10) + '...');
const ai = new GoogleGenAI({ apiKey });

console.log('Testing Nano Banana (gemini-2.5-flash-image) image generation...\n');

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: "Professional technician in uniform repairing a commercial oven in a restaurant kitchen, realistic photo",
  });

  console.log('Response received!');

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      console.log('Image generated successfully!');
      console.log('MIME type:', part.inlineData.mimeType);
      console.log('Data length:', part.inlineData.data.length, 'bytes');

      // Save the image
      const fs = await import('node:fs');
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync('test-oven-repair.png', buffer);
      console.log('\nSaved to: test-oven-repair.png');
    } else if (part.text) {
      console.log('Text response:', part.text);
    }
  }
} catch (error) {
  console.error('Error:', error.message);
  if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
    console.log('\n⚠️  Billing not enabled. Enable at: https://aistudio.google.com/billing');
  }
}
