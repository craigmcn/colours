import { Fragment, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useColor } from "../../hooks/useColor";
import { useSearchParamsSync } from "../../hooks/useSearchParamsSync";
import { useClipboard } from "../../hooks/useClipboard";
import { ColorInput } from "../../components/ColorInput/ColorInput";
import type { ThemeMode } from "../../utils/themePalette";
import {
  generateThemePalette,
  generateDarkThemePalette,
  roleToKebab,
  THEME_ROLES,
} from "../../utils/themePalette";
import {
  rgb2Hex,
  rgb2Hsl,
  rgb2Str,
  hsl2Str,
  hex2Str,
} from "../../utils/convertColours";
import { contrastTextColor } from "../../utils/contrastRatio";
import { cssDeclarations, themeTokens, themeRecipe } from "../../utils/tokens";
import { readThemeParams, writeThemeParams } from "../../utils/toolParams";
import styles from "./ThemeColours.module.scss";

const DEFAULT_BASE = "#0d6efd";

const MODE_LABELS: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
};

export const ThemeColours = () => {
  const [searchParams] = useSearchParams();
  const [initial] = useState(() => readThemeParams(searchParams));
  const [prefix, setPrefix] = useState(initial.prefix);
  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const base = useColor(DEFAULT_BASE, initial.brand);
  const { copy, copiedKey } = useClipboard();

  const palette =
    mode === "light"
      ? generateThemePalette(base.color.rgb)
      : generateDarkThemePalette(base.color.rgb);
  const variables = cssDeclarations(themeTokens(palette, prefix));
  // The copied text leads with a comment recording the inputs, algorithm
  // version and a link, so pasted tokens say how to regenerate them (#109).
  const copyText = [
    themeRecipe({
      brand: base.color.hex,
      mode,
      prefix,
      appUrl: `${window.location.origin}${import.meta.env.BASE_URL}`,
    }),
    ...variables,
  ].join("\n");

  useSearchParamsSync(
    writeThemeParams({
      brand: base.inputValue ? base.color.hex : undefined,
      mode,
      prefix,
    }),
  );

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

          <fieldset className="form__group">
            <legend className="form__label">Mode</legend>

            <div className="button-group">
              {(["light", "dark"] as ThemeMode[]).map((m) => (
                <Fragment key={m}>
                  <input
                    id={`theme-mode-${m}`}
                    className="button-group__input"
                    type="radio"
                    name="themeMode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                  />
                  <label
                    className="button button--secondary button--sm"
                    htmlFor={`theme-mode-${m}`}
                  >
                    {MODE_LABELS[m]}
                  </label>
                </Fragment>
              ))}
            </div>
          </fieldset>
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
              const label = roleToKebab(role).replace(/-/g, " ");
              return (
                <div
                  key={key}
                  role="group"
                  aria-label={`${label}: ${hexStr}`}
                  className={`flex ${styles.result}`}
                  style={{ color: textColor, backgroundColor: rgbStr }}
                >
                  <div>
                    <strong className={styles.roleLabel}>{label}</strong>
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
            <h2>Custom properties — {MODE_LABELS[mode].toLowerCase()}</h2>
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
              onClick={() => copy(copyText, "variables")}
            >
              <span className="fad fa-copy" aria-hidden="true" /> Copy
            </button>
            <p className="text--small m-t-xs m-b-0">
              Copied text starts with a comment recording the inputs, algorithm
              version and a link to reproduce this result.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
