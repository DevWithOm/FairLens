import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('--- API Diagnostic ---');
  console.log('API Key present:', !!apiKey);
  if (apiKey) {
    console.log('API Key starts with:', apiKey.substring(0, 7));
    console.log('API Key length:', apiKey.length);
  }

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('ERROR: No valid API key found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash'
  ];

  for (const modelName of modelsToTest) {
    console.log(`\nTesting model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'System Online'");
      console.log(`SUCCESS [${modelName}]:`, result.response.text());
    } catch (error) {
      console.log(`FAILED [${modelName}]:`, error.message);
    }
  }
}

testGemini();
