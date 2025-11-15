import { hasVue } from "vuetracker-analyzer/tools";

const setAnalyzingFlag = (value: boolean) => window.__vuetracker_analyzing__ = value;

export default defineContentScript({
  matches: ["<all_urls>"],
  main: async () => {
    try {
      const key = "vue__" + normalizeKey(normalizeSITE(String(window.location.href)));
      const data = await getCachedData<{ url: string, vue: boolean }>(key).catch(() => null);

      if (browser.runtime?.id) return; // Prevent CSP issues in the browser console

      if (window.__vuetracker_analyzing__) return; // Prevent multiple analysis runs

      setAnalyzingFlag(true);

      if (data) {
        setAnalyzingFlag(false);
        callAnalyzeVue(data);
        return; // Cached data found, return it
      }

      const html = document.documentElement.outerHTML;
      const scripts = Array.from(document.getElementsByTagName("script")).map(({ src }) => src).filter(script => script);
      const page = { evaluate };

      const context = { originalHtml: html, html, scripts, page, headers: {} };
      const usesVue = await hasVue(context);
      if (!usesVue) {
        setAnalyzingFlag(false);
        return callDisable(); // No Vue detected, exit early
      }
      const vueVersion = window.$nuxt?.$root?.constructor?.version || window.Vue?.version || [...document.querySelectorAll("*")].map((el) => el.__vue__?.$root?.constructor?.version || el?.__vue__?.$root?.$options?._base?.version || el.__vue_app__?.version).filter(Boolean)[0];
      if (!vueVersion) {
        setAnalyzingFlag(false);
        return callDisable(); // Vue version not found, exit early
      }
      callAnalyzeVue({ url: window.location.href, vue: true });
      setAnalyzingFlag(false);
    }
    catch {
      callDisable();
    }
  }
});
