import { GoogleGenAI } from "@google/genai";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
import * as fs from "node:fs";

// Load OAuth credentials from Gemini CLI
const creds = JSON.parse(fs.readFileSync('C:/Users/tjdot/.gemini/oauth_creds.json', 'utf8'));

console.log('Setting up OAuth2Client with Gemini CLI tokens...');

// Create OAuth2Client with the credentials
const oauth2Client = new OAuth2Client();
oauth2Client.setCredentials({
  access_token: creds.access_token,
  refresh_token: creds.refresh_token,
  expiry_date: creds.expiry_date,
});

// Try to use the SDK with the OAuth client
// The SDK might accept an authClient option
try {
  const ai = new GoogleGenAI({
    // Try different authentication methods
    httpOptions: {
      headers: {
        'Authorization': `Bearer ${creds.access_token}`
      }
    }
  });

  console.log('Testing with gemini-2.5-flash-image...');

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: "Professional technician repairing commercial oven, realistic photo",
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      console.log('SUCCESS! Image generated');
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync('test-sdk-oauth.png', buffer);
      console.log('Saved to: test-sdk-oauth.png');
      process.exit(0);
    } else if (part.text) {
      console.log('Text:', part.text.slice(0, 100));
    }
  }
} catch (error) {
  console.error('Error:', error.message);
}
