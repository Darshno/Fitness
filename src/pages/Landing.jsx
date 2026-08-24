import { Link } from "react-router-dom";
import Companion from "../components/Companion";

export default function Landing() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div>
          <span className="eyebrow">FITBUDDY</span>
          <h1>Your AI companion for fitness & wellbeing.</h1>
          <p>A calm, personal space for movement, meals, mood, and gentle check-ins — not another clinical dashboard.</p>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <Link className="primary-btn" to="/signup">Get Started</Link>
            <Link className="secondary-btn" to="/login">Login</Link>
          </div>
        </div>
        <Companion color="lavender" accessory="none" />
      </section>
      <div className="feature-row">
        <article className="feature-tile"><span></span><h3>Physical Fitness</h3><p>Workouts, hydration, and food tracking in one place.</p></article>
        <article className="feature-tile"><span></span><h3>Mental Wellbeing</h3><p>A quieter mode for check-ins and conversation.</p></article>
        <article className="feature-tile"><span></span><h3>Personalized Plans</h3><p>Multi-week plans shaped around your goal and timeline.</p></article>
        <article className="feature-tile"><span></span><h3>AI Companion</h3><p>FitBuddy stays with you from home to physical and mental modes.</p></article>
      </div>
    </div>
  );
}
