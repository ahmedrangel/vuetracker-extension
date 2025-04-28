export default defineBackground(() => {
  browser.action.enable().catch(console.info);
  browser.action.setPopup({ popup: "popup-ext.html" }).catch(console.info);

  browser.runtime.onInstalled.addListener(() => {
    disableTab().catch(console.info);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
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

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "analyze") {
      getCurrentTabId().then(async (tabId) => {
        await browser.action.enable(tabId);
        await browser.action.setPopup({ popup: "popup-ext.html" });
        await browser.action.setIcon({ path: { 16: "icons/16.png", 32: "icons/32.png", 48: "icons/48.png", 128: "icons/128.png" } });
      }).catch(() => disableTab());
      const key = normalizeSITE(message.data.url)?.replace(/[-./]/g, "_");
      storage.setItem(`session:analyzed:${key}`, message.data).catch(console.info);
    }
    else if (message.type === "disable") {
      getCurrentTabId().then((tabId) => disableTab(tabId)).catch(() => disableTab());
    }
  });
});
