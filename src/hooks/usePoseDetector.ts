import React from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";

const CIRCLE = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

export function usePoseDetector() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] =
    React.useState<posedetection.PoseDetector | null>(null);
  const [pose, setPose] = React.useState<posedetection.Pose | null>(null);
  const [confidence, setConfidence] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    let raf = 0;
    let stream: MediaStream | null = null;

    async function setup() {
      await tf.ready();

      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      const d = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER }
      );
      if (!active) return;
      setDetector(d);

      const loop = async () => {
        if (!active) return;
        if (d && v.readyState >= 2) {
          const poses = await d.estimatePoses(v, { flipHorizontal: false });
          const p = poses[0] ?? null;
          setPose(p);
          const conf =
            p?.keypoints?.reduce((s, k) => s + (k.score ?? 0), 0) /
            (p?.keypoints?.length || 1);
          setConfidence(conf || 0);
          draw(p);
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    function draw(p: posedetection.Pose | null) {
      const v = videoRef.current!,
        c = canvasRef.current!;
      if (!v || !c) return;
      const ctx = c.getContext("2d")!;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, c.width, c.height);

      if (!p) return;
      ctx.fillStyle = "#3b66ff";
      ctx.strokeStyle = "#3b66ff";
      ctx.lineWidth = 2;
      for (const k of p.keypoints) {
        if ((k.score ?? 0) > 0.4) CIRCLE(ctx, k.x, k.y, 3);
      }
      const by = Object.fromEntries(p.keypoints.map((k) => [k.name, k]));
      const pairs: [string, string][] = [
        ["left_shoulder", "right_shoulder"],
        ["left_hip", "right_hip"],
        ["left_shoulder", "left_elbow"],
        ["left_elbow", "left_wrist"],
        ["right_shoulder", "right_elbow"],
        ["right_elbow", "right_wrist"],
        ["left_hip", "left_knee"],
        ["left_knee", "left_ankle"],
        ["right_hip", "right_knee"],
        ["right_knee", "right_ankle"],
        ["left_shoulder", "left_hip"],
        ["right_shoulder", "right_hip"],
      ];
      for (const [a, b] of pairs) {
        const A = by[a],
          B = by[b];
        if (A && B && (A.score ?? 0) > 0.4 && (B.score ?? 0) > 0.4) {
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }
      }
    }

    setup();
    return () => {
      active = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      detector?.dispose?.();
    };
  }, []);

  return { videoRef, canvasRef, pose, confidence };
}
