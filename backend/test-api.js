import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key length:', API_KEY ? API_KEY.length : 'NOT FOUND');

if (!API_KEY) {
  console.error('❌ API Key not found in config.env');
  process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
  try {
    console.log('🔄 Testing API connection...');
    
    // Create chat model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Test with a simple message
    const result = await model.generateContent("Hello, can you respond with 'API is working'?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API is working!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔑 Your API key is invalid. Please check it.');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('💰 You have exceeded your API quota.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🚫 Permission denied. Check your API key permissions.');
    }
  }
}

testAPI(); 