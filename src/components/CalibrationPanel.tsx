import React from "react";

interface Props {
  onStartGood: () => void;
  onStartBad: () => void;
  onStop: () => void;
  onTrain: () => Promise<void>;
  onSave: () => Promise<void>;
  onLoad: () => Promise<void>;
  onReset: () => void;
  canTrain: boolean;
  recording: "none" | "good" | "bad";
  isTraining: boolean;
  isTrained: boolean;
  uiMsg: string;
  samplesGood: number;
  samplesBad: number;
}

export default function CalibrationPanel(p: Props) {
  const recColor =
    p.recording === "good"
      ? "var(--ok)"
      : p.recording === "bad"
      ? "var(--bad)"
      : "#26306b";

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Calibration</h3>
      <div className="row" style={{ gap: 10, marginBottom: 8 }}>
        <div className="badge small" style={{ background: recColor }}>
          {p.recording === "none"
            ? "Idle"
            : p.recording === "good"
            ? "Recording: GOOD"
            : "Recording: NOT GOOD"}
        </div>
        <div className="badge small">good: {p.samplesGood}</div>
        <div className="badge small">not good: {p.samplesBad}</div>
        <div className="badge small">
          model: {p.isTrained ? "ready" : "untrained"}
        </div>
      </div>

      <div className="calibBtns" style={{ marginTop: 12 }}>
        <button
          disabled={p.recording !== "none"}
          onClick={p.onStartGood}
          className="primary"
        >
          Record Good
        </button>
        <button disabled={p.recording !== "none"} onClick={p.onStartBad}>
          Record Not Good
        </button>
        <button disabled={p.recording === "none"} onClick={p.onStop}>
          Stop
        </button>
      </div>

      <div className="calibBtns" style={{ marginTop: 12 }}>
        <button
          disabled={p.canTrain || p.isTraining}
          onClick={p.onTrain}
          className="primary"
        >
          {p.isTraining ? "Training…" : "Train"}
        </button>
        <button onClick={p.onSave} disabled={!p.isTrained}>
          Save
        </button>
        <button onClick={p.onLoad}>Load</button>
        <button onClick={p.onReset}>Reset</button>
      </div>

      <div className="panel" style={{ marginTop: 12, padding: 10 }}>
        <div className="small" style={{ opacity: 0.9 }}>
          {p.uiMsg}
        </div>
      </div>

      <ol className="small" style={{ opacity: 0.8, marginTop: 12 }}>
        <li>
          Click <b>Record Good</b> for ~10–15s while sitting upright. Then click{" "}
          <b>Stop</b>.
        </li>
        <li>
          Click <b>Record Not Good</b> and deliberately slouch/lean for ~10–15s.
          Then <b>Stop</b>.
        </li>
        <li>
          When both counters are high enough, click <b>Train</b>. After
          training, predictions go live.
        </li>
        <li>
          (Optional) <b>Save</b> stores your model in-browser. Next time, click{" "}
          <b>Load</b>.
        </li>
      </ol>
    </div>
  );
}
