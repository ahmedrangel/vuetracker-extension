<script setup lang="ts">
import { Icon } from "@iconify/vue";
import TechCard from "@/components/TechCard.vue";
import TechCardBasic from "@/components/TechCardBasic.vue";

defineProps<{
  siteInfo?: { title: string, value?: string, icon?: string | null, url?: string }[];
  sitePlugins?: VueTrackerTechnology[];
  siteModules?: VueTrackerTechnology[];
}>();
</script>

<template>
  <div class="flex items-center gap-2 text-primary-600 font-semibold tracking-tight mb-2 text-base text-green-600">
    <Icon icon="fa6-solid:circle-info" width="1.2rem" height="1.2em" />
    <p>INFO</p>
  </div>
  <div class="grid grid-cols-3 gap-2">
    <template v-for="(info, i) of siteInfo" :key="i">
      <template v-if="info.value">
        <a v-if="info.url" target="_blank" :href="info.url">
          <TechCard :title="info.title" :icon="info.icon" :value="info.value" class="hover:bg-slate-100" />
        </a>
        <TechCard v-else :title="info.title" :icon="info.icon" :value="info.value" />
      </template>
    </template>
  </div>
  <div v-if="sitePlugins?.length" class="flex flex-col mt-4">
    <div class="flex items-center gap-2 text-primary-600 font-semibold tracking-tight mb-2 text-base text-green-600">
      <Icon icon="fa6-solid:plug" width="1.2rem" height="1.2em" />
      <p>PLUGINS</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <template v-for="(tech, i) of sitePlugins" :key="i">
        <a v-if="getTechnologyMetas('plugin', tech.slug)?.url" target="_blank" :href="getTechnologyMetas('plugin', tech.slug)?.url">
          <TechCardBasic :value="tech.name" class="hover:bg-slate-100" />
        </a>
        <TechCardBasic v-else :value="tech.name" />
      </template>
    </div>
  </div>
  <div v-if="siteModules?.length" class="flex flex-col mt-4">
    <div class="flex items-center gap-2 text-primary-600 font-semibold tracking-tight mb-2 text-base text-green-600">
      <Icon icon="fa6-solid:cubes" width="1.2rem" height="1.2em" />
      <p>NUXT MODULES</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <template v-for="(tech, i) of siteModules" :key="i">
        <a v-if="getTechnologyMetas('module', tech.slug)?.url" target="_blank" :href="getTechnologyMetas('module', tech.slug)?.url">
          <TechCardBasic :value="tech.name" class="hover:bg-slate-100" />
        </a>
        <TechCardBasic v-else :value="tech.name" />
      </template>
    </div>
  </div>
</template>
