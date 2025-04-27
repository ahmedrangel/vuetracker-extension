<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <div class="bg-slate-200 border-2 border-slate-300 rounded-xl overflow-hidden px-3 py-1 transition">
    <p class="text-sm font-semibold tracking-tight">{{ value }}</p>
  </div>
</template>