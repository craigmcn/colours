import { describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";
import netlifyToml from "../netlify.toml?raw";

async function sha256Base64(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

// Vite swaps %BASE_URL% into the inline script at build time, so each base in
// build:netlify ships different script bytes and needs its own hash.
const BUILD_BASES = ["/", "/colours/"];

// The CSP allows index.html's inline redirect script by hash, so any edit to
// the script must update netlify.toml too, or browsers will block it.
describe("Content-Security-Policy", () => {
  it("allows every inline script in index.html by its hash, for each build base", async () => {
    const scripts = [...indexHtml.matchAll(/<script>(.*?)<\/script>/gs)].map(
      (match) => match[1],
    );
    expect(scripts.length).toBeGreaterThan(0);

    for (const script of scripts) {
      for (const base of BUILD_BASES) {
        const built = script.split("%BASE_URL%").join(base);
        expect(netlifyToml).toContain(`'sha256-${await sha256Base64(built)}'`);
      }
    }
  });
});
