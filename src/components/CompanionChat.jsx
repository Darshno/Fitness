import { useEffect, useState } from "react";
import Companion from "./Companion";
import { useAuth } from "../context/AuthContext";
import { getChatHistory, seedChat, sendChatMessage } from "../services/chatService";

export default function CompanionChat({ mode = "home", opener = "Hey! What can I help you with today?", placeholder = "Ask FitBuddy..." }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existing = await getChatHistory(mode);
        if (active) setMessages(existing.length ? existing : seedChat(mode, opener));
      } catch (err) {
        if (active) {
          setMessages(seedChat(mode, opener));
          setError(err?.message || "Could not load chat history.");
        }
      }
    })();
    return () => { active = false; };
  }, [mode, opener]);

  async function onSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || sending) return;

    const optimistic = {
      id: `local-${Date.now()}`,
      role: "user",
      text: value,
      at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setText("");
    setSending(true);
    setError("");

    try {
      const result = await sendChatMessage({ mode, text: value });
      if (Array.isArray(result?.history)) setMessages(result.history);
      if (typeof result?.aiEnabled === "boolean") setAiEnabled(result.aiEnabled);
      if (result?.fallback) setError("Gemini is unavailable right now. FitBuddy is using a basic fallback response.");
    } catch (err) {
      setError(err?.message || "FitBuddy could not respond.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-card">
      <div className="chat-companion">
        <Companion color={user?.companion?.color} accessory={user?.companion?.accessory} variant={user?.companion?.variant} size="xs" />
        <div><strong>{user?.companion?.name || "FitBuddy"}</strong><small>Your wellbeing companion</small></div>
      </div>
      <div className="chat-messages" aria-live="polite" aria-busy={sending}>
        {messages.map((message, index) => (
          <div key={message.id || message._id || `${message.role}-${message.createdAt || message.at || index}`} className={`message ${message.role === "user" ? "user" : message.role === "safety" ? "safety" : "bot"}`}>
            {message.title && <strong>{message.title}<br /></strong>}
            {message.text}
            {message.resources?.map((resource) => <div key={resource.href}><a href={resource.href} target="_blank" rel="noreferrer">{resource.label}</a></div>)}
          </div>
        ))}
        {sending && <div className="message bot">FitBuddy is thinking…</div>}
      </div>
      {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
      {!aiEnabled && !error && <p className="disclaimer">AI service is not connected. Check the Render Gemini environment variables.</p>}
      <p className="disclaimer">AI guidance is general wellbeing support, not medical diagnosis or treatment.</p>
      <form className="chat-input" onSubmit={onSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} disabled={sending} autoComplete="off" />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Send">{sending ? "…" : "Send"}</button>
      </form>
    </div>
  );
}
