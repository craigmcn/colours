import llmsTxt from "../public/llms.txt?raw";
import { run } from "./cli/run";
import { PALETTE_ALGORITHM_VERSION } from "./utils/paletteScale";
import { THEME_ALGORITHM_VERSION } from "./utils/themePalette";
import { readPaletteParams, readThemeParams } from "./utils/toolParams";

// llms.txt is hand-written docs for agents; these tests stop it drifting
// from what the code actually does.

const codeBlocks = (lang: string): string[] =>
  [
    ...llmsTxt.matchAll(new RegExp("```" + lang + "\\n([\\s\\S]*?)```", "g")),
  ].map((m) => m[1]);

describe("public/llms.txt", () => {
  it("states the current algorithm versions", () => {
    expect(llmsTxt).toContain(
      `theme algorithm v${THEME_ALGORITHM_VERSION}, palette algorithm v${PALETTE_ALGORITHM_VERSION}`,
    );
    expect(llmsTxt).toContain(
      `## Theme algorithm (v${THEME_ALGORITHM_VERSION})`,
    );
    expect(llmsTxt).toContain(
      `## Palette algorithm (v${PALETTE_ALGORITHM_VERSION})`,
    );
  });

  it("only shows CLI commands that succeed", () => {
    const commands = codeBlocks("bash")
      .flatMap((block) => block.split("\n"))
      .map((line) => line.match(/ ((?:theme|palette) .*)$/)?.[1])
      .filter((args): args is string => args !== undefined);
    expect(commands.length).toBeGreaterThanOrEqual(3);
    for (const args of commands) {
      const result = run(args.split(/\s+/));
      expect(result.stderr, args).toBe("");
      expect(result.code, args).toBe(0);
    }
  });

  it("shows CSS output that the CLI really produces for the documented inputs", () => {
    const [example] = codeBlocks("css");
    const actual = run([
      "theme",
      "--brand",
      "3366cc",
      "--mode",
      "dark",
      "--prefix",
      "brand",
    ]).stdout;
    expect(actual.startsWith(example)).toBe(true);
  });

  it("gives example URLs whose params are all valid", () => {
    const urls = [
      ...llmsTxt.matchAll(
        /https:\/\/www\.craigmcn\.com\/colours\/(theme|palette)\?(\S+)/g,
      ),
    ];
    expect(urls.map((m) => m[1]).sort()).toEqual(
      expect.arrayContaining(["palette", "theme"]),
    );
    for (const [, tool, query] of urls) {
      const params = new URLSearchParams(query);
      if (tool === "theme") {
        expect(readThemeParams(params).brand, query).not.toBe("");
      } else {
        expect(readPaletteParams(params).base, query).not.toBe("");
      }
    }
  });
});
