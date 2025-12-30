<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const formId = route.params['id'] as string
</script>

<template>
  <q-page padding>
    <h2 class="text-h4 q-mb-md">Form Builder</h2>
    <p>Editing form: {{ formId }}</p>
  </q-page>
</template>