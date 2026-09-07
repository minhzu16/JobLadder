const fs = require('fs');
const js = fs.readFileSync('jobladder-js.txt', 'utf8');

// Find all string literals looking like paths
const pathRegex = /(?:\"|\'|\`)([\/a-zA-Z0-9_\-]+(?:\/[a-zA-Z0-9_\-]+)+)(?:\"|\'|\`)/g;
const paths = new Set();
let match;
while ((match = pathRegex.exec(js)) !== null) {
  paths.add(match[1]);
}

const keywords = ['api', 'auth', 'user', 'job', 'cv', 'chat', 'roadmap', 'ai', 'upload', 'resume', 'apply', 'premium'];

const relevantPaths = Array.from(paths).filter(p => {
  const pLower = p.toLowerCase();
  return keywords.some(k => pLower.includes(k)) && 
         !pLower.includes('next') && 
         !pLower.includes('react') &&
         !pLower.includes('chunk') &&
         pLower.length > 3;
});

console.log('--- FOUND POTENTIAL API PATHS & APP ROUTES ---');
relevantPaths.sort().forEach(p => console.log(p));

// Look for query keys in react-query
const queryKeyRegex = /queryKey:\[(?:\"|\')([^\"\']+)(?:\"|\')/g;
const queryKeys = new Set();
while ((match = queryKeyRegex.exec(js)) !== null) {
  queryKeys.add(match[1]);
}
if (queryKeys.size > 0) {
  console.log('\n--- FOUND REACT-QUERY KEYS ---');
  Array.from(queryKeys).sort().forEach(p => console.log(p));
}
