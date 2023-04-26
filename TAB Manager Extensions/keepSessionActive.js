// Keep session active by sending a message to the content script every 5 minutes
setInterval(function() {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    tabs.forEach(function(tab) {
      // Check if the tab is active before sending the message
      if (tab.active) {
        chrome.tabs.executeScript(tab.id, { code: "console.log('Keep session active')" }, function(result) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      }
    });
  });
}, 300000); // 5 minutes
