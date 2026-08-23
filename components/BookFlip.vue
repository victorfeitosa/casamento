<template>
  <div class="book-stage">
    <div ref="bookRef" class="book" @click="handleClick" @tap="handleClick" >
      <!-- Base layer: the resting page revealed as the leaf swings away -->
      <div class="page page-base">
        <img :src="pages[baseIndex]" :alt="`Page ${baseIndex + 1}`" draggable="false">
      </div>

      <!-- Leaf: hinges on the left edge and only ever swings within a quarter
           turn, so it's always edge-on or flatter — its back never comes into view. -->
      <div
        ref="leafRef"
        class="page page-leaf"
        :class="{ 'no-transition': skipTransition }"
        :style="{ transform: `rotateY(${rotation}deg)` }"
        @transitionend="onTransitionEnd"
      >
        <img :src="pages[leafIndex]" :alt="`Page ${leafIndex + 1}`" draggable="false">
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
const { app } = useRuntimeConfig()
const withBase = (path) => app.baseURL.replace(/\/$/, '') + path

const pages = [
  withBase('/images/page1.png'),
  withBase('/images/page2.png'),
  withBase('/images/page3.png')
]

const currentIndex = ref(0)
const isAnimating = ref(false)
const skipTransition = ref(false)
const rotation = ref(0)

// The leaf always hinges on the left edge and shows `leafIndex`. Going
// forward it starts flat (0deg) and collapses to edge-on (-90deg),
// revealing `baseIndex` underneath. Going back is the exact time-reverse:
// the leaf starts edge-on already showing the previous page and unfurls
// back to flat, covering the base layer up again.
const leafIndex = ref(0)
const baseIndex = ref(0)
const direction = ref('next')

const bookRef = ref(null)
const leafRef = ref(null)

let pendingIndex = 0

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

  direction.value = 'next'
  pendingIndex = next
  isAnimating.value = true

  leafIndex.value = currentIndex.value
  baseIndex.value = next

  requestAnimationFrame(() => {
    rotation.value = -90
  })
}

function goPrev() {
  if (currentIndex.value <= 0) return
  const prev = currentIndex.value - 1

  direction.value = 'prev'
  pendingIndex = prev
  isAnimating.value = true

  leafIndex.value = prev
  baseIndex.value = currentIndex.value

  // Snap the leaf to the collapsed pose instantly (matching what's already
  // on screen — the base layer showing the current page) before animating
  // it back open. Forcing a layout read between the two style changes
  // stops the browser from tweening the snap itself.
  skipTransition.value = true
  rotation.value = -90
  requestAnimationFrame(() => {
    void leafRef.value?.offsetHeight
    skipTransition.value = false
    requestAnimationFrame(() => {
      rotation.value = 0
    })
  })
}

function onTransitionEnd(event) {
  if (event.propertyName !== 'transform' || !isAnimating.value) return

  currentIndex.value = pendingIndex

  if (direction.value === 'next') {
    // Leaf ended collapsed at -90deg. Snap it back to the flat resting
    // pose showing the new current page, ready for the next flip. Forcing
    // a layout read before re-enabling the transition stops the browser
    // from coalescing the snap with the next change and animating it.
    skipTransition.value = true
    rotation.value = 0
    leafIndex.value = currentIndex.value
    baseIndex.value = currentIndex.value
    requestAnimationFrame(() => {
      void leafRef.value?.offsetHeight
      skipTransition.value = false
      isAnimating.value = false
    })
  } else {
    // Leaf ended flat at 0deg, already showing the new current page.
    baseIndex.value = currentIndex.value
    isAnimating.value = false
  }
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
  width: min(95vw, 420px);
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
  left: 0;
  transform-origin: 0% 50%;
  backface-visibility: hidden;
  transition: transform 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  will-change: transform;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.25);
}

.page-leaf.no-transition {
  transition: none;
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
