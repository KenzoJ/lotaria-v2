<script setup lang="ts">
import { ref } from 'vue'
import { countWords } from './count'

const textInput = ref('')
const result = ref('')

function onSubmit() {
//  result.value = countWords("test")
}
</script>

<template>
  <h1>Lotaria's Novel Reader Program</h1>
  <textarea v-model="textInput" id="textarea" rows="4"></textarea>
  <button id="submit" type="button" @click="onSubmit">Submit</button>
  <p v-if="result">{{ result }}</p>
</template>

<style scoped></style>
