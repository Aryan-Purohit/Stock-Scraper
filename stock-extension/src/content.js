// src/content.js

// 1. Create the floating container just once
const floatWidget = document.createElement('div');
floatWidget.id = "my-stock-extension-widget";

// 2. Style it with a Honey-style CSS transition
Object.assign(floatWidget.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '250px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    zIndex: '999999',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#202124',
    
    // THE ANIMATION MAGIC: Start off-screen to the right, and add a smooth slide transition
    transform: 'translateX(120%)',
    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
});

// 3. Inject it into the page hidden
document.body.appendChild(floatWidget);

// 4. Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTicker") {
        console.log(`[Content Script] Received ticker: ${request.ticker}`);
        
        // Update the HTML inside the widget
        floatWidget.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #5f6368;">Analyzing Stock</h3>
            <div style="font-size: 28px; font-weight: bold; color: #00c805; margin-bottom: 8px;">
                ${request.ticker}
            </div>
            <div style="font-size: 12px; color: #80868b;">
                Fetching live data...
            </div>
        `;
        
        // Slide it in!
        floatWidget.style.transform = 'translateX(0)';
        
        // Optional: Slide it back out after 5 seconds
        setTimeout(() => {
             floatWidget.style.transform = 'translateX(120%)';
        }, 5000);
    }
});

// 5. Initial check just in case we load directly onto a stock page
const currentUrl = window.location.href;
const match = currentUrl.match(/\/stocks\/([A-Z0-9]+)/);
if (match) {
    // Manually trigger the listener logic for the first load
    chrome.runtime.onMessage.dispatch({action: "updateTicker", ticker: match[1]});
}