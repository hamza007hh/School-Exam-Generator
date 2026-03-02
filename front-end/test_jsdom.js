const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('c:/Users/Hamza/Documents/pdf project/pdf project/front-end/index.html', 'utf8');
const scriptContent = fs.readFileSync('c:/Users/Hamza/Documents/pdf project/pdf project/front-end/js/main.js', 'utf8');

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'file:///c:/Users/Hamza/Documents/pdf project/pdf project/front-end/index.html',
    pretendToBeVisual: true
});

dom.window.addEventListener('error', (event) => {
    console.error('CRASH:', event.message || event.error);
});

// Mock localStorage
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => { },
    clear: () => { }
};

try {
    console.log("Evaluating script...");
    const scriptEl = dom.window.document.createElement("script");
    scriptEl.textContent = scriptContent;
    dom.window.document.head.appendChild(scriptEl);

    // Simulate DOMContentLoaded
    console.log("Dispatching DOMContentLoaded...");
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    console.log("Done checking.");
} catch (err) {
    console.error("Syntax or Evaluation Error:", err);
}
