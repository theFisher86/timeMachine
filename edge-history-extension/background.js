chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('history.html'),
    type: 'popup',
    width: 800,
    height: 600
  });
});
