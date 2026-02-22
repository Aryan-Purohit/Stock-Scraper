// src/content.js

// 1. Create the floating container
const floatWidget = document.createElement('div');
floatWidget.id = "my-stock-extension-widget";

// 2. Style it (Added 'cursor: pointer' to show it's clickable)
Object.assign(floatWidget.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '260px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    zIndex: '999999',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#202124',
    transform: 'translateX(120%)',
    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer' // Makes the mouse a pointer finger on hover
});

// 3. Inject it into the page
document.body.appendChild(floatWidget);

// 4. Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTicker") {
        const ticker = request.ticker;
        
        // Grab the full company name directly from Robinhood's H1 tag
        const h1Element = document.querySelector('h1');
        const companyName = h1Element ? h1Element.innerText : ticker;
        
        // Make the widget clickable to open Yahoo Finance
        floatWidget.onclick = () => {
            window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
        };

        // Loading State Layout (Name first)
        floatWidget.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; color: #202124; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${companyName}
            </div>
            <div style="font-size: 12px; color: #80868b;">Fetching trend...</div>
        `;
        floatWidget.style.transform = 'translateX(0)'; 
        
        const API_KEY = "d6d8k81r01qgk7ml0g80d6d8k81r01qgk7ml0g8g"; 
        
        // Fetch real-time data
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const currentPrice = data.c.toFixed(2);
                const percentChange = data.dp.toFixed(2);
                const color = percentChange >= 0 ? '#00c805' : '#ff5000';
                const sign = percentChange >= 0 ? '+' : '';

                // Final Layout: Company Name -> Market Trend -> Ticker
                floatWidget.innerHTML = `
                    <div style="font-size: 16px; font-weight: bold; color: #202124; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${companyName}">
                        ${companyName}
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 24px; font-weight: bold; color: ${color};">
                            $${currentPrice}
                        </span>
                        <span style="font-size: 14px; font-weight: bold; color: ${color};">
                            ${sign}${percentChange}%
                        </span>
                    </div>
                    <div style="font-size: 11px; color: #80868b; text-transform: uppercase;">
                        ${ticker} • Click for details
                    </div>
                `;
            })
            .catch(error => {
                floatWidget.innerHTML += `<div style="color: red; font-size: 12px; margin-top: 8px;">Error fetching data.</div>`;
            });

        // Hide after 8 seconds
        setTimeout(() => {
             floatWidget.style.transform = 'translateX(120%)';
        }, 8000);
    }
});

// 5. Initial check for direct navigation
const currentUrl = window.location.href;
const match = currentUrl.match(/\/stocks\/([A-Z0-9]+)/);
if (match) {
    // Slight delay to ensure Robinhood's H1 has loaded before we read it
    setTimeout(() => {
        chrome.runtime.onMessage.dispatch({action: "updateTicker", ticker: match[1]});
    }, 500);
}