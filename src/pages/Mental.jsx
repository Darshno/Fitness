import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import EmergencySupport from "../components/mental/EmergencySupport";
import MentalInput from "../components/mental/MentalInput";
import MentalScene from "../components/mental/MentalScene";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MOOD_OPTIONS, labelFor } from "../data/options";
import { getChatHistory, seedChat, sendChatMessage } from "../services/chatService";
import { getMood, saveMood } from "../services/notificationService";

export default function Mental() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [moodModal, setMoodModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [currentMood, setCurrentMood] = useState(getMood()?.mood || user?.profile?.mood || "okay");

  useEffect(() => {
    const history = getChatHistory("mental");
    if (history.length) {
      setMessages(history);
    } else {
      // Build a personalised opener from the user's onboarding wellbeing metadata
      const p = user?.profile || {};
      let opener = "I'm here with you. How are you feeling today?";

      if (p.mood || p.stress || p.sleep || p.wellbeing || p.cope) {
        const moodLabel = p.mood
          ? { low: "low", okay: "okay", good: "good", great: "great" }[p.mood] || p.mood
          : null;
        const stressLabel = p.stress
          ? { high: "high", medium: "moderate", low: "low" }[p.stress] || p.stress
          : null;
        const sleepLabel = p.sleep
          ? { poor: "poor", okay: "okay", good: "good" }[p.sleep] || p.sleep
          : null;
        const wellbeingLabel = p.wellbeing
          ? {
              struggling: "a bit of a struggle",
              mixed: "a bit mixed",
              steady: "pretty steady",
              strong: "feeling strong",
            }[p.wellbeing] || p.wellbeing
          : null;

        const parts = [];
        if (moodLabel) parts.push(`your mood has been ${moodLabel}`);
        if (stressLabel) parts.push(`stress is ${stressLabel}`);
        if (sleepLabel) parts.push(`sleep has been ${sleepLabel}`);
        if (wellbeingLabel) parts.push(`overall things feel ${wellbeingLabel}`);

        const context = parts.length > 0 ? `I can see ${parts.join(", ")}. ` : "";
        const copeNote =
          p.cope?.trim()
            ? `You mentioned that you cope by: "${p.cope.trim()}". That's a great starting point. `
            : "";

        opener = `${context}${copeNote}I'm here whenever you want to talk — what's on your mind today?`;
      }

      const seeded = seedChat("mental", opener);
      setMessages(seeded);
    }
  }, []);

  const assistantMessages = messages.filter((m) => m.role === "assistant" || m.role === "safety");
  const latestMessage = assistantMessages.length
    ? assistantMessages[assistantMessages.length - 1]
    : { text: "Hmm... it sounds like today has been a bit overwhelming. Would you like to talk about it?" };

  async function handleSend(textToSend) {
    const val = textToSend || inputText.trim();
    if (!val || sending) return;
    setInputText("");
    setSending(true);

    const result = await sendChatMessage({ mode: "mental", text: val });
    setMessages(result.history);
    setSending(false);
  }

  function handleMoodSave(newMood) {
    setCurrentMood(newMood);
    saveMood(newMood);
    toast("Mood check-in saved");
    handleSend(`I'm feeling ${newMood} today.`);
  }

  return (
    <div className="mental-page-wrapper">
      {/* Page Header */}
      <header className="mental-topbar">
        <div>
          <h1>Mental Wellbeing</h1>
          <p>You matter. I’m here with you.</p>
        </div>
        <div className="mental-actions">

          <NavLink to="/settings" className="icon-btn" aria-label="Notifications">

          </NavLink>
          <NavLink to="/settings" className="avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </NavLink>
          <button type="button" className="mood-history-btn" onClick={() => setMoodModal(true)}>
            Mood History
          </button>
        </div>
      </header>

      {/* Main Cozy Evening Room Scene */}
      <MentalScene
        user={user}
        message={latestMessage.text}
        onSelectTopic={(topicText) => handleSend(topicText)}
        disabled={sending}
      />

      {/* Bottom Message Input & Immediate Support Row */}
      <div className="mental-bottom-bar">
        <MentalInput
          value={inputText}
          onChange={setInputText}
          onSubmit={() => handleSend()}
          disabled={sending}
        />
        <EmergencySupport onClick={() => setSupportModal(true)} />
      </div>

      <p className="mental-footer-disclaimer">
        FitBuddy is a wellbeing support tool and is not a replacement for professional mental-health care.
      </p>

      {/* Mood History & Check-in Modal */}
      {moodModal && (
        <div className="modal-backdrop" onClick={() => setMoodModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setMoodModal(false)}>
              ×
            </button>
            <h2>Mood History & Check-in</h2>
            <p className="disclaimer">How are you feeling right now?</p>

            <div className="choice-grid" style={{ margin: "20px 0" }}>
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`choice ${currentMood === opt.id ? "active" : ""}`}
                  onClick={() => handleMoodSave(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <h3>Recent Check-ins</h3>
            <div className="summary-list">
              <div><span>Today</span><strong>{labelFor(MOOD_OPTIONS, currentMood)}</strong></div>
              <div><span>Yesterday</span><strong>Good</strong></div>
              <div><span>2 days ago</span><strong>Okay</strong></div>
            </div>

            <button type="button" className="primary-btn" style={{ marginTop: 20, width: "100%" }} onClick={() => setMoodModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Immediate Support Resources Modal */}
      {supportModal && (
        <div className="modal-backdrop" onClick={() => setSupportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSupportModal(false)}>
              ×
            </button>
            <h2>Immediate Support Resources</h2>
            <p style={{ lineHeight: 1.5, color: "var(--ink)" }}>
              If you or someone you know is in crisis or needs urgent assistance, please reach out immediately to one of these free, confidential 24/7 resources:
            </p>

            <div className="cycle-banner" style={{ background: "var(--pink)", borderLeft: "4px solid var(--purple)", marginTop: 16 }}>
              <strong style={{ color: "var(--purple-deep)", fontSize: 16 }}>Emergency & Lifelines</strong>
              <ul style={{ margin: "10px 0 0", paddingLeft: 20, color: "var(--ink)", lineHeight: 1.6 }}>
                <li><strong>Immediate danger:</strong> Contact your local emergency services now.</li>
                <li><strong>Crisis support:</strong> Use a crisis service available in your country.</li>
                <li><strong>International directory:</strong> The International Association for Suicide Prevention can help locate local services.</li>
              </ul>
              <a href="https://www.iasp.info/suicidalthoughts/" target="_blank" rel="noreferrer">Find local crisis support</a>
            </div>

            <h3 style={{ marginTop: 20 }}>Grounding Technique (5-4-3-2-1)</h3>
            <p className="disclaimer">
              Take a slow breath. Notice: <strong>5</strong> things you can see, <strong>4</strong> things you can feel, <strong>3</strong> things you hear, <strong>2</strong> things you smell, and <strong>1</strong> deep breath.
            </p>

            <button type="button" className="primary-btn" style={{ marginTop: 16, width: "100%" }} onClick={() => setSupportModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
