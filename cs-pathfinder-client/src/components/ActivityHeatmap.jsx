// src/components/ActivityHeatmap.jsx
import "./ActivityHeatmap.css";

const ActivityHeatmap = ({ activityDates = [] }) => {
  const dateSet = new Set(activityDates);

  // Build last 84 days (12 weeks) grid
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
    days.push({ key, label, active: dateSet.has(key) });
  }

  // Group into 12 columns of 7
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  // Month labels — show month name at first day of each month
  const monthLabels = weeks.map((week) => {
    const firstNewMonth = week.find((d, i) => {
      const dt = new Date(d.key);
      return (
        dt.getDate() <= 7 &&
        (i === 0 || new Date(week[i - 1]?.key).getMonth() !== dt.getMonth())
      );
    });
    return firstNewMonth
      ? new Date(firstNewMonth.key).toLocaleDateString([], { month: "short" })
      : "";
  });

  return (
    <div className="ah-root">
      {/* Month labels */}
      <div className="ah-months">
        {monthLabels.map((label, i) => (
          <span key={i} className="ah-month">
            {label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="ah-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="ah-week">
            {week.map((day) => (
              <div
                key={day.key}
                className={`ah-cell ${day.active ? "ah-active" : ""}`}
                title={`${day.label}${day.active ? " — completed resources" : ""}`}
                aria-label={`${day.label}${day.active ? ", active" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="ah-legend">
        <span>Less</span>
        <div className="ah-cell" />
        <div className="ah-cell ah-active" style={{ opacity: 0.4 }} />
        <div className="ah-cell ah-active" style={{ opacity: 0.7 }} />
        <div className="ah-cell ah-active" />
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
