<template>
  <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
    <div
      v-if="toast.show"
      class="toast align-items-center border-0 show"
      :class="'text-bg-' + toast.type"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button
          v-if="toast.closable"
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          @click="$emit('hide')"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  toast: {
    type: Object,
    required: true,
  },
});
</script>
