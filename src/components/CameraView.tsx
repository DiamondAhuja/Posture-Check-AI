import React from "react";
import { usePoseDetector } from "../hooks/usePoseDetector";
import { featuresFromPose } from "../ml/features";

interface Props {
  onFeatureFrame?: (feat: number[] | null) => void;
}

export default function CameraView({ onFeatureFrame }: Props) {
  const { videoRef, canvasRef, pose, confidence } = usePoseDetector();

  React.useEffect(() => {
    if (!pose) {
      onFeatureFrame?.(null);
      return;
    }
    const feat = featuresFromPose(pose);
    onFeatureFrame?.(feat);
  }, [pose]);

  return (
    <div className="videoWrap">
      <video
        ref={videoRef}
        className="canvas"
        autoPlay
        playsInline
        muted
      ></video>
      <canvas ref={canvasRef} className="canvas"></canvas>
      <div
        style={{ position: "absolute", left: 8, top: 8 }}
        className="badge small"
      >
        pose conf: {confidence.toFixed(2)}
      </div>
    </div>
  );
}
