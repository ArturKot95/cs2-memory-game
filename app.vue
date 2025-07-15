<template>
  <div id="app" class="min-h-screen bg-cs2-dark font-cs2">
    <GameCard
      emoji="😀"
      :isFlipped="false"
      :isMatched="false"
      :isDisabled="false"
    />
  </div>
</template>

<script setup lang="ts">
// Main app component
</script>

<style>
html {
  font-family: 'Inter', sans-serif;
}

body {
  margin: 0;
  padding: 0;
}
</style>