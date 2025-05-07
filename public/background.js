
// Background script for Facebook Data Vault

// Configuration for data storage path
const storageConfig = {
  basePath: "Nagport",
  extractedDataFolder: "extracted_data"
};

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function() {
  console.log("Facebook Data Vault extension installed");
  
  // Set default storage configuration
  chrome.storage.local.set({
    storageConfig: storageConfig,
    subscription: {
      tier: "basic",
      rateLimit: 3 // requests per second
    },
    language: "en" // Default language
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extractData") {
    console.log("Data extraction requested:", request.type);
    // Here we would handle the extraction request
    sendResponse({success: true, message: "Extraction initiated"});
    return true; // Required for async response
  }
  
  if (request.action === "checkSubscription") {
    chrome.storage.local.get("subscription", function(data) {
      sendResponse({subscription: data.subscription || {tier: "basic", rateLimit: 3}});
    });
    return true; // Required for async response
  }
});

// Handle extraction button clicks from content script
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "extraction-channel") {
    port.onMessage.addListener(function(message) {
      console.log("Extraction button clicked:", message);
      // Process extraction based on message
    });
  }
});
