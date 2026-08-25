import { useMemo, useState } from "react";
import {
  Activity,
  Baby,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCycleStatus, getWomenCarePlan } from "../services/cycleService";
import { updateProfile } from "../services/userService";
import CompanionChat from "../components/CompanionChat";

const phaseInfo = {
  menstrual: {
    name: "Menstrual phase",
    short: "Menstrual",
    color: "rose",
    icon: Droplets,
    description: "A lower-energy phase for many people. Listen to your body and keep movement comfortable.",
    tips: [
      "Choose walking, mobility, light strength, or rest based on how you feel.",
      "Stay hydrated and prioritize regular meals and sleep.",
      "Heat and gentle movement may help with period discomfort.",
    ],
  },
  follicular: {
    name: "Follicular phase",
    short: "Follicular",
    color: "mint",
    icon: Sun,
    description: "Energy may gradually pick up after the period. This can be a good time to build training consistency.",
    tips: [
      "Progress training gradually when energy feels good.",
      "Keep protein and hydration consistent.",
      "Use recovery needs and personal performance rather than the calendar alone to set intensity.",
    ],
  },
  ovulatory: {
    name: "Ovulatory phase",
    short: "Ovulatory",
    color: "gold",
    icon: Sparkles,
    description: "Around the estimated ovulation window. Your actual timing can vary from cycle to cycle.",
    tips: [
      "Train at your normal level if you feel well and your recovery is good.",
      "Warm up properly and use good technique for heavier or faster work.",
      "Treat the fertile-window estimate as approximate, not contraception or a pregnancy test.",
    ],
  },
  luteal: {
    name: "Luteal phase",
    short: "Luteal",
    color: "lavender",
    icon: HeartPulse,
    description: "The phase after estimated ovulation. Some people notice changes in energy, appetite, sleep, or mood.",
    tips: [
      "Adjust intensity when fatigue or PMS symptoms are stronger.",
      "Keep meals, hydration, and sleep regular.",
      "Use lighter sessions or recovery days when your body asks for them.",
    ],
  },
};

function parseLocalDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffDays(a, b) {
  return Math.floor((a - b) / 86400000);
}

function phaseForDay(day, cycleLength, periodLength) {
  if (day <= periodLength) return "menstrual";
  const ovulation = Math.min(Math.max(cycleLength - 14, 10), Math.max(cycleLength - 7, 10));
  const fertileStart = Math.max(periodLength + 1, ovulation - 5);
  const fertileEnd = Math.min(cycleLength, ovulation + 1);
  if (day >= fertileStart && day <= fertileEnd) return "ovulatory";
  if (day < fertileStart) return "follicular";
  return "luteal";
}

function cycleMath(profile, now = new Date()) {
  const last = parseLocalDate(profile.lastPeriodDate);
  if (!last) return null;
  const cycleLength = Math.min(45, Math.max(21, Number(profile.cycleLength) || 28));
  const periodLength = Math.min(10, Math.max(1, Number(profile.periodDuration) || 5));
  const daysSince = Math.max(0, diffDays(now, last));
  const cycleDay = (daysSince % cycleLength) + 1;
  const ovulationDay = Math.min(Math.max(cycleLength - 14, 10), Math.max(cycleLength - 7, 10));
  const fertileStartDay = Math.max(periodLength + 1, ovulationDay - 5);
  const fertileEndDay = Math.min(cycleLength, ovulationDay + 1);
  const phase = phaseForDay(cycleDay, cycleLength, periodLength);
  const nextPeriod = addDays(last, (Math.floor(daysSince / cycleLength) + 1) * cycleLength);
  const phaseData = phaseInfo[phase];

  return {
    last,
    cycleLength,
    periodLength,
    cycleDay,
    ovulationDay,
    fertileStartDay,
    fertileEndDay,
    phase,
    phaseData,
    nextPeriod,
    fertileStart: addDays(last, fertileStartDay - 1),
    fertileEnd: addDays(last, fertileEndDay - 1),
    ovulationDate: addDays(last, ovulationDay - 1),
  };
}

function formatDate(date, options = { day: "numeric", month: "short" }) {
  return date.toLocaleDateString(undefined, options);
}

