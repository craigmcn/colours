import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Mirrors page state into the query string so a result can be linked to and
// reproduced (#109). `replace` keeps typing from adding a history entry per
// keystroke; the string compare stops the write from re-triggering itself.
export const useSearchParamsSync = (next: URLSearchParams): void => {
  const [current, setSearchParams] = useSearchParams();
  const nextString = next.toString();

  useEffect(() => {
    if (nextString !== current.toString())
      setSearchParams(nextString, { replace: true });
  }, [nextString, current, setSearchParams]);
};
