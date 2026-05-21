<script setup lang="ts">
import type { DrawingName } from '@engine/drawings'

defineProps<{ name: DrawingName }>()
</script>
<template>
  <svg v-if="name === 'trend-line'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
    <g fill="currentColor" fill-rule="nonzero">
      <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
      <path
        d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
    </g>
  </svg>
  <svg
    v-else-if="name === 'horizontal-line'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    width="28"
    height="28">
    <g fill="currentColor" fill-rule="nonzero">
      <path d="M4 15h8.5v-1h-8.5zM16.5 15h8.5v-1h-8.5z"></path>
      <path
        d="M14.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
    </g>
  </svg>
  <svg
    v-else-if="name === 'vertical-line'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    width="28"
    height="28">
    <g fill="currentColor" fill-rule="nonzero">
      <path d="M15 12.5v-8.5h-1v8.5zM14 16.5v8.5h1v-8.5z"></path>
      <path
        d="M14.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
    </g>
  </svg>
  <svg v-else-if="name === 'ray'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
    <g fill="currentColor" fill-rule="nonzero">
      <path d="M8.354 20.354l5-5-.707-.707-5 5z"></path>
      <path d="M16.354 12.354l8-8-.707-.707-8 8z"></path>
      <path
        d="M14.5 15c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 23c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
    </g>
  </svg>
  <svg v-else-if="name === 'circle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
    <g fill="currentColor" fill-rule="nonzero">
      <path
        d="M14 5c-4.971 0-9 4.029-9 9s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9zm0 1c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z"></path>
      <path
        d="M14 15.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
      <path
        d="M14 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
    </g>
  </svg>
</template>
