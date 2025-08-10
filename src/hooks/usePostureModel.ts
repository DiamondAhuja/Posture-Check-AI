import React from "react";
import * as tf from "@tensorflow/tfjs";
import { createClassifier, predictProba } from "../ml/classifier";
import { smoothPred } from "../ml/smoothing";

export type Status = "Good" | "Lean" | "Slouch" | "Unknown";

export function usePostureModel() {
  const modelRef = React.useRef<tf.LayersModel | null>(null);
  const [status, setStatus] = React.useState<Status>("Unknown");
  const [confidence, setConfidence] = React.useState(0);
  const [collect, setCollect] = React.useState<"none" | "good" | "bad">("none");
  const Xgood = React.useRef<number[][]>([]);
  const Xbad = React.useRef<number[][]>([]);
  const [samplesGood, setSamplesGood] = React.useState(0);
  const [samplesBad, setSamplesBad] = React.useState(0);

  React.useEffect(() => {
    function onFrame(e: Event) {
      const feat = (e as CustomEvent<number[] | null>).detail;
      if (!feat) {
        setStatus("Unknown");
        setConfidence(0);
        return;
      }

      if (collect === "good") {
        Xgood.current.push(feat);
        setSamplesGood(Xgood.current.length);
      }
      if (collect === "bad") {
        Xbad.current.push(feat);
        setSamplesBad(Xbad.current.length);
      }

      const m = modelRef.current;
      if (!m) {
        setStatus("Unknown");
        setConfidence(0);
        return;
      }
      const proba = predictProba(m, feat);
      const { label, conf } = smoothPred(proba);
      setStatus(label as Status);
      setConfidence(conf);
    }
    window.addEventListener("pcai:features", onFrame as EventListener);
    return () =>
      window.removeEventListener("pcai:features", onFrame as EventListener);
  }, [collect]);

  React.useEffect(() => {
    modelRef.current = createClassifier(6);
  }, []);

  const startGoodRecording = () => setCollect("good");
  const startBadRecording = () => setCollect("bad");
  const stopRecording = () => setCollect("none");

  const canTrain = samplesGood < 10 || samplesBad < 10;

  async function train() {
    const m = modelRef.current ?? createClassifier(6);
    modelRef.current = m;
    const X = [...Xgood.current, ...Xbad.current];
    const Y = [
      ...Xgood.current.map(() => [1, 0, 0]),
      ...Xbad.current.map(() => [0, 1, 1]),
    ];

    const xs = tf.tensor2d(X);
    const ys = tf.tensor2d(Y);
    await m.fit(xs, ys, { epochs: 25, batchSize: 32, shuffle: true });
    xs.dispose();
    ys.dispose();
  }

  async function save() {
    const m = modelRef.current;
    if (!m) return;
    await m.save("indexeddb://posture-check");
  }
  async function load() {
    try {
      const m = await tf.loadLayersModel("indexeddb://posture-check");
      modelRef.current = m;
    } catch (err) {
      console.warn("No saved model", err);
    }
  }
  function reset() {
    Xgood.current = [];
    Xbad.current = [];
    setSamplesGood(0);
    setSamplesBad(0);
    modelRef.current = createClassifier(6);
  }

  return {
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
  };
}
