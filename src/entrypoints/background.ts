export default defineBackground(() => {
  browser.action.enable().catch(console.info);
  browser.action.setPopup({ popup: "popup-ext.html" }).catch(console.info);

  browser.runtime.onInstalled.addListener(() => {
    disableTab().catch(console.info);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.status === "complete" && tabInfo.active) {
      executeAnalyzer(tabId).catch(() => disableTab(tabId));
    }
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    executeAnalyzer(tabId).catch(() => disableTab(tabId));
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    getCurrentTabId().then((tabId) => {
      executeAnalyzer(tabId).catch(() => disableTab(tabId).catch(console.info));
    }).catch(console.info);
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    if (message.type === "getCachedData" && message.key) {
      storage.getItem(`session:analyzed:${message.key}`).then((data) => {
        sendResponse({ type: "getCachedDataResponse", key: message.key, data, sender });
      }).catch(() => null);
    }
    if (message.type === "analyze") {
      Promise.allSettled([
        browser.action.setPopup({ popup: "popup-ext.html" }),
        browser.action.enable(tabId),
        browser.action.setIcon({ path: { 16: "icons/16.png", 32: "icons/32.png", 48: "icons/48.png", 128: "icons/128.png" } })
      ]).catch(console.info);
      const key = normalizeKey(normalizeSITE(message.data.url));
      storage.getItem(`session:analyzed:${key}`).then((data) => {
        if (message.data.vueVersion && !data) {
          const decoratedText = vueTrackerConsole.info("Analysis completed.", message.data);
          browser.scripting.executeScript({
            target: { tabId: tabId! },
            args: [decoratedText],
            func: (text) => console.info(...text)
          }).catch(console.info);
          storage.setItem(`session:analyzed:${key}`, message.data).catch(console.info);
        }
      }).catch(console.info);
    }
    else if (message.type === "disable") {
      disableTab(tabId).catch(console.info);
    }
    return true; // Keep the message channel open for sendResponse
  });
});
