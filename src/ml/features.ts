import type { Pose } from "@tensorflow-models/pose-detection";

export function featuresFromPose(pose: Pose): number[] | null {
  const kp = Object.fromEntries(
    pose.keypoints.map((k) => [k.name, k] as const)
  ) as Record<string, { x: number; y: number; score?: number }>;

  const N = (name: string) => kp[name];
  const ok = (k?: { score?: number }) => (k?.score ?? 0) > 0.3; // min confidence

  const ls = N("left_shoulder");
  const rs = N("right_shoulder");
  const lh = N("left_hip");
  const rh = N("right_hip");
  const le = N("left_ear") ?? N("nose");
  const re = N("right_ear") ?? N("nose");

  if (!(ok(ls) && ok(rs) && ok(lh) && ok(rh) && ok(le) && ok(re))) return null;

  const v = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: b.x - a.x,
    y: b.y - a.y,
  });
  const dot = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    a.x * b.x + a.y * b.y;
  const mag = (a: { x: number; y: number }) => Math.hypot(a.x, a.y);
  const safeAngle = (a: any, b: any, c: any) => {
    const u = v(b, a),
      w = v(b, c);
    const d = dot(u, w) / (mag(u) * mag(w) + 1e-6);
    return (Math.acos(Math.min(1, Math.max(-1, d))) * 180) / Math.PI;
  };

  const shoulderWidth = Math.hypot(rs!.x - ls!.x, rs!.y - ls!.y) + 1e-6;

  const neckTiltL = safeAngle(ls, le, lh);
  const neckTiltR = safeAngle(rs, re, rh);
  const shoulderSlope =
    (Math.atan2(rs!.y - ls!.y, rs!.x - ls!.x) * 180) / Math.PI;
  const earToShoulderL =
    Math.hypot(le!.x - ls!.x, le!.y - ls!.y) / shoulderWidth;
  const earToShoulderR =
    Math.hypot(re!.x - rs!.x, re!.y - rs!.y) / shoulderWidth;

  return [
    neckTiltL,
    neckTiltR,
    shoulderSlope,
    earToShoulderL,
    earToShoulderR,
    Math.abs(neckTiltL - neckTiltR), // asymmetry
  ];
}
