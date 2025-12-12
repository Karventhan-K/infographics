import "@/styles/globals.css";
import "@/utils/fontPage.js";
import { createInfographicsStore } from "@/stores/InfographicsStore";
import { createContext } from "react";
import { Observer } from "mobx-react-lite";
import infographicData from "@/constants/infographicData";

export const InfographicsContext = createContext(null);

// Try to seed initialProject from localStorage if present (safe for SSR)
let initialProject = infographicData;
try {
  if (typeof window !== "undefined" && window.localStorage) {
    const raw = window.localStorage.getItem("infographicJson");
    if (raw) {
      // Defensive parse — if it fails we fallback to infographicData
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") initialProject = parsed;
    }
  }
} catch (err) {
  // If anything goes wrong (parse error, privacy mode, etc.) fallback silently
  // but log for debugging during development.
  // eslint-disable-next-line no-console
  console.warn("Could not load infographicJson from localStorage — using default.", err);
}

const store = createInfographicsStore(initialProject);

export default function App({ Component, pageProps }) {
  return (
    <InfographicsContext.Provider value={store}>
      <Observer>{() => <Component {...pageProps} />}</Observer>
    </InfographicsContext.Provider>
  );
}
