// src/background.js

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes("robinhood.com/stocks/")) {
    const match = changeInfo.url.match(/\/stocks\/([A-Z0-9]+)/);
    
    if (match) {
      const ticker = match[1];
      console.log(`[Background] URL changed to: ${ticker}`);
      
      // Send a message to the content script in this specific tab
      chrome.tabs.sendMessage(tabId, { action: "updateTicker", ticker: ticker })
        .catch(() => {
            // Ignore errors if the content script hasn't loaded yet
        });
    }
  }
});