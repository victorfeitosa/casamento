<template>
  <div class="book-stage">
    <div ref="bookRef" class="book" @click="handleClick">
      <!-- Base layer: always shows the resting page underneath the flipping leaf -->
      <div class="page page-base">
        <img :src="pages[baseIndex]" :alt="`Page ${baseIndex + 1}`" draggable="false">
      </div>

      <!-- Flipping leaf: rotates on the Y axis to reveal the base layer -->
      <div
        class="page page-leaf"
        :class="{ 'no-transition': skipTransition }"
        :style="leafStyle"
        @transitionend="onTransitionEnd"
      >
        <div class="face face-front">
          <img :src="pages[frontIndex]" :alt="`Page ${frontIndex + 1}`" draggable="false">
        </div>
        <div class="face face-back">
          <img :src="pages[backIndex]" :alt="`Page ${backIndex + 1}`" draggable="false">
        </div>
      </div>

      <!-- Click affordance hints -->
      <div class="zone zone-left" :class="{ disabled: currentIndex === 0 }" />
      <div class="zone zone-right" :class="{ disabled: currentIndex === pages.length - 1 }" />
    </div>

    <div class="dots">
      <span
        v-for="(_, i) in pages"
        :key="i"
        class="dot"
        :class="{ active: i === currentIndex }"
      />
    </div>
  </div>
</template>

<script setup>
const pages = [
  '/images/page1.png',
  '/images/page2.png',
  '/images/page3.png'
]

const currentIndex = ref(0)
const isAnimating = ref(false)
const skipTransition = ref(false)
const rotation = ref(0)

// The leaf shows `frontIndex` on its front face and `backIndex` on its back face.
// `baseIndex` is the static page revealed once the leaf has rotated past 90deg.
const frontIndex = ref(0)
const backIndex = ref(1)
const baseIndex = ref(0)

const bookRef = ref(null)

// Pivot stays centered so the leaf's own rotation and its faces' pre-rotation
// share the same axis point — an edge pivot would swing the rectangle fully
// out of frame at 180deg instead of settling back into place.
const leafStyle = computed(() => ({
  transform: `rotateY(${rotation.value}deg)`
}))

function handleClick(event) {
  if (isAnimating.value || !bookRef.value) return

  const rect = bookRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickedRight = clickX > rect.width / 2

  if (clickedRight) goNext()
  else goPrev()
}

function goNext() {
  if (currentIndex.value >= pages.length - 1) return
  const next = currentIndex.value + 1

  frontIndex.value = currentIndex.value
  backIndex.value = next
  baseIndex.value = next
  rotation.value = 0

  isAnimating.value = true
  requestAnimationFrame(() => {
    rotation.value = -180
  })

  pendingIndex = next
}

function goPrev() {
  if (currentIndex.value <= 0) return
  const prev = currentIndex.value - 1

  frontIndex.value = currentIndex.value
  backIndex.value = prev
  baseIndex.value = prev
  rotation.value = 0

  isAnimating.value = true
  requestAnimationFrame(() => {
    rotation.value = 180
  })

  pendingIndex = prev
}

let pendingIndex = 0

function onTransitionEnd() {
  if (!isAnimating.value) return

  currentIndex.value = pendingIndex
  skipTransition.value = true
  rotation.value = 0
  frontIndex.value = currentIndex.value
  backIndex.value = currentIndex.value

  requestAnimationFrame(() => {
    skipTransition.value = false
    isAnimating.value = false
  })
}
</script>

<style scoped>
.book-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.book {
  position: relative;
  width: min(80vw, 420px);
  aspect-ratio: 5 / 7;
  perspective: 2000px;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  user-select: none;
}

.page {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  overflow: hidden;
}

.page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.page-base {
  z-index: 1;
}

.page-leaf {
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  will-change: transform;
}

.page-leaf.no-transition {
  transition: none;
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
}

.face-front {
  transform: rotateY(0deg);
}

.face-back {
  transform: rotateY(180deg);
}

.zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: rgba(255, 255, 255, 0.85);
  font-size: 2rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.zone-left {
  left: 0;
  justify-content: flex-start;
  padding-left: 0.75rem;
}

.zone-right {
  right: 0;
  justify-content: flex-end;
  padding-right: 0.75rem;
}

.zone:not(.disabled):hover {
  opacity: 1;
}

.zone-left::before {
  content: '‹';
}

.zone-right::before {
  content: '›';
}

.zone.disabled {
  cursor: default;
}

.dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: background 0.3s;
}

.dot.active {
  background: rgba(255, 255, 255, 0.9);
}
</style>
