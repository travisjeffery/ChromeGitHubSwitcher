chrome.commands.onCommand.addListener(function(command) {
  var headerExtension = 'h';
  var implementationExtensions = [ 'm', 'mm', 'c', 'cpp' ];

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentTab = tabs[0];
    var currentUrl = currentTab.url;
    var currentExtension = currentUrl.substring(currentUrl.lastIndexOf('.') + 1);

    if (currentExtension === headerExtension) {
      implementationURLForHeaderURL(currentUrl, implementationExtensions.slice(), function(url) {
        url && chrome.tabs.update(currentTab.id, { url: url });
      });
    } else if (implementationExtensions.indexOf(currentExtension) >= 0) {
      chrome.tabs.update(currentTab.id, { url: UrlByRemovingExtension(currentUrl) + headerExtension });
    }
  });
});

function UrlByRemovingExtension(url) {
  return url.substring(0, url.lastIndexOf('.') + 1);
}

function implementationURLForHeaderURL(headerUrl, extensions, callback) {
  if (extensions.length === 0) return callback(null);
  var url = UrlByRemovingExtension(headerUrl) + extensions.shift();
  canFindURL(url, function(found) {
    if (found) return callback(url);
    implementationURLForHeaderURL(url);
  });
}

function canFindURL(url, callback) {
  var request = new XMLHttpRequest();
  request.open('HEAD', url);
  request.onreadystatechange = function() {
    if (this.readyState === this.DONE) {
      callback(this.status !== 404);
    }
  };
  request.send();
}
