<template>
  <div class="card w-24 h-32 cursor-pointer transform transition-all duration-300 hover:scale-105" :class="{
    'bg-cs2-orange': isFlipped || isMatched,
    'bg-cs2-blue': !isFlipped && !isMatched
  }" @click="handleClick">
    <div class="flex items-center justify-center h-full">
      <div v-if="isFlipped || isMatched" class="text-2xl">
        {{ emoji }}
      </div>
      <div v-else class="text-white text-2xl">
        ?
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  isDisabled: boolean
}

interface Emits {
  (e: 'card-click', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  if (!props.isDisabled && !props.isFlipped && !props.isMatched) {
    emit('card-click', 0) // Index will be passed from parent
  }
}
</script>