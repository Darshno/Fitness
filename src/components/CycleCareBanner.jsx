export default function CycleCareBanner({ status }) {
  if (!status?.applicable) return null;
  const visible = status.type === "pregnancy" || status.inWindow || status.startingSoon || status.unknown;
  if (!visible) return null;
  return (
    <div className={`cycle-banner ${status.type === "pregnancy" ? "pregnancy-banner" : ""}`}>
      <strong>{status.type === "pregnancy" ? "Pregnancy Care" : "Cycle Care"}</strong>
      <p>{status.message}</p>
      {status.type === "period" && <p>{status.painLevel > 0 ? `Reported pain: ${status.painLevel}/10 · ` : ""}Gentle movement, hydration, rest and comfort-focused care are available.</p>}
      {status.type === "pregnancy" && <p>Today’s workout is automatically switched to the pregnancy-aware pathway.</p>}
      <p className="disclaimer">{status.disclaimer}</p>
    </div>
  );
}
