import React, { useState, useEffect } from "react";

/**
 * PromptBox
 * Props:
 * - apiUrl (string) optional (defaults to your local endpoint)
 * - onGenerated(jsonObj) (function) required callback invoked with parsed JSON from server
 */
export function PromptBox({ apiUrl = "http://127.0.0.1:8000//stock/infographic/generate/", onGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitPrompt = async () => {
    setError(null);
    if (!prompt.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error: ${resp.status} ${resp.statusText} ${text}`);
      }

      const data = await resp.json(); // expecting { data: {...}, message: "...", status: 200 }
      // If the server returns wrapper object like your example, pass the inner data
      const jsonResult = data?.data ?? data;

      // Save to localStorage for persistence and call callback
      try {
        localStorage.setItem("infographicJson", JSON.stringify(jsonResult));
      } catch (e) {
        // localStorage may fail on some browsers; ignore but don't crash
        console.warn("Could not write to localStorage", e);
      }

      if (typeof onGenerated === "function") onGenerated(jsonResult);
    } catch (err) {
      console.error("Prompt submit failed", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submitPrompt();
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, maxWidth: 760 }}>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Infographic prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "Infographic theme in green children playing at garden"'
          rows={4}
          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }}
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: "#0b74ff",
              color: "white",
              fontWeight: 600,
            }}
          >
            {loading ? "Generating..." : "Generate Infographic"}
          </button>

          <button
            type="button"
            onClick={() => {
              // quick preset examples
              setPrompt("Infographic theme in green children playing at garden");
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            Preset
          </button>

          {error && (
            <div style={{ color: "crimson", marginLeft: 8, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default PromptBox