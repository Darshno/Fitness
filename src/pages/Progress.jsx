import { useEffect, useState } from "react";
import { getOverview, getWeeklyReport } from "../services/analyticsService";

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const processText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    if (line.startsWith('# ')) {
      elements.push(<h2 key={index} style={{marginTop: '16px', marginBottom: '8px', fontSize: '18px'}}>{processText(line.slice(2))}</h2>);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={index} style={{marginTop: '14px', marginBottom: '8px', fontSize: '16px'}}>{processText(line.slice(3))}</h3>);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={index} style={{marginTop: '12px', marginBottom: '8px', fontSize: '15px'}}>{processText(line.slice(4))}</h4>);
    } else if (line.startsWith('---')) {
      elements.push(<hr key={index} style={{margin: '16px 0', border: 'none', borderTop: '1px solid #eeeaf4'}} />);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      listItems.push(<li key={`li-${index}`} style={{lineHeight: 1.5, marginBottom: '6px', marginLeft: '12px'}}>{processText(line.slice(2))}</li>);
    } else {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${index}`} style={{margin: '8px 0', paddingLeft: '20px'}}>{listItems}</ul>);
        listItems = [];
      }
      if (line.trim()) {
        elements.push(<p key={index} style={{margin: '8px 0', lineHeight: 1.5}}>{processText(line)}</p>);
      }
    }
  });

  if (listItems.length > 0) {
    elements.push(<ul key="ul-end" style={{margin: '8px 0', paddingLeft: '20px'}}>{listItems}</ul>);
  }

  return <div>{elements}</div>;
};

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
    <div className="feature-card" style={{ marginTop: 18 }}>
      <h3>AI weekly report</h3>
      <div style={{ padding: "8px 0", color: "var(--ink)", lineHeight: 1.6 }}>{renderMarkdown(report)}</div>
      <p className="disclaimer" style={{ marginTop: '16px' }}>This report is based only on data FitBuddy has recorded and is not medical advice.</p>
    </div>
  </div>;
}
