
// Options page script for Facebook Data Vault

document.addEventListener('DOMContentLoaded', function() {
  // Load current settings
  loadSettings();
  
  // Set up event listeners
  document.getElementById('save-options').addEventListener('click', saveOptions);
  document.getElementById('upgrade-subscription').addEventListener('click', upgradeSubscription);
  
  // Extraction interval control
  const intervalSlider = document.getElementById('extraction-interval');
  const intervalValue = document.getElementById('interval-value');
  
  intervalSlider.addEventListener('input', function() {
    intervalValue.textContent = `${this.value}ms`;
  });
  
  // Language selector
  const languageOptions = document.querySelectorAll('.language-option');
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      languageOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Update direction based on language
      const language = option.getAttribute('data-lang');
      document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    });
  });
});

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get([
    'storageConfig', 
    'subscription', 
    'language', 
    'extractionSettings', 
    'exportPrefs',
    'extractionInterval',
    'retryAttempts'
  ], function(data) {
    // Update storage path
    if (data.storageConfig && data.storageConfig.basePath) {
      const path = `${data.storageConfig.basePath}/${data.storageConfig.extractedDataFolder}/`;
      document.getElementById('storage-path').value = path;
    }
    
    // Update subscription info
    if (data.subscription) {
      const tierElement = document.getElementById('subscription-tier');
      tierElement.textContent = data.subscription.tier.charAt(0).toUpperCase() + data.subscription.tier.slice(1);
      tierElement.className = `subscription-badge ${data.subscription.tier}`;
      
      let description = '';
      switch (data.subscription.tier) {
        case 'basic':
          description = 'Basic features with limited extraction capabilities.';
          break;
        case 'premium':
          description = 'Full access to extraction features with moderate rate limits.';
          break;
        case 'enterprise':
          description = 'Unlimited extraction with highest rate limits and priority support.';
          break;
      }
      document.getElementById('subscription-description').textContent = description;
    }
    
    // Update language
    if (data.language) {
      const languageOptions = document.querySelectorAll('.language-option');
      languageOptions.forEach(option => {
        if (option.getAttribute('data-lang') === data.language) {
          option.classList.add('active');
          document.body.dir = data.language === 'ar' ? 'rtl' : 'ltr';
        } else {
          option.classList.remove('active');
        }
      });
    }
    
    // Update extraction settings
    if (data.extractionSettings) {
      document.getElementById('auto-detect').checked = !!data.extractionSettings.autoDetect;
      document.getElementById('show-extraction-icons').checked = !!data.extractionSettings.showIcons;
      document.getElementById('real-time-sync').checked = !!data.extractionSettings.realTimeSync;
    }
    
    // Update extraction interval
    if (data.extractionInterval) {
      document.getElementById('extraction-interval').value = data.extractionInterval;
      document.getElementById('interval-value').textContent = `${data.extractionInterval}ms`;
    }
    
    // Update retry attempts
    if (data.retryAttempts) {
      document.getElementById('retry-attempts').value = data.retryAttempts;
    }
    
    // Update export preferences
    if (data.exportPrefs && data.exportPrefs.defaultFormat) {
      document.getElementById('default-export').value = data.exportPrefs.defaultFormat;
    }
  });
}

// Save options to storage
function saveOptions() {
  const storagePath = document.getElementById('storage-path').value;
  const pathParts = storagePath.split('/').filter(p => p);
  const basePath = pathParts.length > 0 ? pathParts[0] : 'Nagport';
  const extractedDataFolder = pathParts.length > 1 ? pathParts.slice(1).join('/') : 'extracted_data';
  
  const activeLanguage = document.querySelector('.language-option.active');
  const language = activeLanguage ? activeLanguage.getAttribute('data-lang') : 'en';
  
  const extractionInterval = parseInt(document.getElementById('extraction-interval').value);
  const retryAttempts = parseInt(document.getElementById('retry-attempts').value);
  
  const settings = {
    storageConfig: {
      basePath,
      extractedDataFolder
    },
    language,
    extractionSettings: {
      autoDetect: document.getElementById('auto-detect').checked,
      showIcons: document.getElementById('show-extraction-icons').checked,
      realTimeSync: document.getElementById('real-time-sync').checked
    },
    exportPrefs: {
      defaultFormat: document.getElementById('default-export').value
    },
    extractionInterval,
    retryAttempts
  };
  
  chrome.storage.local.set(settings, function() {
    showNotification('Settings saved successfully');
  });
}

// Show notification to user
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => document.body.removeChild(notification), 500);
  }, 3000);
}

// Handle upgrade subscription button
function upgradeSubscription() {
  chrome.tabs.create({url: 'https://nagport.com/subscription'});
}
