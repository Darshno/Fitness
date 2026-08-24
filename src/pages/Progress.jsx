import { useEffect, useState } from "react";
import { getOverview, getWeeklyReport } from "../services/analyticsService";

export default function Progress() {
  const [data, setData] = useState(null);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getOverview(), getWeeklyReport()]).then(([overview, weekly]) => { setData(overview); setReport(weekly.report); }).catch((e) => setError(e.message));
  }, []);
  if (error) return <div className="feature-card"><h2>Progress</h2><p>{error}</p></div>;
  if (!data) return <div className="feature-card"><p className="loading-pulse">Loading your progress…</p></div>;
  return <div>
    <div className="mode-header"><div><span className="eyebrow">PROGRESS</span><h2>Your week at a glance 📈</h2><p>Trends from the data FitBuddy has available.</p></div></div>
    <div className="feature-grid">
      <div className="feature-card"><h3>Workouts</h3><strong className="big-number">{data.totals.workouts}</strong><p>completed this week</p></div>
      <div className="feature-card"><h3>Calories</h3><strong className="big-number">{Math.round(data.totals.calories)}</strong><p>logged</p></div>
      <div className="feature-card"><h3>Protein</h3><strong className="big-number">{Math.round(data.totals.protein)} g</strong><p>logged</p></div>
      <div className="feature-card"><h3>Hydration</h3><strong className="big-number">{Math.round(data.totals.water)}</strong><p>glasses</p></div>
    </div>
    <div className="feature-card" style={{ marginTop: 18 }}><h3>7-day activity</h3>{data.days.map((day) => <div className="exercise" key={day.date}><span>{day.date}</span><b>{day.workouts} workout · {Math.round(day.calories)} kcal · {Math.round(day.protein)}g protein · {day.water} water</b></div>)}</div>
    <div className="feature-card" style={{ marginTop: 18 }}><h3>AI weekly report</h3><p style={{ whiteSpace: "pre-wrap" }}>{report}</p><p className="disclaimer">This report is based only on data FitBuddy has recorded and is not medical advice.</p></div>
  </div>;
}
