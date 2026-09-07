const { AiService } = require('./dist/src/services/ai.service');

// Mock ai.models.generateContent indirectly by replacing the module
// Actually, it's easier to mock at the service level if we inject it, 
// but since it's hardcoded, we will just test the JSON regex fix by feeding it string payloads directly.

// Let's test the JSON parser logic that we plan to fix.
const testString = `Here is your JSON:
\`\`\`json
{
  "test": 123
}
\`\`\`
Have a good day!`;

function extractJSON(text) {
  let cleaned = text;
  // If it contains markdown json block, extract it
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    cleaned = match[1];
  } else if (text.startsWith('```json')) {
    cleaned = text.replace(/^```json\n/, '').replace(/\n```$/, '');
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error('Failed to parse JSON: ' + cleaned);
  }
}

console.log("Testing JSON extraction:");
console.log(extractJSON(testString));

// Test 2: Context Overflow
async function testContextOverflow() {
  console.log("\\nTesting Context Overflow (100k words)...");
  const hugeText = "React ".repeat(100000);
  try {
    const res = await AiService.analyzeCV(hugeText);
    console.log("Success (Model handled it)");
  } catch (err) {
    console.log("Caught expected error:", err.message);
  }
}

testContextOverflow();
