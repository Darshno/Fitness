export const MENTAL_TOPICS = [
  { id: "stressed", label: "I'm feeling stressed", icon: "" },
  { id: "anxiety", label: "Anxiety", icon: "" },
  { id: "motivation", label: "Low motivation", icon: "" },
  { id: "overthinking", label: "Overthinking", icon: "" },
  { id: "sleep", label: "Sleep issues", icon: "" },
  { id: "talk", label: "Just need to talk", icon: "" },
];

export default function TopicChips({ onSelectTopic, disabled }) {
  return (
    <div className="mental-topics-card">
      <div className="topics-header">
        <span className="header-accent-bar" />
        <h4>Things you can talk to me about</h4>
      </div>
      <div className="topic-chips-row">
        {MENTAL_TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className="topic-chip-btn"
            onClick={() => onSelectTopic(topic.label)}
            disabled={disabled}
          >
            <span className="topic-icon">{topic.icon}</span>
            <span>{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
