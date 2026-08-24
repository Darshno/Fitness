import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Companion from "../components/Companion";
import CompanionSelector from "../components/CompanionSelector";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ACTIVITY_LEVELS, COMPANION_ACCESSORIES, COMPANION_COLORS, FITNESS_GOALS, GENDERS, TIMELINE_OPTIONS, labelFor } from "../data/options";
import { getReminderSettings, saveReminderSettings } from "../services/notificationService";
import { updateAccount, updateCompanion } from "../services/userService";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reminders, setReminders] = useState(getReminderSettings());
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    ...user.profile,
  });
  const [botName, setBotName] = useState(user?.companion?.name || "FitBuddy");

  function toggleReminder(key) {
    const next = { ...reminders, [key]: !reminders[key] };
    setReminders(next);
    saveReminderSettings(next);
    toast("Reminder preference saved");
  }

  async function saveProfile() {
    try {
      const next = await updateAccount({
        name: form.name,
        profile: {
          age: form.age,
          gender: form.gender,
          heightCm: form.heightCm,
          weightKg: form.weightKg,
          activityLevel: form.activityLevel,
          goal: form.goal,
          targetWeightKg: form.targetWeightKg,
          timelineWeeks: form.timelineWeeks,
          lastPeriodDate: form.lastPeriodDate,
          cycleLength: form.cycleLength,
          periodDuration: form.periodDuration,
          reproductiveStatus: form.reproductiveStatus,
          pregnancyWeeks: form.pregnancyWeeks,
          pregnancyExerciseRestricted: form.pregnancyExerciseRestricted,
          manualPeriodActive: form.manualPeriodActive,
          periodPain: form.periodPain,
          periodEnergy: form.periodEnergy,
        },
      });
      setUser(next);
      setEditing(false);
      toast("Profile updated");
    } catch (error) {
      toast(error.message);
    }
  }

  async function setBot(partial) {
    try {
      const next = await updateCompanion(partial);
      setUser(next);
      if (partial.color) {
        toast(`UI Theme changed to ${labelFor(COMPANION_COLORS, partial.color)}`);
      } else if (partial.accessory) {
        toast(`Accessory changed to ${labelFor(COMPANION_ACCESSORIES, partial.accessory)}`);
      } else {
        toast("Companion updated");
      }
    } catch (error) {
      toast(error.message);
    }
  }

  const activeColor = user?.companion?.color || "lavender";
  const activeAccessory = user?.companion?.accessory || "none";
  const activeVariant = user?.companion?.variant || localStorage.getItem("fitbuddy.companionVariant") || "lady";

  return (
    <div className="settings-card">
      <span className="eyebrow">SETTINGS</span>
      <h2>Your preferences</h2>

      {/* ── Profile Section ── */}
      <h3>Profile</h3>
      <div className="profile-avatar lg" style={{ margin: "0 auto 8px" }}>{user.name[0].toUpperCase()}</div>
      <h4 style={{ textAlign: "center", margin: "0 0 4px" }}>{user.name}</h4>
      <p style={{ textAlign: "center" }}>{labelFor(FITNESS_GOALS, user.profile.goal)} · {user.profile.timelineWeeks} week focus</p>
      <div className="profile-grid">
        <div><small>Height</small><strong>{user.profile.heightCm} cm</strong></div>
        <div><small>Weight</small><strong>{user.profile.weightKg} kg</strong></div>
        <div><small>Activity</small><strong>{labelFor(ACTIVITY_LEVELS, user.profile.activityLevel)}</strong></div>
        <div><small>Goal</small><strong>{labelFor(FITNESS_GOALS, user.profile.goal)}</strong></div>
      </div>

      {!editing && <button className="secondary-btn" style={{ marginTop: 12 }} onClick={() => setEditing(true)}>Edit profile</button>}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>Age</span><input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label>
          <label className="field"><span>Gender</span>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              {GENDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Height (cm)</span><input value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} /></label>
          <label className="field"><span>Weight (kg)</span><input value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} /></label>
          <label className="field"><span>Activity</span>
            <select value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
              {ACTIVITY_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Goal</span>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              {FITNESS_GOALS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Target weight</span><input value={form.targetWeightKg || ""} onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })} /></label>
          <label className="field"><span>Timeline (weeks)</span>
            <select value={form.timelineWeeks} onChange={(e) => setForm({ ...form, timelineWeeks: e.target.value })}>
              {TIMELINE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          {form.gender === "female" && (
            <>
              <label className="field"><span>Women’s care status</span><select value={form.reproductiveStatus || "not_pregnant"} onChange={(e) => setForm({ ...form, reproductiveStatus: e.target.value })}><option value="not_pregnant">Not pregnant</option><option value="pregnant">Pregnant</option><option value="possibly_pregnant">Pregnancy possible</option></select></label>
              {(form.reproductiveStatus === "pregnant" || form.reproductiveStatus === "possibly_pregnant") && <label className="field"><span>Pregnancy week</span><input type="number" min="0" max="42" value={form.pregnancyWeeks || ""} onChange={(e) => setForm({ ...form, pregnancyWeeks: e.target.value })} /></label>}
              {(form.reproductiveStatus === "pregnant" || form.reproductiveStatus === "possibly_pregnant") && <label className="toggle-row"><span>Clinician has restricted exercise</span><input type="checkbox" checked={Boolean(form.pregnancyExerciseRestricted)} onChange={(e) => setForm({ ...form, pregnancyExerciseRestricted: e.target.checked })} /></label>}
              {(!form.reproductiveStatus || form.reproductiveStatus === "not_pregnant") && <><label className="field"><span>Last period date</span><input type="date" value={form.lastPeriodDate || ""} onChange={(e) => setForm({ ...form, lastPeriodDate: e.target.value })} /></label><label className="field"><span>Cycle length</span><input value={form.cycleLength || ""} onChange={(e) => setForm({ ...form, cycleLength: e.target.value })} /></label><label className="field"><span>Period duration</span><input value={form.periodDuration || ""} onChange={(e) => setForm({ ...form, periodDuration: e.target.value })} /></label><label className="toggle-row"><span>On my period today</span><input type="checkbox" checked={form.manualPeriodActive === true} onChange={(e) => setForm({ ...form, manualPeriodActive: e.target.checked })} /></label></>}
            </>
          )}
          <div className="btn-row">
            <button className="primary-btn" onClick={saveProfile}>Save</button>
            <button className="secondary-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── FitBuddy & UI Theme Section ── */}
      <h3>FitBuddy &amp; UI Theme</h3>
      <p className="disclaimer">Choose FitBuddy's accessory and the app color scheme.</p>

      <div style={{ textAlign: "center", margin: "16px 0" }}>
        <Companion color={activeColor} accessory={activeAccessory} variant={activeVariant} size="sm" />
        <h4 style={{ margin: "10px 0 0", fontSize: 18, color: "var(--purple-deep)" }}>{user?.companion?.name || "FitBuddy"}</h4>
      </div>

      <label className="field">
        <span>Companion Name</span>
        <input
          type="text"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          onBlur={() => {
            if (botName !== (user?.companion?.name || "FitBuddy")) {
              setBot({ name: botName });
            }
          }}
          placeholder="Name your bot companion..."
        />
      </label>

      <CompanionSelector value={activeVariant} onChange={(variant) => setBot({ variant })} />

      <p><strong>UI Theme Color</strong></p>
      <div className="color-swatch-grid">
        {COMPANION_COLORS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`color-swatch-btn ${activeColor === item.id ? "active" : ""}`}
            onClick={() => setBot({ color: item.id })}
          >
            <span className="swatch-circle" style={{ background: item.accent }} />
            {item.label}
          </button>
        ))}
      </div>



      {/* ── Notifications Section ── */}
      <h3>Notifications</h3>
      <label className="toggle-row"><span>Hydration reminder</span><input type="checkbox" checked={reminders.hydration} onChange={() => toggleReminder("hydration")} /></label>
      <label className="toggle-row"><span>Workout reminder</span><input type="checkbox" checked={reminders.workout} onChange={() => toggleReminder("workout")} /></label>
      <label className="toggle-row"><span>Mood check-in</span><input type="checkbox" checked={reminders.mood} onChange={() => toggleReminder("mood")} /></label>

      {/* ── Privacy & Disclaimers ── */}
      <h3>Privacy</h3>
      <p className="disclaimer">This MVP keeps a local cache for fast UI updates and syncs account/profile changes through the FitBuddy backend when it is configured.</p>

      <h3>Data disclaimer</h3>
      <p className="disclaimer">Nutrition estimates are approximate.</p>
      <p className="disclaimer">FitBuddy is a wellbeing support tool and is not a replacement for professional medical or mental-health care.</p>

      <button
        className="primary-btn"
        style={{ marginTop: 24 }}
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}
