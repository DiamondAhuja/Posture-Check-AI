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
  samplesGood: number;
  samplesBad: number;
}

export default function CalibrationPanel(p: Props) {
  const [recording, setRecording] = React.useState<"none" | "good" | "bad">(
    "none"
  );

  const startGood = () => {
    setRecording("good");
    p.onStartGood();
  };
  const startBad = () => {
    setRecording("bad");
    p.onStartBad();
  };
  const stop = () => {
    setRecording("none");
    p.onStop();
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Calibration</h3>
      <ol className="small" style={{ opacity: 0.9 }}>
        <li>Sit in your best posture, look forward.</li>
        <li>
          Record 10–15 seconds of <b>Good</b> and 10–15 seconds of{" "}
          <b>Not Good</b>.
        </li>
        <li>Train, then save your model.</li>
      </ol>

      <div className="calibBtns" style={{ marginTop: 12 }}>
        <button
          disabled={recording !== "none"}
          onClick={startGood}
          className="primary"
        >
          Record Good
        </button>
        <button disabled={recording !== "none"} onClick={startBad}>
          Record Not Good
        </button>
        <button disabled={recording === "none"} onClick={stop}>
          Stop
        </button>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <div className="badge small">good: {p.samplesGood}</div>
        <div className="badge small">not good: {p.samplesBad}</div>
      </div>

      <div className="calibBtns" style={{ marginTop: 16 }}>
        <button disabled={p.canTrain} onClick={p.onTrain} className="primary">
          Train
        </button>
        <button onClick={p.onSave}>Save</button>
        <button onClick={p.onLoad}>Load</button>
        <button onClick={p.onReset}>Reset</button>
      </div>
    </div>
  );
}
