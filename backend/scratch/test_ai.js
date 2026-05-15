require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
  console.log('Testing Gemini API...');
  console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Hello, are you there?");
    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
       console.error('Response Error:', error.response.data);
    }
  }
}

testAI();
