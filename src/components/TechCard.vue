<script setup lang="ts">
defineProps<{
  title: string;
  value?: string;
  icon?: string | null;
}>();
</script>

<template>
  <div class="flex flex-col w-full bg-slate-200 border-2 border-slate-300 rounded-xl overflow-hidden transition">
    <p class="self-start bg-slate-300 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-semibold">{{ title }}</p>
    <div class="flex justify-center items-center p-2 gap-1">
      <img v-if="icon" :src="`/assets/icons/${icon}.svg`" class="w-6 h-6" alt="Icon">
      <p class="text-base font-semibold tracking-tight">{{ value }}</p>
    </div>
  </div>
</template>