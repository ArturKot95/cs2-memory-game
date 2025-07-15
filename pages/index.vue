<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="text-center mb-8">
      <h1 class="text-6xl font-bold text-cs2-orange mb-4">
        CS2 Memory Game
      </h1>
      <p class="text-xl text-cs2-gray mb-8 max-w-md mx-auto">
        Test your memory with Counter-Strike 2 themed cards. Match the pairs to win!
      </p>
      <div class="space-x-4">
        <button class="btn-primary" @click="resetGame">
          Start Game
        </button>
        <button class="btn-secondary">
          How to Play
        </button>
      </div>
    </div>
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="bg-cs2-gray rounded-lg shadow-lg"
      @click="handleCanvasClick" @mousemove="handleCanvasMouseMove" @mouseleave="handleCanvasMouseLeave"></canvas>
    <div v-if="isGameWon" class="mt-8 text-3xl text-cs2-orange font-bold">You won! 🎉</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const EMOJIS = [
  '🔫', '💣', '🧢', '🕹️',
  '🎯', '🛡️', '🎮', '🧤'
] // 8 unique, 2 of each for 16 cards

const ROWS = 4
const COLS = 4
const CARD_WIDTH = 80
const CARD_HEIGHT = 110
const CARD_MARGIN = 18
const canvasWidth = COLS * CARD_WIDTH + (COLS + 1) * CARD_MARGIN
const canvasHeight = ROWS * CARD_HEIGHT + (ROWS + 1) * CARD_MARGIN

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  row: number
  col: number
}

const cards = ref<Card[]>([])
const flippedIndices = ref<number[]>([])
const isBoardLocked = ref(false)
const isGameWon = computed(() => cards.value.every(card => card.isMatched))
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Hover state
const hoveredCardId = ref<number | null>(null)
const hoverRotation = ref<{ x: number; y: number }>({ x: 0, y: 0 })

// Flip animation state
interface FlipAnim {
  id: number
  progress: number // 0 to 1
  flippingTo: boolean
  done: boolean
}
const flipAnims = ref<FlipAnim[]>([])
let animating = false

function shuffle<T>(array: T[]): T[] {
  let arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function setupCards() {
  const doubled = [...EMOJIS, ...EMOJIS]
  const shuffled = shuffle(doubled)
  cards.value = []
  let idx = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cards.value.push({
        id: idx,
        emoji: shuffled[idx],
        isFlipped: false,
        isMatched: false,
        row,
        col
      })
      idx++
    }
  }
  flippedIndices.value = []
  isBoardLocked.value = false
  flipAnims.value = []
  hoveredCardId.value = null
}

// Helper: 3D perspective projection for a card
function draw3DCard(ctx: CanvasRenderingContext2D, card: Card, opts: { rotationX?: number, rotationY?: number, showFace: boolean }) {
  const x = card.col * CARD_WIDTH + (card.col + 1) * CARD_MARGIN
  const y = card.row * CARD_HEIGHT + (card.row + 1) * CARD_MARGIN
  const w = CARD_WIDTH
  const h = CARD_HEIGHT
  const cx = x + w / 2
  const cy = y + h / 2
  const perspective = 500
  const rx = opts.rotationX ?? 0
  const ry = opts.rotationY ?? 0

  // 3D corners
  const corners = [
    { x: -w / 2, y: -h / 2, z: 0 }, // TL
    { x: w / 2, y: -h / 2, z: 0 },  // TR
    { x: w / 2, y: h / 2, z: 0 },   // BR
    { x: -w / 2, y: h / 2, z: 0 }   // BL
  ].map(pt => {
    // Rotate X
    let y1 = pt.y * Math.cos(rx) - pt.z * Math.sin(rx)
    let z1 = pt.y * Math.sin(rx) + pt.z * Math.cos(rx)
    // Rotate Y
    let x2 = pt.x * Math.cos(ry) + z1 * Math.sin(ry)
    let z2 = -pt.x * Math.sin(ry) + z1 * Math.cos(ry)
    // Perspective
    let scale = perspective / (perspective - z2)
    return {
      x: cx + x2 * scale,
      y: cy + y1 * scale
    }
  })

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(corners[0].x, corners[0].y)
  for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y)
  ctx.closePath()
  ctx.fillStyle = opts.showFace ? '#FF6B35' : '#1E3A8A'
  ctx.shadowColor = 'rgba(0,0,0,0.18)'
  ctx.shadowBlur = 8
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw content
  ctx.font = '40px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  // Find center for text
  const tx = (corners[0].x + corners[2].x) / 2
  const ty = (corners[0].y + corners[2].y) / 2
  if (opts.showFace) {
    ctx.fillText(card.emoji, tx, ty)
  } else {
    ctx.font = 'bold 40px Inter, sans-serif'
    ctx.fillText('?', tx, ty)
  }
  ctx.restore()
}

