import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0' });

console.log('Testing with responseModalities config...');

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: "Professional technician repairing commercial oven, realistic photo",
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  });

  console.log('Response:', JSON.stringify(response, null, 2).slice(0, 500));

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      console.log('SUCCESS! Image generated');
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync('test-modalities.png', buffer);
      console.log('Saved to: test-modalities.png');
      process.exit(0);
    } else if (part.text) {
      console.log('Text:', part.text.slice(0, 100));
    }
  }
} catch (error) {
  console.error('Error:', error.message.slice(0, 300));
}
