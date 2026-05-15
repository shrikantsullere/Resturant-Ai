require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listAllModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    console.log('Fetching available models for this API key...');
    // The SDK might not have a direct listModels, so we'll use a fetch call to the discovery API if needed
    // But let's try to see if we can get it from the client
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log('No models found in response:', data);
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listAllModels();
