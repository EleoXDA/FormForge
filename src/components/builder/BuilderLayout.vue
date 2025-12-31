<script setup lang="ts">
import { ref } from 'vue'

// Control sidebar visibility (useful for responsive design)
const leftDrawerOpen = ref(true)
const rightDrawerOpen = ref(true)
</script>

<template>
  <q-layout view="hHh LpR fFf" class="builder-layout">
    <!-- Header / Toolbar -->
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        
        <q-toolbar-title class="text-subtitle1">
          <slot name="title">Form Builder</slot>
        </q-toolbar-title>
        
        <slot name="toolbar-actions" />
        
        <q-btn flat round dense icon="settings" @click="rightDrawerOpen = !rightDrawerOpen" />
      </q-toolbar>
    </q-header>

    <!-- Left Sidebar: Field Palette -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="260"
      :breakpoint="800"
      class="bg-grey-1"
    >
      <div class="q-pa-md">
        <div class="text-subtitle2 text-grey-7 q-mb-sm">FIELD TYPES</div>
        <slot name="palette">
          <div class="text-caption text-grey">Field palette will appear here</div>
        </slot>
      </div>
    </q-drawer>

    <!-- Right Sidebar: Property Inspector -->
    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      bordered
      :width="320"
      :breakpoint="800"
      class="bg-grey-1"
    >
      <div class="q-pa-md">
        <div class="text-subtitle2 text-grey-7 q-mb-sm">PROPERTIES</div>
        <slot name="inspector">
          <div class="text-caption text-grey">Select a field to edit its properties</div>
        </slot>
      </div>
    </q-drawer>

    <!-- Main Canvas Area -->
    <q-page-container>
      <q-page class="builder-canvas-page">
        <slot name="canvas">
          <div class="text-caption text-grey text-center q-pa-xl">
            Drag fields here to build your form
          </div>
        </slot>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.builder-layout {
  height: 100vh;
}

.builder-canvas-page {
  background: #f5f5f5;
  min-height: calc(100vh - 50px);
}
</style>