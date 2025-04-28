export default defineContentScript({
  matches: ["<all_urls>"],
  main: (ctx) => {
    window.addEventListener("message", (event) => {
      if (ctx.isValid) browser.runtime.sendMessage(event.data).catch(() => null);
    });
  }
});