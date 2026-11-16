import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSearchParamsSync } from "./useSearchParamsSync";
import { currentSearch, LocationProbe } from "../test/LocationProbe";

const Sync = ({ query }: { query: string }) => {
  useSearchParamsSync(new URLSearchParams(query));
  return null;
};

const renderAt = (entry: string, query: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Sync query={query} />
      <LocationProbe />
    </MemoryRouter>,
  );

describe("useSearchParamsSync", () => {
  it("writes the given params to the URL", () => {
    renderAt("/theme", "brand=3366cc");
    expect(currentSearch().toString()).toBe("brand=3366cc");
  });

  it("replaces params that don't match the page state", () => {
    renderAt("/theme?brand=nope&extra=1", "mode=dark");
    expect(currentSearch().toString()).toBe("mode=dark");
  });

  it("clears the query when there's nothing to write", () => {
    renderAt("/theme?mode=light", "");
    expect(currentSearch().toString()).toBe("");
  });

  it("updates when the params change", () => {
    const { rerender } = renderAt("/theme", "brand=111111");
    rerender(
      <MemoryRouter initialEntries={["/theme"]}>
        <Sync query="brand=222222" />
        <LocationProbe />
      </MemoryRouter>,
    );
    expect(currentSearch().get("brand")).toBe("222222");
  });
});
