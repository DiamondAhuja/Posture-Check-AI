# Posture Check AI

AI-powered posture detection app using your PC camera, with **trainable personal calibration**. Runs entirely on-device with TensorFlow.js — no frames are uploaded.

## ✨ Features

- Live webcam feed with real-time pose detection (MoveNet SinglePose Thunder)
- Extracts posture-relevant features (neck tilt, shoulder slope, ear-to-shoulder distance, asymmetry)
- Trainable classifier tailored to your posture and camera setup
- Record “Good” and “Not Good” samples for personal calibration
- Save/load trained model in your browser (IndexedDB)
- Visual feedback and confidence scoring

## 🛠 Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [TensorFlow.js](https://www.tensorflow.org/js) with [MoveNet](https://www.tensorflow.org/lite/models/pose_estimation/overview)
- IndexedDB for model storage

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/DiamondAhuja/posture-check-ai.git
cd posture-check-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm run preview
```

## 📋 Usage

1. **Record Good:** Sit upright, look forward, click `Record Good`, wait ~10–15 seconds, click `Stop`.
2. **Record Not Good:** Slouch or lean, click `Record Not Good`, wait ~10–15 seconds, click `Stop`.
3. **Train:** Enabled when enough samples are collected. Click to train your model.
4. **Save:** Stores your trained model in your browser.
5. **Load:** Loads your saved model for future sessions.
6. **Reset:** Clears samples and model.

## 🔍 Model Details

- **Pose detection:** MoveNet SinglePose Thunder (more accurate than Lightning; requires slightly more compute)
- **Classifier:** Small dense neural net trained on personal posture samples
- **Features:** 6 angles/distances extracted from keypoints, normalized for body size

## 📄 License

MIT — free to use and modify.

---

### Tips for Best Accuracy

- Place your camera at shoulder height, facing you
- Ensure good lighting
- Avoid baggy clothing covering shoulders
- Collect at least 60–100 samples per class for training
- Recalibrate if your seating or camera angle changes
