import type { UseAsyncStateOptions } from "@vueuse/core";
import { useAsyncState } from "@vueuse/core";
import { computed, onMounted, onUnmounted } from "vue";

export default function <T>(
  key: StorageItemKey,
  initialValue?: T,
  opts?: UseAsyncStateOptions<true, T | null>
) {
  const {
    state,
    ...asyncState
  } = useAsyncState<T | null, [], true>(
    () => storage.getItem(key),
    initialValue ?? null,
    opts
  );

  // Listen for changes
  let unwatch: (() => void) | undefined;
  onMounted(() => {
    unwatch = storage.watch<T>(key, (newValue) => {
      state.value = newValue ?? initialValue ?? null;
    });
  });
  onUnmounted(() => {
    unwatch?.();
  });

  return {
    // Use a writable computed ref to write updates to storage
    state: computed({
      get () {
        return state.value;
      },
      set (newValue) {
        void storage.setItem(key, newValue);
        state.value = newValue;
      }
    }),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    ...asyncState
  };
}