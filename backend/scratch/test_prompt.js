require('dotenv').config({ path: '../.env' });
const promptBuilder = require('../src/utils/promptBuilder');

async function testPrompt() {
  console.log('Testing Prompt Builder...');
  try {
    const prompt = await promptBuilder.buildSystemPrompt();
    console.log('--- PROMPT START ---');
    console.log(prompt);
    console.log('--- PROMPT END ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Prompt Builder Failed:', error);
    process.exit(1);
  }
}

testPrompt();
