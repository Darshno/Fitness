import ladyImg from "../assets/lady.png";
import maleImg from "../assets/male.png";
import ladyTherapistImg from "../assets/lady therpist.png";
import maleTherapistImg from "../assets/male therpist.png";

export default function Companion({
  color = "lavender",
  accessory = "none",
  variant,
  size = "md",
  isTherapist = false,
}) {
  const selectedAccessory = (accessory || "none").toLowerCase();
  const selectedVariant = variant || localStorage.getItem("fitbuddy.companionVariant") || "lady";
  
  let companionImg = selectedVariant === "male" ? maleImg : ladyImg;
  if (isTherapist) {
    companionImg = selectedVariant === "male" ? maleTherapistImg : ladyTherapistImg;
  }

  return (
    <div className={`companion-stage size-${size} color-${color}`} aria-label="FitBuddy companion">
      <div className="companion-graphic">
        <div className="fitbuddy-bot" aria-hidden="true">
          <img src={companionImg} alt="" className="bot-img" draggable={false} />
          {selectedAccessory !== "none" && <div className={`bot-accessory accessory-${selectedAccessory}`} />}
          {selectedAccessory === "headphones" && <div className="bot-accessory headphones-right-cup" />}
        </div>
      </div>
    </div>
  );
}
