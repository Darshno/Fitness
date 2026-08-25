import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { analyzeBodyPhoto } from "../services/bodyAnalysisService";
import { persistUser } from "../services/authService";
import BodyPhotoCapture from "../components/BodyPhotoCapture";

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Signup() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  // Optional body-photo step, analyzed by Gemini before account creation completes.
  const [photoPreview, setPhotoPreview] = useState("");
  const [bodyAnalysis, setBodyAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [knownHeightCm, setKnownHeightCm] = useState("");

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onPhoto(file) {
    if (!file) return;
    const nextPreview = URL.createObjectURL(file);
    setPhotoPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return nextPreview;
    });
    setBodyAnalysis(null);
    setPhotoError("");
    setAnalyzing(true);
    try {
      const result = await analyzeBodyPhoto(file, { knownHeightCm });
      setBodyAnalysis(result);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function retakePhoto() {
    setPhotoPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
    setBodyAnalysis(null);
    setPhotoError("");
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!validEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      // Attach the body-photo estimate to the new account, if the user captured one.
      // Never block account creation on this — it's a best-effort onboarding extra.
      if (bodyAnalysis) {
        try {
          await persistUser({ profile: { bodyAnalysis } });
        } catch {
          // ignore — user can redo this analysis later from their profile
        }
      }
      navigate("/onboarding");
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">{t("auth.createAccountEyebrow")}</span>
      <h1>{t("auth.signupTitle")}</h1>
      {formError && <div className="form-error">{formError}</div>}
      <form onSubmit={onSubmit}>
        <label className="field"><span>{t("auth.name")}</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        {errors.name && <div className="field-error">{errors.name}</div>}
        <label className="field"><span>{t("auth.email")}</span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        {errors.email && <div className="field-error">{errors.email}</div>}
        <label className="field"><span>{t("auth.password")}</span>
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </label>
        {errors.password && <div className="field-error">{errors.password}</div>}
        <label className="field"><span>{t("auth.confirmPassword")}</span>
          <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
        </label>
        {errors.confirm && <div className="field-error">{errors.confirm}</div>}

        <label className="field"><span>Body photo (optional)</span></label>

        {photoPreview ? (
          <>
            <img src={photoPreview} alt="Body preview" style={{ maxWidth: 160, display: "block", marginTop: 8, borderRadius: 12 }} />
            <button type="button" className="ghost-btn" style={{ marginTop: 8 }} onClick={retakePhoto} disabled={analyzing}>
              Retake photo
            </button>
          </>
        ) : (
          <BodyPhotoCapture
            onCapture={onPhoto}
            disabled={analyzing}
            knownHeightCm={knownHeightCm}
            onKnownHeightChange={setKnownHeightCm}
          />
        )}

        {analyzing && <p className="loading-pulse">Analyzing photo…</p>}
        {photoError && <div className="field-error">{photoError}</div>}
        {bodyAnalysis && (
          <div className="profile-grid" style={{ marginTop: 8 }}>
            <p><strong>Body type:</strong> {bodyAnalysis.bodyType}</p>
            <p><strong>Est. height:</strong> {bodyAnalysis.estimatedHeightRange}</p>
            <p><strong>Body fat level:</strong> {bodyAnalysis.bodyFatLevel} {bodyAnalysis.bodyFatPercentRange && bodyAnalysis.bodyFatPercentRange !== "unknown" ? `(${bodyAnalysis.bodyFatPercentRange})` : ""}</p>
            <p><strong>Muscle level:</strong> {bodyAnalysis.muscleMassLevel}</p>
            <p><strong>Posture:</strong> {bodyAnalysis.posture}</p>
            <p><strong>Confidence:</strong> {bodyAnalysis.confidence}</p>
            {bodyAnalysis.imageIssues && <p className="field-error">{bodyAnalysis.imageIssues}</p>}
            <p className="disclaimer">{bodyAnalysis.disclaimer}</p>
          </div>
        )}

        <button className="primary-btn" type="submit" style={{ width: "100%", marginTop: 12 }}>{t("auth.createAccount")}</button>
      </form>
      <p className="auth-switch">{t("auth.alreadyHaveAccount")} <Link to="/login">{t("auth.loginTitle")}</Link></p>
    </div>
  );
}
