import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

// Renders the router's current query string so page tests can assert on URL
// sync without reaching into MemoryRouter internals.
export const LocationProbe = () => (
  <output data-testid="location-search">{useLocation().search}</output>
);

export const currentSearch = (): URLSearchParams =>
  new URLSearchParams(screen.getByTestId("location-search").textContent!);
