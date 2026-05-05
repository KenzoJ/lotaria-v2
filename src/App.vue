<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { countWords, frequenciesDescending, sortWords, type SortedWords } from './count'
import { extractTextFromEpub } from './epubText'
import ExcerptTyper from './components/ExcerptTyper.vue'
import excerptText from './lotaria-excerpt.txt?raw'
import iowntEpubUrl from './IOWNT.epub?url'
import huxleyEpubUrl from './aldous-huxley.epub?url'

const textInput = ref('')
const buckets = ref<SortedWords>({})
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const epubInputRef = ref<HTMLInputElement | null>(null)
const excerptPanelRef = ref<HTMLElement | null>(null)
const excerptActive = ref(false)

const freqOrderDesc = computed(() => frequenciesDescending(buckets.value))

type BucketUiVersion = 'v1' | 'v2'

const bucketUiVersion = ref<BucketUiVersion>('v1')

function onSelectBucketUiVersion(version: BucketUiVersion) {
  bucketUiVersion.value = version
}

function isExcerptSectionReached() {
  const el = excerptPanelRef.value
  if (!el) return false
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || 1
  return rect.top <= vh * 0.6
}

function activateExcerpt() {
  if (excerptActive.value) return
  excerptActive.value = true
}

function scrollToExcerpt() {
  void nextTick(() => {
    const el = excerptPanelRef.value
    if (!el) return
    activateExcerpt()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onMounted(() => {
  const onScroll = () => {
    if (excerptActive.value) return
    if (!isExcerptSectionReached()) return
    activateExcerpt()
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  return () => {
    window.removeEventListener('scroll', onScroll)
  }
})

onBeforeUnmount(() => {
  // listeners are removed by the onMounted cleanup
})

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

async function analyzeEpubFile(file: File) {
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

async function onEpubSelected(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  await analyzeEpubFile(file)
}

async function onPickBuiltInEpub(url: string, filename: string) {
  errorMessage.value = null
  loading.value = true
  buckets.value = {}
  await nextTick()
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Could not load built-in EPUB (HTTP ${res.status}).`)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'application/epub+zip' })
    await analyzeEpubFile(file)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Could not load built-in EPUB.'
    loading.value = false
  }
}
</script>

<template>
  <div class="app">
    <section class="page-section page-section--buckets" aria-label="Word buckets section">
      <div class="section-inner">
        <header class="header">
          <h1 class="title">Lotaria's Novel Reader Program</h1>
          <p class="subtitle">
          Inspired by Italo Calvino's "If on a Winter's Night a Traveler," this is Lotaria's program. However you may feel about her, this amazing program allows the reader to finish a novel in a matter of minutes, freeing them to read even more novels.
          </p>
          <p class="subtitle">
          It counts the number of words and displays them in two ways.
          </p>
          <p class="subtitle">
          Scroll down to see the excerpt that inspired this.
          </p>
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
              <button
                type="button"
                class="btn btn-primary"
                :disabled="loading"
                @click="onAnalyzeTextarea"
              >
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
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="loading"
                @click="onPickEpub"
              >
                Choose EPUB file…
              </button>
            </div>

            <div class="divider" aria-hidden="true" />

            <div class="option">
              <span class="option-label">3. Use a built-in EPUB</span>
              <div class="btn-row" role="group" aria-label="Built-in EPUB choices">
                <button
                  type="button"
                  class="btn btn-secondary"
                  :disabled="loading"
                  @click="onPickBuiltInEpub(iowntEpubUrl, 'IOWNT.epub')"
                >
                  If on a Winter's Night a Traveler
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  :disabled="loading"
                  @click="onPickBuiltInEpub(huxleyEpubUrl, 'aldous-huxley.epub')"
                >
                  Aldous Huxley's Collection of Stories
                </button>
              </div>
            </div>
          </div>

          <section class="panel results" :class="{ 'results--empty': !freqOrderDesc.length }">
            <h2 class="results-heading">Word buckets</h2>
            <template v-if="freqOrderDesc.length">
              <div class="bucket-toolbar" aria-label="Word buckets controls">
                <div class="bucket-toolbar__group" role="group" aria-label="Version">
                  <button
                    type="button"
                    class="btn btn-secondary btn-small"
                    :class="{ 'btn--active': bucketUiVersion === 'v1' }"
                    @click="onSelectBucketUiVersion('v1')"
                  >
                    ver 1
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary btn-small"
                    :class="{ 'btn--active': bucketUiVersion === 'v2' }"
                    @click="onSelectBucketUiVersion('v2')"
                  >
                    ver 2
                  </button>
                </div>
              </div>

              <p v-for="freq in freqOrderDesc" :key="freq" class="bucket-line">
                <template v-if="bucketUiVersion === 'v2'">
                  <span class="freq">{{ freq }}</span>
                  <span class="words">{{ buckets[freq]?.join(', ') }}</span>
                </template>
                <template v-else>
                  <span class="freq">Words that appear {{ freq }} times:</span>
                  <br />
                  <span class="words">{{ buckets[freq]?.join(', ') }}</span>
                </template>
              </p>
            </template>
            <p v-else class="results-placeholder">Load text to see counts here.</p>
          </section>
        </div>

        <div class="next-section">
          <p class="next-section__hint">Scroll once to reach the excerpt section.</p>
          <button type="button" class="btn btn-secondary" @click="scrollToExcerpt">
            Continue to excerpt
          </button>
        </div>
      </div>
    </section>

    <section
      ref="excerptPanelRef"
      class="page-section page-section--excerpt"
      aria-label="Excerpt section"
    >
      <div class="section-inner">
        <ExcerptTyper
          v-if="excerptActive"
          title="If on a Winter's Night a Traveler"
          :text="excerptText"
          :active="excerptActive"
        />
      </div>
    </section>

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
