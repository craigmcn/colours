import { useState, useCallback } from 'react'
import type { ColorValue } from '../types/colour'
import { parseText, splitHex } from '../utils/parseValues'
import { hex2Rgb, rgb2Hsl } from '../utils/convertColours'

const defaultColor = (defaultHex: string): ColorValue => {
  const hex = splitHex(defaultHex)
  const rgb = hex2Rgb(hex)
  const hsl = rgb2Hsl(rgb)
  return { hex, rgb, hsl }
}

export const useColor = (initialHex: string) => {
  const [color, setColor] = useState<ColorValue>(() => defaultColor(initialHex))
  const [sourceColor, setSourceColor] = useState<ColorValue>(() => defaultColor(initialHex))
  const [inputValue, setInputValue] = useState('')

  const update = useCallback((text: string) => {
    setInputValue(text)
    const [hex, rgb, hsl] = parseText(text, initialHex)
    setColor({ hex, rgb, hsl })
    setSourceColor({ hex, rgb, hsl })
  }, [initialHex])

  const set = useCallback((value: ColorValue, displayValue?: string, updateSource = false) => {
    setColor(value)
    if (displayValue !== undefined) setInputValue(displayValue)
    if (updateSource) setSourceColor(value)
  }, [])

  return { color, sourceColor, inputValue, update, set }
}
