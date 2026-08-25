import { useEffect, useRef, useState } from "react";

// Tips shown during live capture — these are the biggest real-world driver of
// how accurate a vision-model body estimate can be, more than the model itself.
const GUIDE_HINTS = [
  "Stand back so your whole body fits in frame",
  "Use a plain background and even lighting",
  "Wear fitted clothing, arms relaxed slightly away from your sides",
  "Face the camera straight on",
];

// Live webcam + upload chooser for the onboarding body-photo step.
// Renders a "Use webcam" / "Upload a photo" choice, then either a live
// getUserMedia preview with an alignment guide and a capture button, or a
// plain file input. Calls onCapture(file) with a File once a photo is ready.
export default function BodyPhotoCapture({ onCapture, disabled, knownHeightCm, onKnownHeightChange }) {
  const [mode, setMode] = useState(null); // null | "camera" | "upload"
  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode !== "camera") return undefined;
    let cancelled = false;
    let activeStream = null;

    async function start() {
      setCameraError("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Your browser doesn't support live camera capture here — upload a photo instead.");
        setMode(null);
        return;
      }
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) {
          activeStream.getTracks().forEach((track) => track.stop());
          return;
        }
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (cancelled) return;
        setCameraError(
          err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
            ? "Camera access was blocked. Allow camera permission in your browser, or upload a photo instead."
            : "Couldn't open the camera on this device. You can upload a photo instead."
        );
      }
    }
    start();

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
  }, [mode, facing]);

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `body-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopCamera();
        setMode(null);
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }

  if (mode === "camera") {
    return (
      <div className="body-capture">
        <div className="body-capture-frame">
          <video ref={videoRef} playsInline muted className="body-capture-video" />
          <svg className="body-capture-guide" viewBox="0 0 200 320" aria-hidden="true">
            <ellipse cx="100" cy="34" rx="24" ry="28" />
            <path d="M62 64 Q100 54 138 64 L146 208 Q100 224 54 208 Z" />
            <line x1="54" y1="118" x2="20" y2="196" />
            <line x1="146" y1="118" x2="180" y2="196" />
            <line x1="72" y1="208" x2="64" y2="308" />
            <line x1="128" y1="208" x2="136" y2="308" />
          </svg>
        </div>
        {cameraError && <div className="field-error">{cameraError}</div>}
        <ul className="body-capture-tips">
          {GUIDE_HINTS.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
        <div className="body-capture-actions">
          <button type="button" className="primary-btn" onClick={capture} disabled={disabled || !stream}>
            Capture photo
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setFacing((current) => (current === "user" ? "environment" : "user"))}
          >
            Flip camera
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              stopCamera();
              setMode(null);
            }}
          >
            Cancel
          </button>
        </div>
        <canvas ref={canvasRef} hidden />
      </div>
    );
  }

  return (
    <div className="body-capture">
      <label className="field">
        <span>Height in cm (optional — sharpens the estimate)</span>
        <input
          type="number"
          min="80"
          max="250"
          placeholder="e.g. 172"
          value={knownHeightCm}
          onChange={(e) => onKnownHeightChange(e.target.value)}
        />
      </label>
      <div className="body-capture-actions">
        <button type="button" className="secondary-btn" onClick={() => setMode("camera")} disabled={disabled}>
          Use webcam
        </button>
        <label className="secondary-btn" style={{ display: "inline-block" }}>
          Upload a photo
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onCapture(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
