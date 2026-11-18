import { describe, expect, it } from "vitest";
import pkg from "../package.json";

// `npx github:craigmcn/colours` makes npm install every dependency type from
// the public registry (a `build` script triggers a full install). Font Awesome
// Pro would 404 there, so it must be optional: npm skips it, Yarn installs it.
describe("package.json (npm git install of the colours-tokens CLI)", () => {
  const fontAwesome = (deps: Record<string, string> = {}) =>
    Object.keys(deps).filter((name) => name.startsWith("@fortawesome/"));

  it("lists Font Awesome Pro packages only as optionalDependencies", () => {
    expect(fontAwesome(pkg.dependencies)).toEqual([]);
    expect(fontAwesome(pkg.devDependencies)).toEqual([]);
    expect(fontAwesome(pkg.optionalDependencies)).not.toEqual([]);
  });
});
