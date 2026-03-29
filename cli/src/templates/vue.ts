export const vueSnippet = `<script setup lang="ts">
import { ref } from 'vue'
import { LoadingGame } from 'loading-games/vue'

const isLoading = ref(true)
</script>

<template>
  <LoadingGame
    game="snake"
    :active="isLoading"
    :theme="{ primary: '#6366F1', background: '#0F0F0F' }"
    @score="(s) => console.log('Score:', s)"
    @complete="isLoading = false"
  />
</template>
`
