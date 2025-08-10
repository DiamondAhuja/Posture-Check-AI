let ema = [0, 0, 0];
const alpha = 0.2;
let lastLabel: "Good" | "Lean" | "Slouch" | "Unknown" = "Unknown";
let notGoodSince = 0;

export function smoothPred(proba: [number, number, number]) {
  ema = [
    ema[0] * (1 - alpha) + proba[0] * alpha,
    ema[1] * (1 - alpha) + proba[1] * alpha,
    ema[2] * (1 - alpha) + proba[2] * alpha,
  ];
  const now = performance.now();
  const labels = ["Good", "Lean", "Slouch"] as const;
  const idx = ema.indexOf(Math.max(...ema));
  let label = labels[idx];
  let conf = ema[idx];

  const delay = 1500;
  if (lastLabel === "Good" && label !== "Good") {
    if (notGoodSince === 0) notGoodSince = now;
    if (now - notGoodSince < delay) {
      label = "Good";
      conf = ema[0];
    } else {
      notGoodSince = 0;
    }
  } else {
    if (label === "Good") notGoodSince = 0;
  }

  lastLabel = label;
  return { label, conf };
}
