import React from "react";
import CameraView from "./components/CameraView";
import StatusHUD from "./components/StatusHUD";
import CalibrationPanel from "./components/CalibrationPanel";
import { usePostureModel } from "./hooks/usePostureModel";

export default function App() {
  const {
    status,
    confidence,
    startGoodRecording,
    startBadRecording,
    stopRecording,
    canTrain,
    train,
    save,
    load,
    reset,
    samplesGood,
    samplesBad,
  } = usePostureModel();

  return (
    <div className="app">
      <header className="header">
        <h1>Posture Check AI</h1>
        <div className="small">
          On‑device pose detection + trainable classifier
        </div>
      </header>

      <main className="container">
        <section className="panel">
          <div
            className="row"
            style={{ justifyContent: "space-between", marginBottom: 8 }}
          >
            <StatusHUD status={status} confidence={confidence} />
            <div className="badge small">
              model: {canTrain ? "untrained" : "ready"}
            </div>
          </div>
          <CameraView
            onFeatureFrame={(f) =>
              window.dispatchEvent(
                new CustomEvent("pcai:features", { detail: f })
              )
            }
          />
        </section>

        <aside className="panel">
          <CalibrationPanel
            samplesGood={samplesGood}
            samplesBad={samplesBad}
            onStartGood={startGoodRecording}
            onStartBad={startBadRecording}
            onStop={stopRecording}
            onTrain={train}
            onSave={save}
            onLoad={load}
            onReset={reset}
            canTrain={canTrain}
          />
        </aside>
      </main>

      <footer className="footer small">
        All inference runs locally. We never upload frames.
      </footer>
    </div>
  );
}
