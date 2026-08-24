import Companion from "../Companion";
import DialogueBubble from "./DialogueBubble";

export default function MentalScene({
  user,
  message,
}) {
  const companion = user?.companion || {};
  const botName = companion.name || "FitBuddy";

  return (
    <div className="mental-room-stage">
      {/* Floating Dialogue Speech Bubble directly above companion's head */}
      <DialogueBubble message={message} botName={botName} />

      {/* Companion sitting on the purple sofa */}
      <div className="couch-bot-container">
        <Companion
          color={companion.color || "lavender"}
          accessory={companion.accessory || "none"}
          variant={companion.variant}
          size="md"
          isTherapist={true}
        />
      </div>
    </div>
  );
}
