import * as tf from "@tensorflow/tfjs";

export function createClassifier(inputDim: number) {
  const m = tf.sequential();
  m.add(
    tf.layers.dense({ inputShape: [inputDim], units: 16, activation: "relu" })
  );
  m.add(tf.layers.dropout({ rate: 0.1 }));
  m.add(tf.layers.dense({ units: 8, activation: "relu" }));
  m.add(tf.layers.dense({ units: 3, activation: "softmax" })); // [Good, Lean, Slouch]
  m.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });
  return m;
}

export function predictProba(model: tf.LayersModel, feat: number[]) {
  const t = tf.tensor2d([feat]);
  const pred = model.predict(t) as tf.Tensor;
  const arr = pred.arraySync() as number[][];
  t.dispose();
  pred.dispose();
  const [good, lean, slouch] = arr[0];
  return [good, lean, slouch] as [number, number, number];
}
