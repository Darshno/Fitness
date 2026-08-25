import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { googleSignInPlaceholder } from "../services/authService";

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!validEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;
    try {
      const user = await login({ email, password });
      if (!user.onboardingComplete) navigate("/onboarding");
      else if (!user.goalAssessment) navigate("/goal-assessment");
      else if (!user.planAccepted) navigate("/plan");
      else navigate("/home");
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">{t("auth.welcomeBack")}</span>
      <h1>{t("auth.loginTitle")}</h1>
      <p className="disclaimer">{t("auth.loginSubtitle")}</p>
      {formError && <div className="form-error">{formError}</div>}
      <form onSubmit={onSubmit}>
        <label className="field"><span>{t("auth.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {errors.email && <div className="field-error">{errors.email}</div>}
        <label className="field"><span>{t("auth.password")}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {errors.password && <div className="field-error">{errors.password}</div>}
        <button className="primary-btn" type="submit" style={{ width: "100%" }}>{t("auth.loginTitle")}</button>
      </form>
      <button
        className="secondary-btn"
        style={{ width: "100%", marginTop: 10 }}
        onClick={() => toast(googleSignInPlaceholder().message)}
      >
        {t("auth.continueWithGoogle")}
      </button>
      <p className="auth-switch">
        <Link to="/forgot-password">{t("auth.forgotPassword")}</Link>
        <br />
        {t("auth.newHere")} <Link to="/signup">{t("auth.createAccount")}</Link>
      </p>
    </div>
  );
}
