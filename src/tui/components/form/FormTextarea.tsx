/* eslint-disable custom/jsx-classname-required */

import type { TextareaRenderable } from '@opentui/core'
import { forwardRef } from 'react'

export interface FormTextareaProps {
  initialValue?: string
  focused?: boolean
  placeholder?: string
  height?: number
  wrapMode?: 'none' | 'char' | 'word'
  onContentChange?: () => void
}

const DEFAULT_HEIGHT = 5
const DEFAULT_WRAP_MODE = 'word' as const

export const FormTextarea = forwardRef<TextareaRenderable, FormTextareaProps>(
  function FormTextarea(props, ref) {
    const { initialValue, focused, placeholder, onContentChange } = props
    // eslint-disable-next-line no-restricted-syntax
    const height = props.height ?? DEFAULT_HEIGHT
    // eslint-disable-next-line no-restricted-syntax
    const wrapMode = props.wrapMode ?? DEFAULT_WRAP_MODE
    return (
      <textarea
        ref={ref}
        initialValue={initialValue}
        focused={focused}
        placeholder={placeholder}
        height={height}
        wrapMode={wrapMode}
        onContentChange={onContentChange}
        backgroundColor="transparent"
        focusedBackgroundColor="#1a1a2e"
        textColor="white"
        focusedTextColor="cyan"
        cursorColor="cyan"
        cursorStyle={{ style: 'block', blinking: true }}
      />
    )
  }
)
