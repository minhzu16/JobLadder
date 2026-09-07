const http = require('https');
const fs = require('fs');

http.get('https://jobladder.tech/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scripts = [...data.matchAll(/src=\"(\/_next\/static\/chunks\/[^\"]+)\"/g)].map(m => 'https://jobladder.tech' + m[1]);
    console.log('Found scripts:', scripts.length);
    
    let allContent = '';
    let completed = 0;
    
    if (scripts.length === 0) {
      console.log('No scripts found');
      return;
    }
    
    scripts.forEach(scriptUrl => {
      http.get(scriptUrl, (sRes) => {
        let chunkData = '';
        sRes.on('data', c => chunkData += c);
        sRes.on('end', () => {
          allContent += chunkData + '\n';
          completed++;
          if (completed === scripts.length) {
            fs.writeFileSync('jobladder-js.txt', allContent);
            console.log('Saved all JS to jobladder-js.txt. Searching for APIs...');
            // Search for things looking like API endpoints
            const apiRoutes = new Set();
            const urlMatches = allContent.match(/https?:\/\/[^\s"'`]+|\/[a-zA-Z0-9_\-\/]+\/api\/[a-zA-Z0-9_\-\/]+/g);
            if (urlMatches) {
              urlMatches.forEach(m => apiRoutes.add(m));
            }
            
            // Search for query keys (React Query/TRPC)
            const queryMatches = allContent.match(/queryKey:\["([^"]+)"\]|trpc\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g);
            if (queryMatches) {
              queryMatches.forEach(m => apiRoutes.add(m));
            }
            
            console.log('--- FOUND API CLUES ---');
            Array.from(apiRoutes).forEach(r => console.log(r));
          }
        });
      });
    });
  });
});
