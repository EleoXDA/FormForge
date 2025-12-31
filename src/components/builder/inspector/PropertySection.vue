<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
})

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <div class="property-section">
    <button
      class="property-section__header"
      type="button"
      @click="isOpen = !isOpen"
    >
      <span class="property-section__title">{{ props.title }}</span>
      <q-icon
        :name="isOpen ? 'expand_less' : 'expand_more'"
        size="20px"
        color="grey-6"
      />
    </button>
    <transition name="slide">
      <div v-show="isOpen" class="property-section__content">
        <slot />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.property-section {
  border-bottom: 1px solid #e8e8e8;
}

.property-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.property-section__header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.property-section__title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.property-section__content {
  padding-bottom: 16px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>