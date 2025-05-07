
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
    language: "en", // Default language
    extractionInterval: 500, // Default extraction interval in ms
    retryAttempts: 3 // Default retry attempts
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
  
  if (request.action === "getExtractionInterval") {
    chrome.storage.local.get("extractionInterval", function(data) {
      sendResponse({interval: data.extractionInterval || 500});
    });
    return true; // Required for async response
  }
  
  if (request.action === "setExtractionInterval") {
    chrome.storage.local.set({extractionInterval: request.interval}, function() {
      sendResponse({success: true});
    });
    return true; // Required for async response
  }
  
  if (request.action === "pauseExtraction") {
    // Broadcast pause command to content scripts
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "pauseExtraction"});
      }
    });
    sendResponse({success: true});
    return true;
  }
  
  if (request.action === "resumeExtraction") {
    // Broadcast resume command to content scripts
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "resumeExtraction"});
      }
    });
    sendResponse({success: true});
    return true;
  }
  
  if (request.action === "stopExtraction") {
    // Broadcast stop command to content scripts
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "stopExtraction"});
      }
    });
    sendResponse({success: true});
    return true;
  }
});

// Handle extraction button clicks from content script
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "extraction-channel") {
    port.onMessage.addListener(function(message) {
      console.log("Extraction button clicked:", message);
      // Process extraction based on message
      
      // Send back the current extraction interval
      chrome.storage.local.get("extractionInterval", function(data) {
        port.postMessage({
          action: "setInterval",
          interval: data.extractionInterval || 500
        });
      });
    });
  }
});
