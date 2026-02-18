import { parseURL } from "ufo";

export const getTechnologyMetas = (type: "framework" | "module" | "plugin" | "ui" | "server", slug?: string) => {
  if (!slug) return undefined;
  const technology = [frameworks, modules, plugins, uis, servers];
  const types = ["framework", "module", "plugin", "ui", "server"] as const;
  const index = types.indexOf(type);
  const technologyType = technology[index];
  if (!technologyType) return undefined;
  const map = Object.fromEntries(Object.entries(technologyType).map(([key, { metas }]) => [metas.slug, { key, metas }]));
  return map[slug]?.metas || undefined;
};

export const findFavicon = (icons?: { sizes: string | null, url: string }[]) => {
  if (!icons?.length) return null;
  const favicon = icons.find(el => el.url.includes("/favicon.ico")) || icons[0];
  return favicon?.url;
};

export const normalizeSITE = (url?: string) => {
  if (!url) return;
  const { host, pathname } = parseURL(url);
  return `${host}${pathname}`.replace(/\/$/, "");
};

export const normalizeKey = (key?: string) => {
  if (!key) return;
  return key.replace(/[-./]/g, "_");
};

export const fixOgImage = (hostname?: string, url?: string | null) => {
  if (!url || !hostname) return undefined;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://${hostname}${url}`;
  return url;
};

export const getCurrentTabId = async () => {
  const currentTab = await browser.tabs.query({ active: true, currentWindow: true }).catch(() => []);
  if (!currentTab?.length) return;
  const tabActive = currentTab.find(tab => tab.active || null);
  return tabActive?.id;
};

export const disableTab = async (tabId?: number) => {
  try {
    if (!tabId) {
      await browser.action.disable();
      await browser.action.setIcon({ path: { 16: "icons/16-gray.png", 32: "icons/32-gray.png", 48: "icons/48-gray.png", 128: "icons/128-gray.png" } });
      return;
    }
    await browser.action.disable(tabId);
    await browser.action.setIcon({ path: { 16: "icons/16-gray.png", 32: "icons/32-gray.png", 48: "icons/48-gray.png", 128: "icons/128-gray.png" }, tabId });
  }
  catch {}
};

export const executeAnalyzer = async (tabId?: number) => {
  if (!tabId) return disableTab();
  await browser.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    injectImmediately: true,
    files: ["content-scripts/injected.js"]
  }).catch(() => null);
};

export const callDisable = () => window.postMessage({ type: "disable", data: null }, { targetOrigin: "*" });

export const callAnalyzeVue = (data: { url: string, vue: boolean }) => window.postMessage({ type: "analyze-vue", data }, { targetOrigin: "*" });

export const getCachedData = <T>(key?: string): Promise<T | null> => {
  window.postMessage({ type: "getCachedData", key }, { targetOrigin: "*" });
  return new Promise((resolve) => {
    if (!key) return resolve(null);
    window.addEventListener("message", (event) => {
      if (event.data.type === "getCachedDataContentResponse" && event.data.key === key) {
        if (event.data.data) resolve(event.data.data);
        else resolve(null);
      }
    });
  });
};
