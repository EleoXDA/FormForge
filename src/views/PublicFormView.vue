<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params['slug'] as string
</script>

<template>
  <q-page padding>
    <p>Public form: {{ slug }}</p>
  </q-page>
</template>