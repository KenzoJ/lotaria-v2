<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type Props = {
  text: string
  title?: string
  active?: boolean
}

const props = defineProps<Props>()

const rootRef = ref<HTMLElement | null>(null)
const visibleChars = ref(0)
const done = ref(false)

const safeText = computed(() => props.text.replace(/\r\n/g, '\n'))

const visibleText = computed(() => {
  if (!props.active) return ''
  if (done.value) return safeText.value
  return safeText.value.slice(0, Math.max(0, Math.min(safeText.value.length, visibleChars.value)))
})

let rafId: number | null = null
let cancelTyping: (() => void) | null = null

function stop() {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }
  cancelTyping?.()
  cancelTyping = null
}

function startTyping() {
  stop()
  done.value = false
  visibleChars.value = 0

  const full = safeText.value
  if (!props.active || full.length === 0) return

  const charsPerSecond = 840
  let last = performance.now()

  const tick = (now: number) => {
    if (!props.active) return
    const dt = Math.max(0, now - last)
    last = now
    visibleChars.value = Math.min(full.length, visibleChars.value + (dt / 1000) * charsPerSecond)
    if (visibleChars.value >= full.length) {
      done.value = true
      rafId = null
      return
    }
    rafId = window.requestAnimationFrame(tick)
  }

  rafId = window.requestAnimationFrame(tick)
  cancelTyping = () => stop()
}

watch(
  () => [props.active, safeText.value] as const,
  ([active]) => {
    if (!active) {
      stop()
      done.value = false
      visibleChars.value = 0
      return
    }
    startTyping()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stop()
})
</script>

<template>
  <section ref="rootRef" class="excerpt">
    <h2 class="excerpt__title">{{ title ?? 'Excerpt' }}</h2>
    <pre
      class="excerpt__text"
      role="region"
      aria-label="Lotaria excerpt"
    ><span>{{ visibleText }}</span
      ><span v-if="active && !done" class="excerpt__caret" aria-hidden="true">▋</span></pre>
  </section>
</template>
