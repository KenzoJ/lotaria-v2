<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { countWords, sortWords, frequenciesDescending, type SortedWords } from './count'
import { extractTextFromEpub } from './epubText'

const textInput = ref('')
const buckets = ref<SortedWords>({})
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const epubInputRef = ref<HTMLInputElement | null>(null)

const freqOrderDesc = computed(() => frequenciesDescending(buckets.value))

async function runBucketsFromText(source: string) {
  errorMessage.value = null
  loading.value = true
  buckets.value = {}
  await nextTick()
  try {
    await new Promise<void>((resolve) => {
      queueMicrotask(() => {
        buckets.value = sortWords(countWords(source))
        resolve()
      })
    })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

function onAnalyzeTextarea() {
  void runBucketsFromText(textInput.value)
}

function onPickEpub() {
  epubInputRef.value?.click()
}

async function onEpubSelected(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  errorMessage.value = null
  loading.value = true
  buckets.value = {}
  await nextTick()
  try {
    const text = await extractTextFromEpub(file)
    textInput.value = text
    await new Promise<void>((resolve) => {
      queueMicrotask(() => {
        buckets.value = sortWords(countWords(text))
        resolve()
      })
    })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Could not read EPUB.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Lotaria's Novel Reader Program</h1>
      <p class="subtitle">Choose how to load text; word buckets appear on the right.</p>
    </header>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <div class="main-grid">
    <div class="panel input-panel">
      <div class="option">
        <label class="option-label" for="textarea">1. Type or edit text</label>
        <textarea
          id="textarea"
          v-model="textInput"
          class="textarea"
          rows="8"
          placeholder="Paste or write novel text here…"
          :disabled="loading"
        />
        <button type="button" class="btn btn-primary" :disabled="loading" @click="onAnalyzeTextarea">
          Analyze this text
        </button>
      </div>

      <div class="divider" aria-hidden="true" />

      <div class="option">
        <span class="option-label">2. Upload an EPUB</span>
        <input
          ref="epubInputRef"
          type="file"
          class="sr-only"
          accept=".epub,application/epub+zip"
          :disabled="loading"
          @change="onEpubSelected"
        />
        <button type="button" class="btn btn-secondary" :disabled="loading" @click="onPickEpub">
          Choose EPUB file…
        </button>
      </div>
    </div>

    <section class="panel results" :class="{ 'results--empty': !freqOrderDesc.length }">
      <h2 class="results-heading">Word buckets</h2>
      <template v-if="freqOrderDesc.length">
        <p v-for="freq in freqOrderDesc" :key="freq" class="bucket-line">
          <span class="freq">{{ freq }}</span>
          <span class="words">{{ buckets[freq]?.join(', ') }}</span>
        </p>
      </template>
      <p v-else class="results-placeholder">Load text to see counts here.</p>
    </section>
    </div>

    <Transition name="fade">
      <div v-if="loading" class="loading-overlay" aria-live="polite" aria-busy="true">
        <div class="loading-card">
          <div class="spinner" aria-hidden="true" />
          <p class="loading-text">Building word buckets…</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  --bg: #f5f2eb;
  --surface: #fffcf7;
  --border: #c9c2b4;
  --text: #1e1c1a;
  --muted: #5a554c;
  --accent: #8b2635;
  --accent-dim: #6d1e2a;
  --accent-soft: #f0e4e6;
  --danger: #a32020;
  --radius: 2px;
  --font: 'Courier Prime', 'Courier New', Courier, monospace;

  min-height: 100vh;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 72rem;
  padding: 2rem 1.25rem 3rem;
  font-family: var(--font);
  color: var(--text);
  background: var(--bg);
}

.header {
  margin-bottom: 1.75rem;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.65rem;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.45;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 52rem) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--surface);
  border: 2px solid var(--text);
  border-radius: var(--radius);
  padding: 1.25rem 1.35rem;
  box-shadow: 3px 3px 0 rgba(30, 28, 26, 0.08);
}

.input-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.option-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--text);
  background: #fff;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  resize: vertical;
  min-height: 8rem;
  font-family: var(--font);
}

.textarea:focus {
  outline: 2px dashed var(--accent);
  outline-offset: 2px;
}

.textarea:disabled {
  opacity: 0.65;
}

.btn {
  align-self: flex-start;
  padding: 0.55rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: var(--font);
  border-radius: var(--radius);
  border: 2px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent-dim);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-dim);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 1.15rem 0;
}

.error {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: #fdeaea;
  border: 2px solid var(--danger);
  color: var(--danger);
  font-size: 0.9rem;
}

.results {
  margin-top: 0;
  min-height: 12rem;
}

.results--empty {
  border-style: dashed;
  border-color: var(--border);
}

.results-placeholder {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.5;
  font-style: italic;
}

.results-heading {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.bucket-line {
  margin: 0 0 0.65rem;
  font-size: 0.92rem;
  line-height: 1.5;
}

.freq {
  display: inline-block;
  min-width: 2.25rem;
  margin-right: 0.5rem;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.words {
  color: var(--text);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 242, 235, 0.85);
  backdrop-filter: blur(2px);
  z-index: 50;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem;
  background: var(--surface);
  border: 2px solid var(--text);
  border-radius: var(--radius);
  box-shadow: 4px 4px 0 rgba(30, 28, 26, 0.12);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.75s linear infinite;
}

.loading-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
html,
body {
  margin: 0;
  min-height: 100%;
  background: #f5f2eb;
}
</style>