function drawCard(ctx: CanvasRenderingContext2D, card: Card, options?: { rotation?: { x: number; y: number }, flipProgress?: number, flipToFace?: boolean }) {
  // 3D flip: animate rotationY from 0 to PI (0° to 180°)
  let rotationX = options?.rotation?.x ?? 0
  let rotationY = options?.rotation?.y ?? 0
  let showFace = card.isMatched || card.isFlipped
  let flipY = 0
  const flipToFace = options?.flipToFace ?? false
  if (typeof options?.flipProgress === 'number') {
    const p = options.flipProgress
    // 0 to 1: rotationY 0 -> PI
    flipY = p * Math.PI
    if (p < 0.5) showFace = !flipToFace
    else showFace = flipToFace
    // If > 90deg, mirror content
    if (flipY > Math.PI / 2) {
      rotationY += Math.PI - flipY
    } else {
      rotationY += flipY
    }
  }
  draw3DCard(ctx, card, { rotationX, rotationY, showFace })
}

function drawBoard() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const card of cards.value) {
    // Flip animation
    const flipAnim = flipAnims.value.find(a => a.id === card.id && !a.done)
    // Hover effect
    let rotation: { x: number; y: number } | undefined
    if (hoveredCardId.value === card.id && !flipAnim) {
      rotation = hoverRotation.value
    }
    if (flipAnim) {
      drawCard(ctx, card, { rotation, flipProgress: flipAnim.progress, flipToFace: (flipAnim && typeof flipAnim.flippingTo === 'boolean' ? flipAnim.flippingTo : false) })
    } else {
      drawCard(ctx, card, { rotation })
    }
  }
}

function getCardAtPosition(x: number, y: number): number | null {
  for (const card of cards.value) {
    const cardX = card.col * CARD_WIDTH + (card.col + 1) * CARD_MARGIN
    const cardY = card.row * CARD_HEIGHT + (card.row + 1) * CARD_MARGIN
    if (
      x >= cardX && x <= cardX + CARD_WIDTH &&
      y >= cardY && y <= cardY + CARD_HEIGHT
    ) {
      return card.id
    }
  }
  return null
}

function handleCanvasMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const cardId = getCardAtPosition(x, y)
  if (cardId === null) {
    hoveredCardId.value = null
    drawBoard()
    return
  }
  hoveredCardId.value = cardId
  // Calculate rotation based on cursor position relative to card center
  const card = cards.value[cardId]
  const cardX = card.col * CARD_WIDTH + (card.col + 1) * CARD_MARGIN
  const cardY = card.row * CARD_HEIGHT + (card.row + 1) * CARD_MARGIN
  const centerX = cardX + CARD_WIDTH / 2
  const centerY = cardY + CARD_HEIGHT / 2
  const dx = (x - centerX) / (CARD_WIDTH / 2)
  const dy = (y - centerY) / (CARD_HEIGHT / 2)
  // Subtle rotation, max 8deg (in radians)
  hoverRotation.value = {
    x: dy * 0.14,
    y: -dx * 0.14
  }
  drawBoard()
}

function handleCanvasMouseLeave() {
  hoveredCardId.value = null
  drawBoard()
}

function animateFlip(cardId: number, toFace: boolean, cb?: () => void) {
  const duration = 320
  const start = performance.now()
  let anim = flipAnims.value.find(a => a.id === cardId && !a.done)
  if (!anim) {
    anim = { id: cardId, progress: 0, flippingTo: toFace, done: false }
    flipAnims.value.push(anim)
  }
  if (!anim) return;
  anim.flippingTo = toFace
  anim.progress = 0
  anim.done = false
  if (animating) return
  animating = true
  function step(now: number) {
    if (!anim) return;
    const elapsed = now - start
    anim.progress = Math.min(elapsed / duration, 1)
    drawBoard()
    if (anim.progress < 1) {
      requestAnimationFrame(step)
    } else {
      anim.done = true
      animating = false
      drawBoard()
      if (cb) cb()
    }
  }
  requestAnimationFrame(step)
}

function handleCanvasClick(event: MouseEvent) {
  if (isBoardLocked.value) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const cardIdx = getCardAtPosition(x, y)
  if (cardIdx === null) return
  const card = cards.value[cardIdx]
  if (card.isFlipped || card.isMatched) return

  isBoardLocked.value = true
  animateFlip(cardIdx, true, () => {
    card.isFlipped = true
    flippedIndices.value.push(cardIdx)
    drawBoard()
    if (flippedIndices.value.length === 2) {
      const [firstIdx, secondIdx] = flippedIndices.value
      const firstCard = cards.value[firstIdx]
      const secondCard = cards.value[secondIdx]
      if (firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          animateFlip(firstIdx, true, () => {
            firstCard.isMatched = true
            drawBoard()
          })
          animateFlip(secondIdx, true, () => {
            secondCard.isMatched = true
            flippedIndices.value = []
            isBoardLocked.value = false
            drawBoard()
          })
        }, 600)
      } else {
        setTimeout(() => {
          animateFlip(firstIdx, false, () => {
            firstCard.isFlipped = false
            drawBoard()
          })
          animateFlip(secondIdx, false, () => {
            secondCard.isFlipped = false
            flippedIndices.value = []
            isBoardLocked.value = false
            drawBoard()
          })
        }, 900)
      }
    } else {
      isBoardLocked.value = false
    }
  })
}

function resetGame() {
  setupCards()
  drawBoard()
}

onMounted(() => {
  setupCards()
  drawBoard()
})

watch(cards, () => {
  drawBoard()
})
</script>