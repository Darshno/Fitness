import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
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
      navigate("/onboarding");
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">CREATE ACCOUNT</span>
      <h1>Sign up</h1>
      {formError && <div className="form-error">{formError}</div>}
      <form onSubmit={onSubmit}>
        <label className="field"><span>Name</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        {errors.name && <div className="field-error">{errors.name}</div>}
        <label className="field"><span>Email</span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        {errors.email && <div className="field-error">{errors.email}</div>}
        <label className="field"><span>Password</span>
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </label>
        {errors.password && <div className="field-error">{errors.password}</div>}
        <label className="field"><span>Confirm password</span>
          <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
        </label>
        {errors.confirm && <div className="field-error">{errors.confirm}</div>}
        <button className="primary-btn" type="submit" style={{ width: "100%" }}>Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
