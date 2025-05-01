<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import TrackerDetails from "./TrackerDetails.vue";
import useStoredValue from "@/composables/useStoredValue";

const tabId = await getCurrentTabId();
const scripting = await browser.scripting.executeScript({
  target: { tabId: tabId || -1 },
  func: () => window.location.href
}).catch(() => disableTab(tabId));
const location = scripting?.[0]?.result as string;
const key = normalizeKey(normalizeSITE(location));
const { state: data } = useStoredValue<VueTrackerResponse>(`session:analyzed:${key}`);
const framework = computed(() => data.value?.framework);
const ui = computed(() => data.value?.ui);
const sitePlugins = computed(() => data.value?.plugins);
const siteModules = computed(() => data.value?.frameworkModules);
const siteInfo = computed<{ title: string, value?: string, icon?: string | null, url?: string }[]>(() => {
  if (!data.value) return [];
  return [{
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
    value: data.value.hasSSR ? "Universal" : "Client-side"
  },
  {
    title: "Deployment",
    value: data.value.hasSSR && data.value.isStatic ? "Static" : data.value.hasSSR && !data.value.isStatic && data.value.isStatic != undefined ? "Server" : undefined
  }];
});
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-center">
      <a target="_blank" href="https://vuetracker.nuxt.dev" class="font-bold text-xl mb-2">
        <span class="text-green-600 dark:text-primary-400">Vue</span>Tracker
      </a>
    </div>
    <div v-if="data">
      <div class="flex flex-col gap-2 mb-3">
        <div class="flex gap-2 items-center justify-between">
          <div class="flex flex-col gap-0.5 text-start">
            <a target="_blank" :href="data.url" class="hover:underline w-fit">
              <div class="flex gap-2 items-center justify-start">
                <img v-if="data?.meta?.icons" :src="findFavicon(data.meta.icons) || `https://${data.hostname}/favicon.ico`" class="min-w-6 max-w-6 min-h-6 max-h-6">
                <p class="text-base font-semibold">{{ normalizeSITE(data.url) }}</p>
              </div>
            </a>
            <h4 class="text-sm font-semibold">{{ data.meta.title }}</h4>
            <div class="text-left flex flex-col gap-1">
              <p v-if="data?.meta?.description" class="text-xs text-start">{{ data.meta.description }}</p>
            </div>
          </div>
          <img v-if="data.meta.ogImage" :src="fixOgImage(data.hostname, data.meta.ogImage)" class="rounded-xl w-auto h-[60px] border-2 border-neutral-300 " :title="data.meta.title || normalizeSITE(data.url)" :alt="data.meta.title || normalizeSITE(data.url)">
        </div>
      </div>
      <TrackerDetails :site-info="siteInfo" :site-plugins="sitePlugins" :site-modules="siteModules" />
    </div>
    <div v-else>
      <div class="flex justify-center items-center h-32 gap-2">
        <Icon icon="eos-icons:loading" class="text-green-600" height="32" />
        <span class="text-lg font-semibold">Loading...</span>
      </div>
    </div>
  </div>
</template>