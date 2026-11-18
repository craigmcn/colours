import { describe, expect, it } from "vitest";
import pkg from "../package.json";

// `npx github:craigmcn/colours` installs `dependencies` from the public npm
// registry, and a `prepare` script would make it install devDependencies too.
// Private packages (Font Awesome Pro) would 404 and break the CLI install.
describe("package.json (npm git install of the colours-tokens CLI)", () => {
  it("keeps Font Awesome Pro packages out of dependencies", () => {
    const deps = Object.keys(pkg.dependencies);
    expect(deps.filter((name) => name.startsWith("@fortawesome/"))).toEqual([]);
  });

  it("has no prepare script", () => {
    expect(pkg.scripts).not.toHaveProperty("prepare");
  });
});
