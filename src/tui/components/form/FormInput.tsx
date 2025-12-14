/* eslint-disable custom/jsx-classname-required */

import type { InputRenderable } from '@opentui/core'
import { forwardRef } from 'react'

export interface FormInputProps {
  value?: string
  focused?: boolean
  placeholder?: string
  onInput?: (value: string) => void
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  maxLength?: number
}

export const FormInput = forwardRef<InputRenderable, FormInputProps>(
  function FormInput(
    { value, focused, placeholder, onInput, onChange, onSubmit, maxLength },
    ref
  ) {
    return (
      <input
        ref={ref}
        value={value}
        focused={focused}
        placeholder={placeholder}
        onInput={onInput}
        onChange={onChange}
        onSubmit={onSubmit}
        maxLength={maxLength}
        backgroundColor="transparent"
        focusedBackgroundColor="#1a1a2e"
        textColor="white"
        focusedTextColor="cyan"
        placeholderColor="gray"
        cursorColor="cyan"
        cursorStyle={{ style: 'block', blinking: true }}
      />
    )
  }
)
