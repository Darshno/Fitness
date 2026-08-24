export default function EmergencySupport({ onClick }) {
  return (
    <button type="button" className="immediate-support-btn" onClick={onClick}>
      <div className="support-icon">📞</div>
      <div>
        <strong>Need immediate help?</strong>
        <small>Get support ↗</small>
      </div>
    </button>
  );
}
