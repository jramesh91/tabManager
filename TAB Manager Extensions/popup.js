document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({}, function(tabs) {
    // Send message to background script once tabs are loaded
    chrome.runtime.sendMessage('tabsLoaded');
  });
});
