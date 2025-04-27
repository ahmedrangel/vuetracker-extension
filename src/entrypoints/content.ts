export default defineContentScript({
  matches: ["<all_urls>"],
  main: () => {
    window.addEventListener("message", (event) => {
      browser.runtime.sendMessage(event.data).catch(console.info);
    });
  }
});