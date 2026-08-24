import ladyImg from "../assets/lady.png";
import maleImg from "../assets/male.png";

const OPTIONS = [
  { id: "lady", label: "Lady", image: ladyImg },
  { id: "male", label: "Male", image: maleImg },
];

export default function CompanionSelector({ value = "lady", onChange }) {
  return (
    <section aria-labelledby="companion-selector-title">
      <h3 id="companion-selector-title">Choose Your FitBuddy</h3>
      <p>Choose the companion you'd like to have by your side.</p>
      <div className="bot-model-grid">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`bot-model-card ${value === option.id ? "active" : ""}`}
            onClick={() => {
              localStorage.setItem("fitbuddy.companionVariant", option.id);
              onChange(option.id);
            }}
            aria-pressed={value === option.id}
          >
            <img src={option.image} alt={option.label} className="companion-choice-image" draggable={false} />
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}