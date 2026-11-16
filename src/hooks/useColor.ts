import { useState, useCallback } from "react";
import type { ColorValue } from "../types/colour";
import { parseText, splitHex } from "../utils/parseValues";
import { hex2Rgb, rgb2Hsl } from "../utils/convertColours";

const defaultColor = (defaultHex: string): ColorValue => {
  const hex = splitHex(defaultHex);
  const rgb = hex2Rgb(hex);
  const hsl = rgb2Hsl(rgb);
  return { hex, rgb, hsl };
};

const parsedColor = (text: string, defaultHex: string): ColorValue => {
  const [hex, rgb, hsl] = parseText(text, defaultHex);
  return { hex, rgb, hsl };
};

// initialInput pre-fills the input (e.g. from a URL param) as if typed, so
// the page behaves exactly as it would after the user entered that value.
export const useColor = (initialHex: string, initialInput = "") => {
  const [color, setColor] = useState<ColorValue>(() =>
    initialInput
      ? parsedColor(initialInput, initialHex)
      : defaultColor(initialHex),
  );
  const [sourceColor, setSourceColor] = useState<ColorValue>(() =>
    initialInput
      ? parsedColor(initialInput, initialHex)
      : defaultColor(initialHex),
  );
  const [inputValue, setInputValue] = useState(initialInput);

  const update = useCallback(
    (text: string) => {
      setInputValue(text);
      const value = parsedColor(text, initialHex);
      setColor(value);
      setSourceColor(value);
    },
    [initialHex],
  );

  const set = useCallback(
    (value: ColorValue, displayValue?: string, updateSource = false) => {
      setColor(value);
      if (displayValue !== undefined) setInputValue(displayValue);
      if (updateSource) setSourceColor(value);
    },
    [],
  );

  return { color, sourceColor, inputValue, update, set };
};
