import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// TensorFlow.js backend init
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

const container = document.getElementById("root")!;
const root = createRoot(container);

async function bootstrap() {
  try {
    await tf.setBackend("webgl");
  } catch (_) {
    await tf.setBackend("cpu");
  }
  await tf.ready();
  root.render(<App />);
}

bootstrap();
