export default defineContentScript({
  matches: ["<all_urls>"],
  main: async () => {
    try {
      await analyze();
    }
    catch {
      callDisable();
    }
  }
});