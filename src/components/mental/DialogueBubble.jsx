export default function DialogueBubble({ message, botName = "FitBuddy" }) {
  return (
    <div className="bot-dialogue-bubble" aria-live="polite">
      <div className="sparkle-top-left">✦</div>
      <div className="sparkle-top-right">✦</div>
      <p>{message || "Hmm... it sounds like today has been a bit overwhelming. Would you like to talk about it?"}</p>
      <span className="bubble-heart">💜</span>
      <div className="bubble-tail">
        <span className="dot-lg" />
        <span className="dot-md" />
        <span className="dot-sm" />
      </div>
    </div>
  );
}
