
import { parseURL } from "ufo";
import { getFramework, getNuxtMeta, getNuxtModules, getPlugins, getUI, getVueMeta, hasVue } from "vuetracker-analyzer/tools";
import { useSandbox } from "./sandbox";
import { vueTrackerConsole } from "./console";

export const analyze = async () => {
  const key = normalizeKey(normalizeSITE(String(window.location.href)));
  const data = await getCachedData(key).catch(() => null);

  if (browser.runtime?.id) return callDisable(); // Prevent CSP issues in the browser console

  const icons = Array.from(document.querySelectorAll("head > link[rel=\"icon\"], head > link[rel=\"shortcut icon\"]"))
    .map(element => ({
      sizes: (element as HTMLLinkElement).sizes?.value || null,
      url: (element as HTMLLinkElement).href
    }))
    .sort((a, b) => {
      const aSize = Number(a.sizes?.split("x")[0]) || 0;
      const bSize = Number(b.sizes?.split("x")[0]) || 0;
      return bSize - aSize;
    });
  const rtaLabel = (document.querySelector("head > meta[name=\"rating\"]") as HTMLMetaElement)?.content;
  const meta = {
    description: (document.querySelector("head > meta[property=\"description\"], head > meta[name=\"description\"]") as HTMLMetaElement)?.content,
    icons, // { url, sizes }
    isAdultContent: rtaLabel && ["adult", "RTA-5042-1996-1400-1577-RTA"].includes(rtaLabel?.trim()) ? true : false,
    language: window.navigator.language,
    ogImage: (document.querySelector("head > meta:is([property=\"og:image\"], [name=\"og:image\"])") as HTMLMetaElement)?.content,
    siteName: (document.querySelector("head > meta[property=\"og:site_name\"], head > meta[name=\"og:site_name\"]") as HTMLMetaElement)?.content,
    title: document.title
  };

  if (data?.meta && JSON.stringify(meta) !== JSON.stringify(data?.meta)) data.meta = meta; // Update meta if it has changed

  if (data) return callAnalyze(data); // Cached data found, return it

  vueTrackerConsole.info("Analyzing page...");

  const html = document.documentElement.outerHTML;
  const scripts = Array.from(document.getElementsByTagName("script")).map(({ src }) => src).filter(script => script);
  const page = {
    evaluate: async (value: string) => {
      const sandbox = useSandbox();
      try {
        if (isTrustedEval()) throw new Error("Trusted eval");
        const exec = sandbox.compileAsync(`return ${value};`);
        const sandboxed = await exec().run();
        return sandboxed;
      }
      catch {
        if (!isTrustedEval()) return;
        return window.eval(`(${value})`);
      }
    }
  };

  const context = { originalHtml: html, html, scripts, page };
  const usesVue = await hasVue(context);
  if (!usesVue) {
    vueTrackerConsole.info("No Vue detected");
    return callDisable(); // No Vue detected, exit early
  }
  const url = window.location.href;
  const parsedURL = parseURL(url);
  const hostname = parsedURL.host;
  const vueVersion = window.$nuxt?.$root?.constructor?.version || window.Vue?.version || [...document.querySelectorAll("*")].map((el) => el.__vue__?.$root?.constructor?.version || el.__vue_app__?.version).filter(Boolean)[0];
  const plugins = (await getPlugins(context))?.sort((a, b) => a.name.localeCompare(b.name)) as VueTrackerTechnology[];
  const ui = await getUI(context) as VueTrackerTechnology;
  const { ssr } = await getVueMeta(context);

  const infos: VueTrackerResponse = {
    url,
    hostname: hostname,
    meta,
    vueVersion,
    hasSSR: ssr, // default
    isStatic: undefined, // default
    framework: null, // nuxt | gridsome | quasar | vuepress | iles
    frameworkModules: [],
    plugins, // vue-router, vuex, vue-apollo, etc
    ui // vuetify | bootstrap-vue | element-ui | tailwindcss
  };

  const framework = await getFramework(context);
  // Get Nuxt modules if using Nuxt
  if (framework && framework.slug === "nuxtjs") {
    const [meta, modules] = await Promise.all([
      getNuxtMeta(context),
      getNuxtModules(context)
    ]);
    framework.version = window.__unctx__?.get("nuxt-app")?.use()?.versions?.nuxt;
    if (!framework.version && infos.vueVersion) {
      framework.version = infos.vueVersion.split(".")[0];
    }
    infos.isStatic = meta.static;
    infos.hasSSR = meta.ssr;
    infos.frameworkModules = modules?.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Get Astro version if using Astro
  else if (framework && framework.slug === "astro") {
    const astroVersion = document.querySelector("meta[name=\"generator\"]")?.getAttribute("content");
    if (framework.version && astroVersion && astroVersion.includes("Astro")) {
      framework.version = framework.version.replace("Astro v", "");
    }
  }
  infos.framework = framework;
  vueTrackerConsole.info("Analyzing completed.");
  return callAnalyze(infos);
};
