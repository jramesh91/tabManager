var totalDuplicateTabsClosed = 0;
var sessions = [];
var sessionStarted = false;

function closeDuplicateTabs() {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    var urls = {};
    for (var i = 0; i < tabs.length; i++) {
      if (urls[tabs[i].url]) {
        chrome.tabs.remove(tabs[i].id);
        totalDuplicateTabsClosed++; // Increment the count of total duplicate tabs closed
      } else {
        urls[tabs[i].url] = true;
      }
    }
  });
}

function startSession() {
  if (!sessionStarted) {
    sessions = [];
    chrome.windows.getAll({ populate: true }, function(windows) {
      windows.forEach(function(window) {
        window.tabs.forEach(function(tab) {
          if (tab.url && !tab.url.startsWith("chrome")) {
            sessions.push({
              url: tab.url,
              title: tab.title,
              pinned: tab.pinned
            });
          }
        });
      });
      console.log("Started new session: ", sessions);
      sessionStarted = true;
    });
  }
}

function restoreSession() {
  console.log("Restoring session: ", sessions);
  sessions.forEach(function(session) {
    chrome.tabs.create({
      url: session.url,
      active: false,
      pinned: session.pinned
    }, function(tab) {
      chrome.tabs.executeScript(tab.id, { code: "document.title = '" + session.title + "'" });
    });
  });
}

// Schedule the `closeDuplicateTabs` function to run every 15 seconds
setInterval(closeDuplicateTabs, 15000);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "getRecentlyClosedTabs") {
    chrome.sessions.getRecentlyClosed(function(sessions) {
      var closedTabs = sessions.filter(function(session) {
        return session.tab;
      }).map(function(session) {
        return session.tab;
      });
      sendResponse(closedTabs);
    });
    return true;
  } else if (request.type === "getTotalDuplicateTabsClosed") {
    // Send the total number of duplicate tabs closed to the history.js script
    sendResponse(totalDuplicateTabsClosed);
    return true;
  } else if (request === "startSession") {
    startSession();
    sendResponse(true);
  } else if (request === "restoreSession") {
    restoreSession();
    sendResponse(true);
  }
});

chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: chrome.runtime.getURL("history.html") }, function(tab) {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (changeInfo.status === "complete" && tabId === tab.id) {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.runtime.sendMessage({
          type: "getRecentlyClosedTabs"
        }, function(response) {
          console.log(response);
        });
      }
    });
  });
});
