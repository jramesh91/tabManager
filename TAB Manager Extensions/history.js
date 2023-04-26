console.log("history.js loaded");

document.addEventListener("DOMContentLoaded", function() {
  // Request total number of duplicate tabs closed from background.js
  chrome.runtime.sendMessage({ type: "getTotalDuplicateTabsClosed" }, function(totalDuplicateTabsClosed) {
    console.log("Total Duplicate Tabs Closed: ", totalDuplicateTabsClosed);

    // Add total to the top of the history.html page
    var totalDuplicatesElement = document.querySelector(".total-duplicates");
    if (!totalDuplicatesElement) {
      totalDuplicatesElement = document.createElement("div");
      totalDuplicatesElement.classList.add("total-duplicates");
      var countElement = document.createElement("span");
      countElement.textContent = totalDuplicateTabsClosed;
      countElement.setAttribute("id", "total-duplicates-count"); // Add the ID to the count element
      totalDuplicatesElement.appendChild(countElement);
      var labelElement = document.createElement("span");
      labelElement.textContent = "Total Duplicates Closed";
      totalDuplicatesElement.appendChild(labelElement);
      document.body.insertBefore(totalDuplicatesElement, document.body.firstChild);
    } else {
      var countElement = totalDuplicatesElement.querySelector("#total-duplicates-count");
      countElement.textContent = totalDuplicateTabsClosed; // Update the count if the element already exists
    }

    // Add a hover effect to the total duplicates count
    totalDuplicatesElement.addEventListener("mouseover", function() {
      countElement.classList.add("hover");
    });

    totalDuplicatesElement.addEventListener("mouseout", function() {
      countElement.classList.remove("hover");
    });
  });

  chrome.runtime.sendMessage("getRecentlyClosedTabs", function(closedTabs) {
    console.log("closedTabs: ", closedTabs);

    // get the list element from the HTML file
    var list = document.getElementById("closed-tabs-list");

    // clear the list element
    list.innerHTML = "";

    // iterate over the closedTabs array and append each tab's URL as a clickable link to a list element
    closedTabs.forEach(function(tab) {
      var listItem = document.createElement("li");
      var link = document.createElement("a");
      var div = document.createElement("div");
      div.className = "tab-info";
      var title = document.createElement("span");
      title.className = "closed-tab-title";
      title.textContent = tab.title;
      var url = document.createElement("span");
      url.className = "closed-tab-url";
      url.textContent = " (" + tab.url + ")";
      var img = document.createElement("img");
      img.className = "favicon";
      
      // get the favicon for the URL
      fetch(`https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(tab.url)}`)
        .then(function(response) {
          if (response.ok) {
            return response.blob();
          }
          throw new Error('Network response was not ok.');
        })
        .then(function(myBlob) {
          var objectURL = URL.createObjectURL(myBlob);
          img.src = objectURL;
        })
        .catch(function(error) {
          console.error('Error fetching favicon:', error);
          img.src = "fallback-icon.png";
        });

      div.appendChild(img);
      div.appendChild(title);
      div.appendChild(url);
      link.appendChild(div);
      link.href = tab.url;
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
  });
});

console.log("history.js executed");
