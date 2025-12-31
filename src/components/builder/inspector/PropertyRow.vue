<script setup lang="ts">
interface Props {
  label: string
  hint?: string
}

defineProps<Props>()
</script>

<template>
  <div class="property-row">
    <label class="property-row__label">
      {{ label }}
      <q-icon v-if="hint" name="help_outline" size="14px" class="q-ml-xs text-grey-5">
        <q-tooltip max-width="250px">{{ hint }}</q-tooltip>
      </q-icon>
    </label>
    <div class="property-row__input">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.property-row {
  margin-bottom: 12px;
}

.property-row__label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 4px;
}

.property-row__input {
  width: 100%;
}

/* Make Quasar inputs more compact in the inspector */
.property-row__input :deep(.q-field) {
  padding-bottom: 0;
}

.property-row__input :deep(.q-field__bottom) {
  display: none;
}
</style>