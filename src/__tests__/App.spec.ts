import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { countWords, sortWords } from '../count'
import { exampleText, shortExampleText, exampleSort } from "./mocks.ts"

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Lotaria')
  })
})

describe('Count', () => {
  it('totals up number of words for short text', () => {
    const result = countWords(shortExampleText);
    console.log(result)
    expect(Object.keys(result).length).toBe(6)
  });
  it('sorts words', () => {
    const result = sortWords(exampleSort);
    console.log(result)
    expect(Object.keys(result).length).toBe(4)
  });
  //it('totals number of words for long text', () => {
    //const result = countWords(exampleText);
    //console.log(result)
    //expect(Object.keys(result).length).toBe(25)
  //})
})
