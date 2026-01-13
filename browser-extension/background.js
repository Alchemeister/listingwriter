// ListingWriter Browser Extension - Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ListingWriter extension installed');

    // Set default theme
    chrome.storage.local.set({ theme: 'dark' });
  }
});

// Handle extension icon click on unsupported pages
chrome.action.onClicked.addListener((tab) => {
  // This won't fire because we have a popup defined,
  // but keeping it here for potential future use
});

// Optional: Track usage for analytics (respecting privacy)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackGeneration') {
    // Could send anonymous usage stats to your server
    // For now, just increment local counter
    chrome.storage.local.get(['generationCount'], (result) => {
      const count = (result.generationCount || 0) + 1;
      chrome.storage.local.set({ generationCount: count });
    });
    sendResponse({ success: true });
  }
  return true;
});

console.log('ListingWriter background service worker started');
