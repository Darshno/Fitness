export default function CycleCareBanner({ status }) {
  if (!status?.applicable || (!status.inWindow && !status.startingSoon)) return null;
  return (
    <div className="cycle-banner">
      <strong>Cycle Care</strong>
      <p>{status.message}</p>
      <p>{status.suggestions.join(" · ")}</p>
      <p className="disclaimer">{status.disclaimer}</p>
    </div>
  );
}
