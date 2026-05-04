import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { countWords, shortExampleText, exampleText } from '../count'

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
    expect(Object.keys(result).length).toBe(25)
  });
  //it('totals number of words for long text', () => {
    //const result = countWords(exampleText);
    //console.log(result)
    //expect(Object.keys(result).length).toBe(25)
  //})
})
