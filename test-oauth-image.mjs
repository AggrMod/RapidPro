import * as fs from "node:fs";

// Load OAuth credentials from Gemini CLI
const creds = JSON.parse(fs.readFileSync('C:/Users/tjdot/.gemini/oauth_creds.json', 'utf8'));

console.log('Using OAuth token from Gemini CLI...');
console.log('Token expires:', new Date(creds.expiry_date).toISOString());

// Check if token is expired
if (Date.now() > creds.expiry_date) {
  console.log('Token expired! Run "gemini" to refresh.');
  process.exit(1);
}

// Use the REST API directly with OAuth token
const prompt = "Professional technician in uniform repairing a commercial oven in a restaurant kitchen, realistic photo";

const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${creds.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE']
    }
  })
});

const data = await response.json();

if (!response.ok) {
  console.error('Error:', JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('Response received!');

// Extract image
for (const part of data.candidates?.[0]?.content?.parts || []) {
  if (part.inlineData) {
    console.log('SUCCESS! Image generated with OAuth');
    console.log('MIME type:', part.inlineData.mimeType);
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync('test-oauth-oven.png', buffer);
    console.log('Saved to: test-oauth-oven.png');
    process.exit(0);
  } else if (part.text) {
    console.log('Text:', part.text.slice(0, 200));
  }
}

console.log('No image in response');
