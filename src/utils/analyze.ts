
import { parseURL } from "ufo";
import { getFramework, getNuxtMeta, getNuxtModules, getPlugins, getUI, getVueMeta, hasVue } from "vuetracker-analyzer/tools";

// Extend the Element and Window interfaces to include the vue and nuxt properties
declare global {
  interface Element {
    __vue__?: { $root?: { constructor?: { version?: string } } };
    __vue_app__?: { version?: string };
  }

  interface Window {
    Vue?: { version?: string };
    $nuxt?: { $root?: { constructor?: { version?: string } } };
    __unctx__?: {
      get: (key: string) => {
        use: () => { versions?: { nuxt?: string } };
      };
    };
  }
}

export const analyze = async () => {
  if (browser.runtime?.id) return callDisable(); // Prevent CSP issues in the browser console
  const completed = document.readyState === "complete";
  let loaded = completed;

  if (!completed) {
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "complete") {
        loaded = true;
      }
    });
  }

  const maxRetries = 20;
  let retries = 0;
  while (!loaded && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    retries++;
  }

  const html = document.documentElement.outerHTML;
  const scripts = Array.from(document.getElementsByTagName("script")).map(({ src }) => src).filter(script => script);
  const page = { evaluate: (value: string) => window.eval(`(${value});`) };
  const context = { originalHtml: html, html, scripts, page };
  const usesVue = await hasVue(context);
  if (!usesVue) return callDisable(); // No Vue detected, exit early
  const url = window.location.href;
  const parsedURL = parseURL(url);
  const hostname = parsedURL.host;
  const vueVersion = window.$nuxt?.$root?.constructor?.version || window.Vue?.version || [...document.querySelectorAll("*")].map((el) => el.__vue__?.$root?.constructor?.version || el.__vue_app__?.version).filter(Boolean)[0];
  const plugins = (await getPlugins(context))?.sort((a, b) => a.name.localeCompare(b.name)) as VueTrackerTechnology[];
  const ui = await getUI(context) as VueTrackerTechnology;
  const { ssr } = await getVueMeta(context);
  const icons = Array.from(document.querySelectorAll("head > link[rel=\"icon\"], head > link[rel=\"shortcut icon\"]"))
    .map(element => ({
      url: (element as HTMLLinkElement).href,
      sizes: (element as HTMLLinkElement).sizes?.value || null
    }))
    .sort((a, b) => {
      const aSize = Number(a.sizes?.split("x")[0]) || 0;
      const bSize = Number(b.sizes?.split("x")[0]) || 0;
      return bSize - aSize;
    });
  const infos: VueTrackerResponse = {
    url,
    hostname: hostname,
    meta: {
      language: window.navigator.language,
      title: document.title,
      description: (document.querySelector("head > meta[property=\"description\"], head > meta[name=\"description\"]") as HTMLMetaElement)?.content,
      siteName: (document.querySelector("head > meta[property=\"og:site_name\"], head > meta[name=\"og:site_name\"]") as HTMLMetaElement)?.content,
      isAdultContent: false,
      icons, // { url, sizes },
      ogImage: (document.querySelector("head > meta:is([property=\"og:image\"], [name=\"og:image\"])") as HTMLMetaElement)?.content || (document.querySelector("head > meta[property=\"twitter:image\"], head > meta[name=\"twitter:image\"]") as HTMLMetaElement)?.content || (document.querySelector("head > link[rel=\"image_src\"]") as HTMLLinkElement)?.href
    },
    vueVersion,
    hasSSR: ssr, // default
    isStatic: true, // default
    framework: null, // nuxt | gridsome | quasar | vuepress | iles
    frameworkModules: [],
    plugins, // vue-router, vuex, vue-apollo, etc
    ui // vuetify | bootstrap-vue | element-ui | tailwindcss
  };
  const rtaLabel = (document.querySelector("head > meta[property=\"og:site_name\"], head > meta[name=\"og:site_name\"]") as HTMLMetaElement)?.content;
  if (rtaLabel && ["adult", "RTA-5042-1996-1400-1577-RTA"].includes(rtaLabel?.trim())) {
    infos.meta.isAdultContent = true;
  }
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
  // Send the analyzed data to the main content script
  window.postMessage({
    type: "analyze",
    data: infos
  }, {
    targetOrigin: "*"
  });
};