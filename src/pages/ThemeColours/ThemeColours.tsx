import { useState } from "react";
import { useColor } from "../../hooks/useColor";
import { useClipboard } from "../../hooks/useClipboard";
import { ColorInput } from "../../components/ColorInput/ColorInput";
import { generateThemePalette, THEME_ROLES } from "../../utils/themePalette";
import {
  rgb2Hex,
  rgb2Hsl,
  rgb2Str,
  hsl2Str,
  hex2Str,
} from "../../utils/convertColours";
import { contrastTextColor } from "../../utils/contrastRatio";
import styles from "./ThemeColours.module.scss";

const DEFAULT_BASE = "#0d6efd";

const toCssIdent = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || "theme";

export const ThemeColours = () => {
  const [prefix, setPrefix] = useState("theme");
  const base = useColor(DEFAULT_BASE);
  const { copy, copiedKey } = useClipboard();

  const palette = generateThemePalette(base.color.rgb);
  const varPrefix = toCssIdent(prefix);

  const variables = THEME_ROLES.map(
    (role) => `--${varPrefix}-${role}: ${rgb2Hex(palette[role], true)};`,
  );
  const variablesText = variables.join("\n");

  return (
    <main className="main main--fixed">
      <h1>Theme colours</h1>

      <div className="flex flex--grid">
        <div className="flex__item flex__item--12 flex__item--3-sm">
          <div className="form__group">
            <label className="form__label" htmlFor="themePrefix">
              Prefix
            </label>
            <input
              id="themePrefix"
              className="form__control input input--large"
              placeholder="theme"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>
          <ColorInput
            id="themeBase"
            label="Brand colour"
            value={base.inputValue}
            onChange={base.update}
          />
        </div>

        <div className="card flex__item flex__item--12 flex__item--5-sm">
          <div className="card__body">
            {THEME_ROLES.map((role) => {
              const rgb = palette[role];
              const hex = rgb2Hex(rgb, false);
              const hexStr = hex2Str(hex);
              const rgbStr = rgb2Str(rgb);
              const hslStr = hsl2Str(rgb2Hsl(rgb));
              const textColor = hex2Str(contrastTextColor(rgb).AAA.hex);
              const key = `swatch-${role}`;
              return (
                <div
                  key={key}
                  role="group"
                  aria-label={`${role}: ${hexStr}`}
                  className={`flex ${styles.result}`}
                  style={{ color: textColor, backgroundColor: rgbStr }}
                >
                  <div>
                    <strong className={styles.roleLabel}>{role}</strong>
                    <br />
                    <span>{rgbStr}</span>
                    <br />
                    <span>{hslStr}</span>
                    <br />
                    <span>{hexStr}</span>
                  </div>
                  <div className="flex flex__item--as-center m-l-auto m-b-0">
                    <div>
                      <span className="fad fa-copy m-r-xs" aria-hidden="true" />
                      <span className="visually-hidden">Copy</span>
                      <button
                        className={`button button--sm${copiedKey === `${key}-hex` ? " button--success" : ""}`}
                        onClick={() => copy(hexStr, `${key}-hex`)}
                      >
                        HEX
                      </button>
                      <button
                        className={`button button--sm${copiedKey === `${key}-rgb` ? " button--success" : ""}`}
                        onClick={() => copy(rgbStr, `${key}-rgb`)}
                      >
                        RGB
                      </button>
                      <button
                        className={`button button--sm${copiedKey === `${key}-hsl` ? " button--success" : ""}`}
                        onClick={() => copy(hslStr, `${key}-hsl`)}
                      >
                        HSL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card flex__item flex__item--12 flex__item--4-sm">
          <div className="card__title">
            <h2>Custom properties</h2>
          </div>
          <div className="card__body">
            <pre className={`text--small ${styles.variables}`}>
              {variables.map((v) => (
                <span key={v}>
                  {v}
                  <br />
                </span>
              ))}
            </pre>
            <button
              className={`button button--sm${copiedKey === "variables" ? " button--success" : ""}`}
              onClick={() => copy(variablesText, "variables")}
            >
              <span className="fad fa-copy" /> Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
