
// Content script for Facebook Data Vault

// Configuration
const config = {
  selectors: {
    comments: ".x1lliihq",
    groupMembers: "div[role='article']",
    posts: "div[role='article']"
  },
  extractionIconClass: "fb-data-extraction-icon"
};

// Initialize content script
function initializeExtractor() {
  console.log("Facebook Data Vault initializing on:", window.location.href);
  
  // Detect if we're on a Facebook page
  if (!window.location.href.includes("facebook.com")) {
    return;
  }
  
  // Check which type of Facebook page we're on
  detectPageType();
  
  // Add extraction buttons to appropriate elements
  addExtractionButtons();
  
  // Set up mutation observer to handle dynamically loaded content
  setupMutationObserver();
}

// Detect Facebook page type
function detectPageType() {
  const url = window.location.href;
  let pageType = "unknown";
  let pageDetails = {};
  
  if (url.includes("/groups/")) {
    pageType = "group";
    pageDetails.groupId = extractGroupId(url);
    pageDetails.groupName = document.title.split(" | ")[0];
  } else if (url.includes("/messages/")) {
    pageType = "messages";
  } else if (url.match(/facebook\.com\/[^\/]+\/?$/)) {
    pageType = "profile";
    // Extract profile info if available
    const nameElement = document.querySelector('h1');
    if (nameElement) {
      pageDetails.profileName = nameElement.textContent;
    }
  }
  
  console.log("Detected Facebook page type:", pageType, pageDetails);
  
  // Store page info for later use
  window.fbDataVault = {
    pageType,
    pageDetails
  };
  
  // Send page info to background script
  chrome.runtime.sendMessage({
    action: "pageDetected",
    pageType,
    pageDetails
  });
}

// Extract group ID from URL
function extractGroupId(url) {
  const groupIdMatch = url.match(/groups\/([0-9]+)/);
  return groupIdMatch ? groupIdMatch[1] : null;
}

// Add extraction buttons to elements
function addExtractionButtons() {
  if (window.fbDataVault.pageType === "group") {
    addGroupMemberExtractionButtons();
  }
  
  // Add extraction icons to comments regardless of page type
  addCommentExtractionButtons();
}

// Add extraction buttons to group members
function addGroupMemberExtractionButtons() {
  const memberElements = document.querySelectorAll(config.selectors.groupMembers);
  console.log(`Found ${memberElements.length} potential group members`);
  
  memberElements.forEach(element => {
    // Check if this is actually a group member element
    const nameElement = element.querySelector('a[role="link"]');
    if (!nameElement) return;
    
    // Skip if we already added an extraction button
    if (element.querySelector(`.${config.extractionIconClass}`)) return;
    
    // Create extraction button
    const extractButton = document.createElement('div');
    extractButton.className = config.extractionIconClass;
    extractButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    extractButton.style.cssText = `
      cursor: pointer;
      position: absolute;
      right: 8px;
      top: 8px;
      background: white;
      border-radius: 50%;
      padding: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      z-index: 9999;
    `;
    
    // Handle click event
    extractButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const memberId = getMemberIdFromElement(element);
      const memberName = nameElement.textContent;
      
      console.log(`Extracting member: ${memberName} (${memberId})`);
      
      // Send extraction request to background script
      chrome.runtime.sendMessage({
        action: "extractData",
        type: "groupMember",
        data: {
          id: memberId,
          name: memberName,
          groupId: window.fbDataVault.pageDetails.groupId,
          groupName: window.fbDataVault.pageDetails.groupName
        }
      });
    });
    
    // Add button to element
    element.style.position = 'relative';
    element.appendChild(extractButton);
  });
}

// Add extraction buttons to comments
function addCommentExtractionButtons() {
  const commentElements = document.querySelectorAll(config.selectors.comments);
  commentElements.forEach(element => {
    // Skip if we already added an extraction button
    if (element.querySelector(`.${config.extractionIconClass}`)) return;
    
    // Create extraction button (similar to above but with different positioning)
    // ...
  });
}

// Get member ID from element
function getMemberIdFromElement(element) {
  // This is a simplified implementation - would need to be adapted for Facebook's actual DOM
  const profileLink = element.querySelector('a[role="link"]');
  if (!profileLink) return null;
  
  const href = profileLink.getAttribute('href');
  if (!href) return null;
  
  // Extract user ID from href
  const userIdMatch = href.match(/\/user\/([0-9]+)/);
  if (userIdMatch) return userIdMatch[1];
  
  // Try to extract from other URL formats
  const vanityMatch = href.match(/facebook\.com\/([^\/\?]+)/);
  return vanityMatch ? vanityMatch[1] : null;
}

// Set up mutation observer to handle dynamically loaded content
function setupMutationObserver() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        // Check if we need to add extraction buttons to new elements
        addExtractionButtons();
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Apply custom styles
function applyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .fb-data-extraction-icon:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 6px rgba(33, 150, 243, 0.3);
    }
  `;
  document.head.appendChild(style);
}

// CSS for RTL support
function addRTLSupport() {
  // Check if we should use RTL layout
  chrome.storage.local.get("language", function(data) {
    if (data.language === "ar") {
      const style = document.createElement('style');
      style.textContent = `
        .fb-data-extraction-icon {
          right: auto !important;
          left: 8px !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
}

// Initialize when DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtractor);
} else {
  initializeExtractor();
}

// Apply styles
applyStyles();
addRTLSupport();
