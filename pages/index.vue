<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-cs2-orange mb-4">
        CS2 Memory Game
      </h1>
      <p class="text-xl text-cs2-gray mb-8 max-w-md mx-auto">
        Test your memory with Counter-Strike 2 themed cards. Match the pairs to win!
      </p>
      <div class="space-x-4">
        <button class="btn-primary">
          Start Game
        </button>
        <button class="btn-secondary">
          How to Play
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'CS2 Memory Game - Home'
})
</script> 