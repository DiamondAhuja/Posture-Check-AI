import React from "react";

type Status = "Good" | "Lean" | "Slouch" | "Unknown";

export default function StatusHUD({
  status,
  confidence,
}: {
  status: Status;
  confidence: number;
}) {
  const color =
    status === "Good"
      ? "var(--ok)"
      : status === "Unknown"
      ? "#888"
      : status === "Lean"
      ? "var(--warn)"
      : "var(--bad)";
  return (
    <div className="hud">
      <div className="dot" style={{ background: color }} />
      <strong>{status}</strong>
      <span className="small" style={{ opacity: 0.8 }}>
        {" "}
        • conf {confidence.toFixed(2)}
      </span>
    </div>
  );
}
