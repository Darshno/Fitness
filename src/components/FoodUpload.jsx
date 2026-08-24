import { useEffect, useState } from "react";
import { analyzeFood, saveFoodLog } from "../services/foodService";
import { useToast } from "../context/ToastContext";

export default function FoodUpload({ onSaved }) {
  const { toast } = useToast();
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onFile(file) {
    if (!file) return;
    const nextPreview = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return nextPreview;
    });
    setResult(null);
    setBusy(true);

    try {
      const analysis = await analyzeFood(file);
      setResult(analysis);
      const saved = await saveFoodLog({ ...analysis, imageName: file.name });
      onSaved?.(saved);
      toast("Meal logged with estimated nutrition.");
    } catch (error) {
      toast(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="secondary-btn" style={{ display: "inline-block" }}>
        Upload or take a photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {preview && <img className="food-preview" src={preview} alt="Meal preview" />}
      {busy && <p className="loading-pulse">Estimating nutrition…</p>}
      {result && (
        <div>
          <p className="disclaimer">{result.disclaimer}</p>
          <div className="profile-grid">
            <div><small>Calories</small><strong>{result.calories}</strong></div>
            <div><small>Protein</small><strong>{result.protein} g</strong></div>
            <div><small>Carbs</small><strong>{result.carbohydrates} g</strong></div>
            <div><small>Fat</small><strong>{result.fat} g</strong></div>
          </div>
          <p><strong>Portion:</strong> {result.portion}</p><p><strong>Confidence:</strong> {result.confidence}</p><p>{result.notes}</p>
        </div>
      )}
    </div>
  );
}