export default function CycleCare() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const profile = user?.profile || {};
  const status = useMemo(() => getCycleStatus(profile), [profile]);
  const plan = useMemo(() => getWomenCarePlan(status), [status]);
  const [saving, setSaving] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const cycle = useMemo(() => cycleMath(profile), [profile]);
  const pregnancy = status.type === "pregnancy";

  const save = async (patch) => {
    setSaving(true);
    try {
      const next = await updateProfile(patch);
      setUser(next);
      toast("Cycle care settings saved");
    } catch (error) {
      toast(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (profile.gender !== "female") return null;

  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells = Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
    let cycleDay = null;
    let dayPhase = null;
    let period = false;
    let fertile = false;
    let ovulation = false;

    if (cycle) {
      const delta = diffDays(date, cycle.last);
      if (delta >= 0) {
        cycleDay = (delta % cycle.cycleLength) + 1;
        dayPhase = phaseForDay(cycleDay, cycle.cycleLength, cycle.periodLength);
        period = cycleDay <= cycle.periodLength;
        fertile = cycleDay >= cycle.fertileStartDay && cycleDay <= cycle.fertileEndDay;
        ovulation = cycleDay === cycle.ovulationDay;
      }
    }

    return { date, dayNumber, cycleDay, dayPhase, period, fertile, ovulation, today: dateKey(date) === dateKey(new Date()) };
  });

  const phase = cycle?.phaseData || phaseInfo.menstrual;
  const PhaseIcon = phase.icon;

  return (
    <div className="cycle-care-page">
      <section className="cycle-hero-new">
        <div className="cycle-hero-copy">
          <span className="eyebrow">CYCLE CARE</span>
          <h1>Your cycle, made simple.</h1>
          <p>Track your period, understand the estimated phase you are in, and get practical movement and wellbeing tips for today.</p>
          <div className="cycle-hero-actions">
            <button className="cycle-primary-btn" onClick={() => document.getElementById("cycle-calendar")?.scrollIntoView({ behavior: "smooth" })}>View my calendar</button>
            <span className="cycle-estimate-note">Estimates only · not contraception</span>
          </div>
        </div>
        <div className="cycle-hero-visual" aria-hidden="true">
          <div className="cycle-orbit orbit-one" />
          <div className="cycle-orbit orbit-two" />
          <div className="cycle-sun"><PhaseIcon size={46} /></div>
        </div>
      </section>

      <section className="cycle-overview-grid">
        <article className="cycle-current-card">
          <div className={`cycle-phase-icon ${phase.color}`}><PhaseIcon size={24} /></div>
          <div>
            <span className="cycle-label">TODAY</span>
            <h2>{cycle ? phase.name : "Add your last period"}</h2>
            <p>{cycle ? `Cycle day ${cycle.cycleDay} of about ${cycle.cycleLength}` : "Add your date below to unlock the calendar and phase guide."}</p>
          </div>
        </article>
        <article className="cycle-stat-card">
          <span>Next period</span>
          <strong>{cycle ? formatDate(cycle.nextPeriod) : "Not set"}</strong>
          <small>{cycle ? "Estimated" : "Add your last period"}</small>
        </article>
        <article className="cycle-stat-card">
          <span>Estimated ovulation</span>
          <strong>{cycle ? formatDate(cycle.ovulationDate) : "Not set"}</strong>
          <small>Approximate timing</small>
        </article>
      </section>

      <section className="cycle-calendar-card" id="cycle-calendar">
        <div className="cycle-section-heading">
          <div>
            <span className="eyebrow">YOUR CALENDAR</span>
            <h2>See your cycle at a glance</h2>
            <p>Pink marks the estimated period, gold marks the estimated fertile window, and the outlined day is the estimated ovulation day.</p>
          </div>
          <div className="cycle-month-nav">
            <button type="button" onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={19} /></button>
            <strong>{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
            <button type="button" onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={19} /></button>
          </div>
        </div>

        <div className="cycle-legend">
          <span><i className="legend-dot period" /> Period</span>
          <span><i className="legend-dot fertile" /> Fertile window</span>
          <span><i className="legend-dot ovulation" /> Estimated ovulation</span>
        </div>

        <div className="cycle-calendar-grid cycle-calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="cycle-calendar-grid cycle-calendar-days">
          {calendarCells.map((cell, index) => cell ? (
            <div key={cell.dayNumber} className={`cycle-calendar-day ${cell.period ? "period" : ""} ${cell.fertile ? "fertile" : ""} ${cell.ovulation ? "ovulation" : ""} ${cell.today ? "today" : ""}`}>
              <strong>{cell.dayNumber}</strong>
              {cell.cycleDay && <small>Day {cell.cycleDay}</small>}
              {cell.ovulation && <span className="calendar-marker">Ovulation</span>}
            </div>
          ) : <div key={`blank-${index}`} className="cycle-calendar-day blank" />)}
        </div>
      </section>

      {!cycle && (
        <section className="cycle-setup-card">
          <div className="cycle-setup-icon"><CalendarDays size={24} /></div>
          <div>
            <span className="eyebrow">GET STARTED</span>
            <h2>Add your cycle details</h2>
            <p>Your estimate becomes more useful once FitBuddy knows when your last period started.</p>
          </div>
          <label className="cycle-input-wrap"><span>Last period start</span><input type="date" value={profile.lastPeriodDate || ""} onChange={(e) => save({ lastPeriodDate: e.target.value })} disabled={saving} /></label>
        </section>
      )}

      {cycle && (
        <>
          <section className="cycle-phase-section">
            <div className="cycle-section-heading compact">
              <div>
                <span className="eyebrow">PHASE GUIDE</span>
                <h2>What each phase can feel like</h2>
                <p>Use these as gentle guidance, not rules. Your experience can be different every month.</p>
              </div>
            </div>
            <div className="cycle-phase-grid">
              {Object.entries(phaseInfo).map(([key, item]) => {
                const Icon = item.icon;
                const active = key === cycle.phase;
                return (
                  <article className={`cycle-phase-card ${item.color} ${active ? "active" : ""}`} key={key}>
                    <div className="cycle-phase-card-top"><div className="cycle-phase-icon"><Icon size={20} /></div>{active && <span className="phase-current">Today</span>}</div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <ul>{item.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="cycle-details-card">
            <div className="cycle-section-heading compact">
              <div>
                <span className="eyebrow">PERIOD DETAILS</span>
                <h2>Keep the estimate personal</h2>
                <p>If the estimate is wrong, your own report should win.</p>
              </div>
              <CalendarDays size={24} />
            </div>
            <div className="cycle-details-grid">
              <div className="cycle-detail-field"><label>Last period start</label><input type="date" value={profile.lastPeriodDate || ""} onChange={(e) => save({ lastPeriodDate: e.target.value })} disabled={saving} /></div>
              <div className="cycle-detail-field"><label>Cycle length</label><input type="number" min="21" max="45" value={profile.cycleLength || 28} onChange={(e) => save({ cycleLength: e.target.value })} disabled={saving} /></div>
              <div className="cycle-detail-field"><label>Period length</label><input type="number" min="1" max="10" value={profile.periodDuration || 5} onChange={(e) => save({ periodDuration: e.target.value })} disabled={saving} /></div>
              <div className="cycle-detail-field"><label>Period today?</label><div className="cycle-choice-row"><button className={profile.manualPeriodActive === true ? "active" : ""} onClick={() => save({ manualPeriodActive: true })}>Yes</button><button className={profile.manualPeriodActive === false ? "active" : ""} onClick={() => save({ manualPeriodActive: false })}>No</button></div></div>
            </div>
          </section>
        </>
      )}

      {pregnancy ? (
        <section className="cycle-pregnancy-card">
          <div className="cycle-section-heading compact">
            <div>
              <span className="eyebrow">PREGNANCY AWARE</span>
              <h2>Your current status</h2>
              <p>Pregnancy-related movement guidance stays conservative and should follow clinician advice when needed.</p>
            </div>
            <Baby size={25} />
          </div>
          <div className="cycle-choice-row pregnancy-choices">
            <button className={profile.reproductiveStatus === "not_pregnant" || !profile.reproductiveStatus ? "active" : ""} onClick={() => save({ reproductiveStatus: "not_pregnant", pregnancyWeeks: "", pregnancyExerciseRestricted: false })} disabled={saving}>Not pregnant</button>
            <button className={profile.reproductiveStatus === "pregnant" ? "active" : ""} onClick={() => save({ reproductiveStatus: "pregnant" })} disabled={saving}>I’m pregnant</button>
            <button className={profile.reproductiveStatus === "possibly_pregnant" ? "active" : ""} onClick={() => save({ reproductiveStatus: "possibly_pregnant" })} disabled={saving}>Pregnancy is possible</button>
          </div>
          <label className="cycle-detail-field pregnancy-week"><span>Approximate pregnancy week</span><input type="number" min="0" max="42" value={profile.pregnancyWeeks || ""} onChange={(e) => save({ pregnancyWeeks: e.target.value })} disabled={saving} /></label>
        </section>
      ) : (
        <section className="cycle-care-plan-card">
          <div className="cycle-section-heading compact">
            <div>
              <span className="eyebrow">TODAY'S PLAN</span>
              <h2>{phase.name} care plan</h2>
              <p>{phase.description}</p>
            </div>
            <Activity size={24} />
          </div>
          <div className="cycle-plan-highlight"><strong>{plan?.intensity || "Choose movement based on your energy today."}</strong><span>Recovery is always a valid option.</span></div>
          <div className="care-day-grid">{(plan?.days ?? []).map((day, index) => <article key={index} className="care-day"><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small><strong>{day.title}</strong><span>{day.minutes ? `${day.minutes} min` : "Rest"}</span><p>{day.exercises.join(" · ") || "Recovery"}</p></article>)}</div>
        </section>
      )}

      <section className="cycle-chat-card">
        <div className="cycle-section-heading compact">
          <div><span className="eyebrow">FITBUDDY COACH</span><h2>Ask about your cycle</h2><p>Ask about today's movement, recovery, symptoms, or how to adapt a workout.</p></div>
          <Sparkles size={24} />
        </div>
        <CompanionChat mode="cycle" opener="I can help with cycle-aware movement and self-care. Tell me what is happening today." placeholder="Ask about today's phase or care…" />
      </section>

      <section className="cycle-disclaimer"><ShieldCheck size={20} /><p><strong>Important:</strong> Cycle predictions are estimates. They should not be used as contraception or to diagnose a condition. Seek medical advice for severe pain, unusually heavy bleeding, fainting, or symptoms that disrupt normal life.</p></section>
    </div>
  );
}
