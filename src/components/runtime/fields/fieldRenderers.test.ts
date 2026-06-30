import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import type { TextField, SelectField, CheckboxField, DateField, FileField } from '@/types'
import TextFieldRenderer from './TextFieldRenderer.vue'
import SelectFieldRenderer from './SelectFieldRenderer.vue'
import CheckboxFieldRenderer from './CheckboxFieldRenderer.vue'
import DateFieldRenderer from './DateFieldRenderer.vue'
import FileFieldRenderer from './FileFieldRenderer.vue'

/**
 * Controllable stub for Quasar inputs that emits `update:model-value`,
 * so we can assert how a renderer transforms and forwards values.
 */
const InputEmitStub = defineComponent({
  name: 'QInputEmitStub',
  props: { modelValue: { type: [String, Number, Object], default: '' } },
  emits: ['update:model-value'],
  setup(_, { emit }) {
    return () =>
      h('input', {
        class: 'stub-input',
        onInput: (e: Event) => emit('update:model-value', (e.target as HTMLInputElement).value)
      })
  }
})

describe('field renderers', () => {
  describe('TextFieldRenderer', () => {
    const field: TextField = {
      id: 'f1',
      type: 'text',
      name: 'full_name',
      label: 'Full Name',
      required: true
    }

    it('emits a string value when the input changes', async () => {
      const wrapper = mount(TextFieldRenderer, {
        props: { field, modelValue: '' },
        global: { stubs: { 'q-input': InputEmitStub } }
      })

      await wrapper.find('.stub-input').setValue('Ada')

      expect(wrapper.emitted('update:modelValue')).toEqual([['Ada']])
    })

    it('matches the rendered snapshot', () => {
      const wrapper = mount(TextFieldRenderer, { props: { field, modelValue: '' } })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('SelectFieldRenderer', () => {
    const field: SelectField = {
      id: 'f2',
      type: 'select',
      name: 'role',
      label: 'Role',
      options: [
        { value: 'fe', label: 'Frontend' },
        { value: 'be', label: 'Backend' }
      ]
    }

    it('renders a select control', () => {
      const wrapper = mount(SelectFieldRenderer, { props: { field, modelValue: '' } })
      expect(wrapper.find('q-select-stub').exists()).toBe(true)
    })

    it('matches the rendered snapshot', () => {
      const wrapper = mount(SelectFieldRenderer, { props: { field, modelValue: '' } })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('CheckboxFieldRenderer', () => {
    it('renders a single checkbox when there are no options', () => {
      const field: CheckboxField = {
        id: 'f3',
        type: 'checkbox',
        name: 'agree',
        label: 'Agree'
      }
      const wrapper = mount(CheckboxFieldRenderer, { props: { field, modelValue: false } })
      expect(wrapper.find('q-checkbox-stub').exists()).toBe(true)
    })

    it('renders an option group with a label when options are provided', () => {
      const field: CheckboxField = {
        id: 'f4',
        type: 'checkbox',
        name: 'skills',
        label: 'Skills',
        options: [
          { value: 'ts', label: 'TypeScript' },
          { value: 'vue', label: 'Vue' }
        ]
      }
      const wrapper = mount(CheckboxFieldRenderer, { props: { field, modelValue: [] } })
      expect(wrapper.text()).toContain('Skills')
      expect(wrapper.find('q-option-group-stub').exists()).toBe(true)
    })
  })

  describe('DateFieldRenderer', () => {
    const field: DateField = {
      id: 'f5',
      type: 'date',
      name: 'start_date',
      label: 'Start date'
    }

    it('renders a date input', () => {
      const wrapper = mount(DateFieldRenderer, { props: { field, modelValue: '' } })
      expect(wrapper.find('q-input-stub').exists()).toBe(true)
    })

    it('matches the rendered snapshot', () => {
      const wrapper = mount(DateFieldRenderer, { props: { field, modelValue: '' } })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('FileFieldRenderer', () => {
    const field: FileField = {
      id: 'f6',
      type: 'file',
      name: 'resume',
      label: 'Resume',
      required: true,
      accept: '.pdf',
      maxSizeMb: 5
    }

    it('renders the label and a file picker', () => {
      const wrapper = mount(FileFieldRenderer, {
        props: { field, modelValue: null },
        global: { stubs: { 'q-file': true } }
      })
      expect(wrapper.text()).toContain('Resume')
      expect(wrapper.find('q-file-stub').exists()).toBe(true)
    })
  })
})
