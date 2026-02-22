// src/content.js

// 1. Create the floating container once
const floatWidget = document.createElement('div');
floatWidget.id = "my-stock-extension-widget";

// DARK MODE: Updated container styles
Object.assign(floatWidget.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '260px',
    backgroundColor: '#121212', // Deep dark background
    border: '1px solid #333333', // Subtle dark border
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)', // Stronger shadow for dark mode
    padding: '16px',
    zIndex: '999999',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e8eaed', // Off-white main text
    transform: 'translateX(120%)',
    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
});

document.body.appendChild(floatWidget);

// 2. The main function to fetch and render
function fetchAndRenderStock(ticker) {
    // Show loading state and slide in (Dark mode text colors)
    floatWidget.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
            ${ticker}
        </div>
        <div style="font-size: 12px; color: #9aa0a6;">Loading official data...</div>
    `;
    floatWidget.style.transform = 'translateX(0)';
    
    // PUT YOUR API KEY HERE
    const API_KEY = "d6d8k81r01qgk7ml0g80d6d8k81r01qgk7ml0g8g"; 
    
    // Fetch Name, Price, and Risk Metrics simultaneously
    Promise.all([
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${API_KEY}`).then(res => res.json()),
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`).then(res => res.json()),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${API_KEY}`).then(res => res.json())
    ])
    .then(([profileData, quoteData, metricData]) => {
        const companyName = profileData.name || ticker;
        
        const currentPrice = quoteData.c.toFixed(2);
        const percentChange = quoteData.dp.toFixed(2);
        // Green and Red stay the same, they look great in dark mode
        const priceColor = percentChange >= 0 ? '#00c805' : '#ff5000';
        const sign = percentChange >= 0 ? '+' : '';

        const beta = metricData?.metric?.beta || 1.0; 
        let riskText = "Moderate Risk";
        let riskColor = "#fbbc04"; 
        let riskFill = "50%"; 

        if (beta > 1.3) {
            riskText = "High Risk (Volatile)";
            riskColor = "#ff5000"; 
            riskFill = "85%";
        } else if (beta < 0.8) {
            riskText = "Low Risk (Stable)";
            riskColor = "#00c805"; 
            riskFill = "20%";
        }

        floatWidget.onclick = () => window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
        floatWidget.style.cursor = 'pointer';

        // Render the final UI with Dark Mode hex codes
        floatWidget.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${companyName}">
                ${companyName}
            </div>
            
            <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 24px; font-weight: bold; color: ${priceColor};">
                    $${currentPrice}
                </span>
                <span style="font-size: 14px; font-weight: bold; color: ${priceColor};">
                    ${sign}${percentChange}%
                </span>
            </div>

            <div style="margin-bottom: 12px; background: #202124; padding: 10px; border-radius: 8px; border: 1px solid #3c4043;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 6px; color: #9aa0a6; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                    <span>Volatility Risk</span>
                    <span style="color: ${riskColor};">${riskText}</span>
                </div>
                <div style="width: 100%; background: #3c4043; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${riskFill}; background: ${riskColor}; height: 100%; border-radius: 3px; transition: width 1s ease-in-out;"></div>
                </div>
            </div>

            <div style="font-size: 11px; color: #9aa0a6; text-transform: uppercase;">
                ${ticker} Live Market Data
            </div>
        `;
    })
    .catch(error => {
        floatWidget.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">${ticker}</div>
            <div style="color: #ff5000; font-size: 12px;">Error fetching API data.</div>
        `;
        console.error("API Error:", error);
    });

    setTimeout(() => { floatWidget.style.transform = 'translateX(120%)'; }, 15000);
}

// 3. Listen for clicks from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTicker") {
        fetchAndRenderStock(request.ticker);
    }
});

// 4. Check the URL immediately on first page load
const currentUrl = window.location.href;
const match = currentUrl.match(/\/stocks\/([A-Z0-9]+)/);
if (match) {
    fetchAndRenderStock(match[1]);
}