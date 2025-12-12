// LiveJsonBox.js  (replace existing file)
import React, { useState, useEffect, useMemo } from "react";

/**
 * JsonBox (LiveJsonBox)
 * Props:
 * - jsonObj (object) - controlled current JSON shown in the editor
 * - onChange(jsonObj) - called only when user clicks "Apply JSON"
 * - autoSaveKey (string) - optional: localStorage key to persist the applied JSON
 */
export function JsonBox({ jsonObj, onChange, autoSaveKey = "infographicJson" }) {
  const [text, setText] = useState(() => pretty(jsonObj));
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  // keep memoized string of source JSON to compare for "unsaved changes"
  const sourceText = useMemo(() => pretty(jsonObj), [jsonObj]);

  useEffect(() => {
    // When external jsonObj changes (for example new project generated),
    // reset the editor text to reflect the authoritative source.
    setText(pretty(jsonObj));
    setError(null);
  }, [jsonObj]);

  function pretty(obj) {
    try {
      return JSON.stringify(obj ?? {}, null, 2);
    } catch {
      return String(obj);
    }
  }

  const hasChanges = sourceText !== text;

  const tryApply = async () => {
    setError(null);
    setApplying(true);
    try {
      const parsed = JSON.parse(text);

      // persist to localStorage if key provided
      if (autoSaveKey) {
        try {
          localStorage.setItem(autoSaveKey, JSON.stringify(parsed));
        } catch (e) {
          // ignore localStorage failures
          console.warn("localStorage write failed", e);
        }
      }

      // invoke callback so parent/store can update the UI (e.g., store.replaceProject(parsed))
      if (typeof onChange === "function") {
        // If replaceProject is expensive you may want to debounce or wrap in a command in the store.
        await onChange(parsed);
      }
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Infographic JSON</div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        rows={18}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #ccc",
          fontFamily: "monospace",
          fontSize: 13,
        }}
        // NOTE: removed onBlur auto-apply to require explicit click on "Apply JSON"
      />

      <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={tryApply}
          disabled={!hasChanges || applying}
          title={hasChanges ? "Apply changes to the canvas" : "No changes to apply"}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: hasChanges ? "#16a34a" : "#94d3a2",
            color: "white",
            fontWeight: 600,
            cursor: hasChanges && !applying ? "pointer" : "not-allowed",
            opacity: applying ? 0.8 : 1,
          }}
        >
          {applying ? "Applying..." : "Apply JSON"}
        </button>

        <button
          onClick={() => {
            setText(pretty(jsonObj)); // reset editor view to authoritative source
            setError(null);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Reset view
        </button>

        {error && <div style={{ color: "crimson", marginLeft: 8 }}>{error}</div>}
      </div>
    </div>
  );
}

export default JsonBox;
