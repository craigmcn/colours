import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeColours } from "./ThemeColours";
import { useClipboard } from "../../hooks/useClipboard";

vi.mock("../../hooks/useClipboard");

// Default state:
//   Brand colour  #0d6efd  rgb(13, 110, 253) — Bootstrap-blue-ish default
//   Prefix        'theme'
//
// Roles rendered, in order: primary, secondary, success, danger, warning,
// info, light, dark, white, grayLight, grayDark, black (12 swatches total).
// white/grayLight/grayDark/black are fixed a11y-recommended off-white/off-black
// neutrals (not pure #fff/#000, to avoid eye strain) and don't depend on the
// brand colour at all.

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({
    copy: vi.fn() as (text: string, key: string) => void,
    copiedKey: null,
    isSupported: true,
  });
});

const renderComponent = () => render(<ThemeColours />);

const pre = () => document.querySelector("pre")!;
const preText = () => pre().textContent!;
const preLines = () =>
  Array.from(pre().querySelectorAll("span")).map((s) => s.textContent!);

// ─── Initial render ───────────────────────────────────────────────────────────

describe("initial render", () => {
  it("renders the page heading", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { name: /theme colours/i }),
    ).toBeInTheDocument();
  });

  it("renders Prefix and Brand colour inputs", () => {
    renderComponent();
    expect(screen.getByLabelText("Prefix")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand colour")).toBeInTheDocument();
  });

  it("Prefix input defaults to 'theme'", () => {
    renderComponent();
    expect(screen.getByLabelText("Prefix")).toHaveValue("theme");
  });

  it("Brand colour input starts empty", () => {
    renderComponent();
    expect(screen.getByLabelText("Brand colour")).toHaveValue("");
  });

  it("renders 12 swatches — one HEX copy button per theme role", () => {
    renderComponent();
    expect(screen.getAllByRole("button", { name: "HEX" })).toHaveLength(12);
  });

  it("renders a Custom properties heading", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { name: /custom properties/i }),
    ).toBeInTheDocument();
  });

  it("renders a Copy button for the custom properties block", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });
});

// ─── CSS variable output ──────────────────────────────────────────────────────

describe("CSS variable output", () => {
  it("produces 12 CSS variable lines", () => {
    renderComponent();
    expect(preLines()).toHaveLength(12);
  });

  it("uses all 12 role suffixes, kebab-cased", () => {
    renderComponent();
    const text = preText();
    for (const role of [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "light",
      "dark",
      "white",
      "gray-light",
      "gray-dark",
      "black",
    ]) {
      expect(text).toMatch(new RegExp(`--theme-${role}:`));
    }
  });

  it("each variable line contains a hex colour value", () => {
    renderComponent();
    for (const line of preLines()) {
      expect(line).toMatch(/#[0-9a-f]{6}/);
    }
  });

  it("the primary variable matches the default brand colour", () => {
    renderComponent();
    expect(preText()).toMatch(/--theme-primary: #0d6efd/);
  });

  it("updates the prefix used in the variable names", async () => {
    const user = userEvent.setup();
    renderComponent();
    const prefixInput = screen.getByLabelText("Prefix");
    await user.clear(prefixInput);
    await user.type(prefixInput, "brand");
    expect(preText()).toMatch(/--brand-primary:/);
    expect(preText()).not.toMatch(/--theme-/);
  });
});

// ─── Brand colour input ───────────────────────────────────────────────────────

describe("Brand colour input", () => {
  it("updates the primary variable when a new brand hex is typed", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.type(screen.getByLabelText("Brand colour"), "#ff0000");
    expect(preText()).toMatch(/--theme-primary: #ff0000/);
  });

  it("accepts rgb() input", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.type(screen.getByLabelText("Brand colour"), "rgb(0, 0, 255)");
    expect(preText()).toMatch(/--theme-primary: #0000ff/);
  });

  it("re-derives the semantic roles when the brand colour changes", async () => {
    const user = userEvent.setup();
    renderComponent();
    const before = preText();
    await user.type(screen.getByLabelText("Brand colour"), "#ff0000");
    const after = preText();
    expect(after).not.toEqual(before);
  });
});

// ─── Palette structure ────────────────────────────────────────────────────────

describe("palette structure", () => {
  it("each swatch has HEX, RGB, and HSL copy buttons", () => {
    renderComponent();
    expect(screen.getAllByRole("button", { name: "HEX" })).toHaveLength(12);
    expect(screen.getAllByRole("button", { name: "RGB" })).toHaveLength(12);
    expect(screen.getAllByRole("button", { name: "HSL" })).toHaveLength(12);
  });

  it("all hex values in the variables are valid 6-char hex codes", () => {
    renderComponent();
    for (const line of preLines()) {
      const m = line.match(/(#[0-9a-f]+)/);
      expect(m).not.toBeNull();
      expect(m![1]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("renders a role label for each swatch", () => {
    renderComponent();
    for (const label of [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "light",
      "dark",
      "white",
      "gray light",
      "gray dark",
      "black",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("white and black are off-white/off-black, not pure #fff/#000", () => {
    renderComponent();
    expect(preText()).not.toMatch(/--theme-white: #ffffff/);
    expect(preText()).not.toMatch(/--theme-black: #000000/);
  });
});

// ─── Copy interactions ────────────────────────────────────────────────────────

describe("copy interactions", () => {
  it("clicking a swatch HEX button calls copy with a hex colour string", async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void;
    vi.mocked(useClipboard).mockReturnValue({
      copy: mockCopy,
      copiedKey: null,
      isSupported: true,
    });
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getAllByRole("button", { name: "HEX" })[0]);

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^#[0-9a-f]{6}$/),
      expect.any(String),
    );
  });

  it("clicking the Copy button copies all 8 CSS variable lines", async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void;
    vi.mocked(useClipboard).mockReturnValue({
      copy: mockCopy,
      copiedKey: null,
      isSupported: true,
    });
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: /copy/i }));

    const [text] = (mockCopy as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      string,
    ];
    expect(text.split("\n")).toHaveLength(12);
    expect(text).toMatch(/--theme-primary: #0d6efd;/);
    expect(text).not.toMatch(/\n$/);
    expect(text).not.toMatch(/;;/);
  });
});
