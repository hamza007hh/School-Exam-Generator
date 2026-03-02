const fs = require('fs');
const html = fs.readFileSync('c:/Users/Hamza/Documents/pdf project/pdf project/front-end/index.html', 'utf8');
const js = fs.readFileSync('c:/Users/Hamza/Documents/pdf project/pdf project/front-end/js/main.js', 'utf8');

const missingIds = [];
const matches = [...js.matchAll(/document\.getElementById\('([^']+)'\)/g)].map(m => m[1]);

matches.forEach(id => {
    if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
        missingIds.push(id);
    }
});

console.log([...new Set(missingIds)]);
