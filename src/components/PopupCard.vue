<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { parseURL } from "ufo";
import TrackerDetails from "./TrackerDetails.vue";

const tabId = await getCurrentTabId();
const loading = ref(true);
const data = ref<VueTrackerResponse>();
const framework = computed(() => data.value?.framework);
const ui = computed(() => data.value?.ui);
const server = computed(() => data.value?.server);
const sitePlugins = computed(() => data.value?.plugins);
const siteModules = computed(() => data.value?.frameworkModules);
const siteInfo = computed<{ title: string, value?: string, icon?: string | null, url?: string }[]>(() => {
  if (!data.value) return [];
  return [
    {
      title: "Vue Version",
      value: data.value?.vueVersion,
      icon: vue.icon,
      url: vue.url
    },
    {
      title: framework.value?.version ? framework.value.name : "Framework",
      value: framework.value?.version ? framework.value.version : framework.value?.name,
      icon: getTechnologyMetas("framework", framework.value?.slug)?.icon,
      url: getTechnologyMetas("framework", framework.value?.slug)?.url

    },
    {
      title: "UI Framework",
      value: ui.value?.name,
      icon: getTechnologyMetas("ui", ui.value?.slug)?.icon,
      url: getTechnologyMetas("ui", ui.value?.slug)?.url
    },
    {
      title: "Rendering",
      value: data.value?.hasSSR ? "Universal" : "Client-side"
    },
    {
      title: "Deployment",
      value: data.value?.isStatic ? "Static" : data.value?.hasSSR && !data.value?.isStatic && data.value?.isStatic != undefined ? "Server" : undefined
    },
    {
      title: "Server",
      value: server.value?.name,
      icon: getTechnologyMetas("server", server.value?.slug)?.icon,
      url: getTechnologyMetas("server", server.value?.slug)?.url
    }
  ];
});

const scripting = await browser.scripting.executeScript({
  target: { tabId: tabId! },
  func: () => {
    return {
      url: window.location.href,
      description: (document.querySelector("head > meta[property=\"description\"], head > meta[name=\"description\"]") as HTMLMetaElement)?.content,
      icons: Array.from(document.querySelectorAll("head > link[rel=\"icon\"], head > link[rel=\"shortcut icon\"]"))
        .map(element => ({
          sizes: (element as HTMLLinkElement).sizes?.value || null,
          url: (element as HTMLLinkElement).href
        }))
        .sort((a, b) => {
          const aSize = Number(a.sizes?.split("x")[0]) || 0;
          const bSize = Number(b.sizes?.split("x")[0]) || 0;
          return bSize - aSize;
        }),
      ogImage: (document.querySelector("head > meta:is([property=\"og:image\"], [name=\"og:image\"])") as HTMLMetaElement)?.content,
      title: document.title
    };
  }
});
const { url, title, description, icons, ogImage } = scripting?.[0]?.result || {};
const parsedURL = parseURL(url);
const hostname = parsedURL.host;

onMounted(async () => {
  const analyzeScript = await browser.scripting.executeScript({
    target: { tabId: tabId! },
    world: "MAIN",
    injectImmediately: true,
    files: ["content-scripts/analyze.js"]
  }).catch(() => null);
  data.value = analyzeScript?.[0]?.result as VueTrackerResponse | undefined;
  loading.value = false;
});
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-center">
      <a target="_blank" href="https://vuetracker.pages.dev" class="font-bold text-xl mb-2">
        <span class="text-green-600 dark:text-primary-400">Vue</span>Tracker
      </a>
    </div>
    <div v-if="loading">
      <div class="flex justify-center items-center h-32 gap-2">
        <Icon icon="eos-icons:loading" class="text-green-600" height="32" />
        <span class="text-lg font-semibold">Loading...</span>
      </div>
    </div>
    <div v-else-if="!loading && data">
      <div class="flex flex-col gap-2 mb-3">
        <div class="flex gap-2 items-center justify-between">
          <div class="flex flex-col gap-0.5 text-start overflow-hidden">
            <a target="_blank" :href="url" class="hover:underline">
              <div class="flex gap-2 items-center justify-start">
                <img v-if="icons" :src="findFavicon(icons) || `https://${hostname}/favicon.ico`" class="min-w-6 max-w-6 min-h-6 max-h-6">
                <p class="text-base font-semibold truncate">{{ normalizeSITE(url) }}</p>
              </div>
            </a>
            <h4 class="text-sm font-semibold">{{ title }}</h4>
            <div class="text-left flex flex-col gap-1">
              <p v-if="description" class="text-xs text-start">{{ description }}</p>
            </div>
          </div>
          <img v-if="ogImage" :src="fixOgImage(hostname, ogImage)" class="rounded-xl w-auto h-15 border-2 border-neutral-300 " :title="title || normalizeSITE(url)" :alt="title || normalizeSITE(url)">
        </div>
      </div>
      <TrackerDetails :site-info="siteInfo" :site-plugins="sitePlugins" :site-modules="siteModules" />
    </div>
    <div v-else class="flex justify-center items-center h-32 gap-2">
      <Icon icon="mdi:alert-circle-outline" class="text-red-600" height="32" />
      <span class="text-lg font-semibold">An error occurred while detecting Vue.js on this site.</span>
    </div>
  </div>
</template>
