import { useMemo, useState } from "react";
import { Activity, Baby, CalendarDays, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCycleStatus, getWomenCarePlan } from "../services/cycleService";
import { updateProfile } from "../services/userService";
import CompanionChat from "../components/CompanionChat";

export default function CycleCare() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const profile = user?.profile || {};
  const status = useMemo(() => getCycleStatus(profile), [profile]);
  const plan = useMemo(() => getWomenCarePlan(status), [status]);
  const [saving, setSaving] = useState(false);

  const save = async (patch) => {
    setSaving(true);
    try {
      const next = await updateProfile(patch);
      setUser(next);
      toast("Women’s care settings saved");
    } catch (error) {
      toast(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (profile.gender !== "female") {
    return <div className="panel"><span className="eyebrow">WOMEN’S CARE</span><h1>This section is unavailable</h1><p>Women’s cycle and pregnancy care is shown only for female profiles.</p></div>;
  }

  const pregnancy = status.type === "pregnancy";

  return (
    <div className="women-care-page">
      <section className="women-care-hero">
        <div>
          <span className="eyebrow">WOMEN’S CARE</span>
          <h1>Period & Pregnancy Care</h1>
          <p>FitBuddy changes today’s movement, recovery and care guidance based on the status you choose.</p>
        </div>
        <div className="women-care-icon">{pregnancy ? <Baby size={34} /> : <HeartPulse size={34} />}</div>
      </section>

      <section className="care-card">
        <div className="care-card-head"><div><h2>Your current status</h2><p>Keep this updated so Physical Mode uses the right plan.</p></div><ShieldCheck size={22} /></div>
        <div className="choice-grid">
          <button className={`choice ${profile.reproductiveStatus === "not_pregnant" || !profile.reproductiveStatus ? "active" : ""}`} onClick={() => save({ reproductiveStatus: "not_pregnant", pregnancyWeeks: "", pregnancyExerciseRestricted: false })} disabled={saving}>Not pregnant</button>
          <button className={`choice ${profile.reproductiveStatus === "pregnant" ? "active" : ""}`} onClick={() => save({ reproductiveStatus: "pregnant" })} disabled={saving}>I’m pregnant</button>
          <button className={`choice ${profile.reproductiveStatus === "possibly_pregnant" ? "active" : ""}`} onClick={() => save({ reproductiveStatus: "possibly_pregnant" })} disabled={saving}>Pregnancy is possible</button>
        </div>
      </section>

      {pregnancy ? (
        <section className="care-card">
          <div className="care-card-head"><div><h2>Pregnancy details</h2><p>These details change the exercise recommendations.</p></div><Baby size={22} /></div>
          <label className="field"><span>Approximate pregnancy week</span><input type="number" min="0" max="42" value={profile.pregnancyWeeks || ""} onChange={(e) => save({ pregnancyWeeks: e.target.value })} /></label>
          <label className="toggle-row"><span>My clinician has restricted my exercise</span><input type="checkbox" checked={Boolean(profile.pregnancyExerciseRestricted)} onChange={(e) => save({ pregnancyExerciseRestricted: e.target.checked })} /></label>
          <div className="care-alert"><strong>Stop and get medical advice</strong><p>During pregnancy, stop exercise for warning signs such as vaginal bleeding, fluid leakage, painful regular contractions, chest pain, dizziness, significant shortness of breath, abdominal pain, or calf pain/swelling.</p></div>
        </section>
      ) : (
        <section className="care-card">
          <div className="care-card-head"><div><h2>Period tracking</h2><p>Use your own report when the estimate is wrong.</p></div><CalendarDays size={22} /></div>
          <div className="choice-grid">
            <button className={`choice ${profile.manualPeriodActive === true ? "active" : ""}`} onClick={() => save({ manualPeriodActive: true })} disabled={saving}>I’m on my period today</button>
            <button className={`choice ${profile.manualPeriodActive === false ? "active" : ""}`} onClick={() => save({ manualPeriodActive: false })} disabled={saving}>Not on my period</button>
          </div>
          <label className="field"><span>Last period start</span><input type="date" value={profile.lastPeriodDate || ""} onChange={(e) => save({ lastPeriodDate: e.target.value })} /></label>
          <div className="two-fields">
            <label className="field"><span>Cycle length</span><input type="number" min="21" max="45" value={profile.cycleLength || 28} onChange={(e) => save({ cycleLength: e.target.value })} /></label>
            <label className="field"><span>Period length</span><input type="number" min="1" max="10" value={profile.periodDuration || 5} onChange={(e) => save({ periodDuration: e.target.value })} /></label>
          </div>
          {status.inWindow && <>
            <label className="field"><span>Period pain (0–10)</span><input type="range" min="0" max="10" value={status.painLevel || 0} onChange={(e) => save({ periodPain: e.target.value })} /></label>
            <div className="choice-grid"><button className={`choice ${profile.periodEnergy === "low" ? "active" : ""}`} onClick={() => save({ periodEnergy: "low" })}>Low energy</button><button className={`choice ${profile.periodEnergy !== "low" ? "active" : ""}`} onClick={() => save({ periodEnergy: "normal" })}>Energy feels okay</button></div>
          </>}
        </section>
      )}

      {plan && <section className="care-card">
        <div className="care-card-head"><div><h2><Sparkles size={19} /> Today’s care plan</h2><p>{plan.intensity}</p></div><Activity size={22} /></div>
        <div className="care-day-grid">{(plan?.days ?? []).map((day, index) => <article key={index} className="care-day"><small>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][index]}</small><strong>{day.title}</strong><span>{day.minutes ? `${day.minutes} min` : "Rest"}</span><p>{day.exercises.join(" · ") || "Recovery"}</p></article>)}</div>
        {plan.notes?.map((note) => <p className="care-note" key={note}>• {note}</p>)}
      </section>}

      <section className="care-card">
        <div className="care-card-head"><div><h2>Ask FitBuddy about your care</h2><p>The bot now receives your reproductive-health profile and recent conversation context.</p></div><Sparkles size={22} /></div>
        <CompanionChat mode="cycle" opener="I can help you with period or pregnancy-aware movement and self-care. Tell me what is happening today." placeholder="Ask about today's care or workout…" />
      </section>

      <section className="care-card care-disclaimer"><strong>Important</strong><p>FitBuddy does not diagnose pregnancy complications or menstrual disorders. Pregnancy exercise should be individualized when there are complications or clinician-imposed restrictions. Period estimates can be wrong.</p></section>
    </div>
  );
}
