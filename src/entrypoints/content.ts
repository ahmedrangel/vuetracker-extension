export default defineContentScript({
  matches: ["<all_urls>"],
  main: (ctx) => {
    window.addEventListener("message", (event) => {
      if (ctx.isValid) browser.runtime.sendMessage(event.data).then((response) => {
        if (response?.type === "getCachedDataResponse") {
          window.postMessage({ type: "getCachedDataContentResponse", data: response.data, key: response.key }, { targetOrigin: "*" });
        }
      }).catch(() => null);
    });
  }
});
