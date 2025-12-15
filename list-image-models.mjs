import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0' });

const models = await ai.models.list();
console.log('All available image-related models:\n');

for await (const model of models) {
  if (model.name.includes('image') || model.name.includes('imagen')) {
    console.log('-', model.name);
  }
}
