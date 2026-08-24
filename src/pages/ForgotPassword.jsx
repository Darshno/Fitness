import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const result = await requestPasswordReset(email);
      toast(result.message);
    } catch (error) {
      toast(error.message);
    }
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">ACCOUNT</span>
      <h1>Forgot password</h1>
      <p className="disclaimer">This screen is ready for a backend email reset. Nothing is sent yet.</p>
      <form onSubmit={onSubmit}>
        <label className="field"><span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="primary-btn" type="submit" style={{ width: "100%" }}>Request reset</button>
      </form>
      <p className="auth-switch"><Link to="/login">Back to login</Link></p>
    </div>
  );
}
