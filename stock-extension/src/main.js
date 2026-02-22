// src/main.js

document.addEventListener('DOMContentLoaded', () => {
  const tickerContainer = document.getElementById('ticker-container');
  const statusMessage = document.getElementById('status-message');

  // 1. Ask Chrome: "What tab is the user looking at right now?"
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // 2. Check if the active tab is a Robinhood stock page
    if (currentTab && currentTab.url && currentTab.url.includes("robinhood.com/stocks/")) {
      const match = currentTab.url.match(/\/stocks\/([A-Z0-9]+)/);
      
      if (match) {
        // We found a ticker in the active tab!
        const ticker = match[1];
        tickerContainer.textContent = ticker;
        statusMessage.textContent = "Ready to fetch data!";
        
        // Save it to storage just in case we need it later
        chrome.storage.local.set({ currentTicker: ticker });
        return; // Stop running code here
      }
    }
    
    // 3. Fallback: If not on Robinhood right now, check if we saved one previously
    chrome.storage.local.get(['currentTicker'], (result) => {
      if (result.currentTicker) {
        tickerContainer.textContent = result.currentTicker;
        statusMessage.textContent = "Viewing last seen stock.";
      } else {
        tickerContainer.textContent = "--";
        statusMessage.textContent = "Navigate to a stock page to begin.";
      }
    });
  });
});