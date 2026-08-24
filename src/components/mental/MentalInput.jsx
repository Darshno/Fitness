export default function MentalInput({ value, onChange, onSubmit, disabled }) {
  return (
    <form
      className="mental-input-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share how you're feeling..."
        disabled={disabled}
      />
      <button
        type="submit"
        className="mental-send-btn"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        ➔
      </button>
    </form>
  );
}
