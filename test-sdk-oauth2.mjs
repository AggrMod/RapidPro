import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

// Load OAuth credentials from Gemini CLI
const creds = JSON.parse(fs.readFileSync('C:/Users/tjdot/.gemini/oauth_creds.json', 'utf8'));

console.log('Setting up GoogleGenAI with OAuth credentials...');

// The SDK accepts googleAuthOptions which can include an access_token
const ai = new GoogleGenAI({
  googleAuthOptions: {
    credentials: {
      client_email: '', // Not needed for OAuth
      private_key: '',  // Not needed for OAuth
    },
    // Pass access token directly
    accessToken: creds.access_token,
  }
});

console.log('Testing with gemini-2.5-flash-image...');

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: "Professional technician repairing commercial oven, realistic photo",
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      console.log('SUCCESS! Image generated');
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync('test-sdk-oauth2.png', buffer);
      console.log('Saved to: test-sdk-oauth2.png');
      process.exit(0);
    } else if (part.text) {
      console.log('Text:', part.text.slice(0, 100));
    }
  }
} catch (error) {
  console.error('Error:', error.message.slice(0, 200));
}
