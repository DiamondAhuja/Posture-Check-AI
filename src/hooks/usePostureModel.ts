import React from "react";
import * as tf from "@tensorflow/tfjs";
import { createClassifier, predictProba } from "../ml/classifier";
import { smoothPred } from "../ml/smoothing";

export type Status = "Good" | "Lean" | "Slouch" | "Unknown";

// Minimum samples per class before enabling Train
const MIN_SAMPLES = 60; // ~6s at 10 Hz

export function usePostureModel() {
  const modelRef = React.useRef<tf.LayersModel | null>(null);

  // prediction UI
  const [status, setStatus] = React.useState<Status>("Unknown");
  const [confidence, setConfidence] = React.useState(0);

  // collection/training UI
  const [recording, setRecording] = React.useState<"none" | "good" | "bad">(
    "none"
  );
  const [samplesGood, setSamplesGood] = React.useState(0);
  const [samplesBad, setSamplesBad] = React.useState(0);
  const [isTraining, setIsTraining] = React.useState(false);
  const [isTrained, setIsTrained] = React.useState(false);
  const [uiMsg, setUiMsg] = React.useState<string>(
    'Ready. Start with "Record Good" for 10–15 seconds.'
  );

  // internal buffers
  const Xgood = React.useRef<number[][]>([]);
  const Xbad = React.useRef<number[][]>([]);
  const lastSampleTs = React.useRef<number>(0);

  // init model once
  React.useEffect(() => {
    modelRef.current = createClassifier(6);
  }, []);

  // Stable event handler via ref to avoid render loops
  const handlerRef = React.useRef<(feat: number[] | null) => void>(() => {});
  React.useEffect(() => {
    handlerRef.current = (feat: number[] | null) => {
      if (!feat) {
        setStatus("Unknown");
        setConfidence(0);
        return;
      }

      // Throttle collection to 10Hz so sample counts are meaningful & light
      const now = performance.now();
      const throttleMs = 100; // 10 Hz
      const canSample = now - lastSampleTs.current >= throttleMs;

      if (canSample && recording === "good") {
        Xgood.current.push(feat);
        lastSampleTs.current = now;
        setSamplesGood(Xgood.current.length);
      } else if (canSample && recording === "bad") {
        Xbad.current.push(feat);
        lastSampleTs.current = now;
        setSamplesBad(Xbad.current.length);
      }

      // Predict only when trained
      const m = modelRef.current;
      if (!m || !isTrained) {
        setStatus("Unknown");
        setConfidence(0);
        return;
      }
      const proba = predictProba(m, feat);
      const { label, conf } = smoothPred(proba);
      setStatus(label as Status);
      setConfidence(conf);
    };
  }, [recording, isTrained]);

  React.useEffect(() => {
    const onFrame = (e: Event) => {
      const ce = e as CustomEvent<number[] | null>;
      handlerRef.current(ce.detail);
    };
    window.addEventListener("pcai:features", onFrame as EventListener);
    return () =>
      window.removeEventListener("pcai:features", onFrame as EventListener);
  }, []);

  // Controls
  const startGoodRecording = () => {
    setRecording("good");
    setUiMsg("Recording GOOD posture… Sit upright, eyes forward.");
  };
  const startBadRecording = () => {
    setRecording("bad");
    setUiMsg("Recording NOT GOOD… Slouch/lean/craning neck for examples.");
  };
  const stopRecording = () => {
    setRecording("none");
    setUiMsg(
      "Recording stopped. If both counters ≥ " + MIN_SAMPLES + ", click Train."
    );
  };

  const canTrain = !(samplesGood >= MIN_SAMPLES && samplesBad >= MIN_SAMPLES);

  async function train() {
    if (canTrain) {
      setUiMsg("Need more samples before training.");
      return;
    }
    setIsTraining(true);
    setUiMsg("Training model…");
    const m = modelRef.current ?? createClassifier(6);
    modelRef.current = m;

    // Build labels: Good = [1,0,0], NotGood split 50/50 to [0,1,0] and [0,0,1]
    const X = [...Xgood.current, ...Xbad.current];
    const Y: number[][] = [
      ...Xgood.current.map(() => [1, 0, 0]),
      ...Xbad.current.map((_, i) => (i % 2 === 0 ? [0, 1, 0] : [0, 0, 1])),
    ];

    const xs = tf.tensor2d(X);
    const ys = tf.tensor2d(Y);
    try {
      await m.fit(xs, ys, {
        epochs: 30,
        batchSize: 32,
        shuffle: true,
        verbose: 0,
      });
      setIsTrained(true);
      setUiMsg("Trained ✔ You can Save the model. Predictions are now live.");
    } finally {
      xs.dispose();
      ys.dispose();
      setIsTraining(false);
    }
  }

  async function save() {
    const m = modelRef.current;
    if (!m) {
      setUiMsg("Nothing to save yet.");
      return;
    }
    await m.save("indexeddb://posture-check");
    setUiMsg("Model saved to your browser (IndexedDB).");
  }
  async function load() {
    try {
      const m = await tf.loadLayersModel("indexeddb://posture-check");
      modelRef.current = m;
      setIsTrained(true);
      setUiMsg("Loaded saved model ✔");
    } catch (err) {
      console.warn("No saved model", err);
      setUiMsg("No saved model found. Train then Save first.");
    }
  }
  function reset() {
    Xgood.current = [];
    Xbad.current = [];
    setSamplesGood(0);
    setSamplesBad(0);
    modelRef.current = createClassifier(6);
    setIsTrained(false);
    setIsTraining(false);
    setStatus("Unknown");
    setConfidence(0);
    setUiMsg("Reset. Record new samples to retrain.");
  }

  return {
    status,
    confidence,
    // controls
    startGoodRecording,
    startBadRecording,
    stopRecording,
    canTrain,
    train,
    save,
    load,
    reset,
    // ui state
    recording,
    isTraining,
    isTrained,
    uiMsg,
    samplesGood,
    samplesBad,
  };
}
