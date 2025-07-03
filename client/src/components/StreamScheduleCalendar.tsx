import React, { useMemo, useState } from 'react';
import './StreamScheduleCalendar.css';

// Static 12-session template (MVP)
const SESSION_TITLES: string[] = [
  'Morning Prayers / Motivation',
  'Hygiene Special',
  'Market Special',
  'Ad Break',
  'Video-Game Live-Stream',
  'Movie Time',
  'FTJ-TV Show',
  'FTJ-News – Bholtage with Nepalki Sharma',
  'Talk Show with Dr Amarpaji Singh',
  'Geo-Stationary Politics',
  'Goon Fuel',
  'NSFW Hour'
];

// For MVP, simple holiday list (can be replaced with generated JSON)
const HOLIDAYS: Record<string, string> = {
  // ISO date → description
  '2025-01-26': '🇮🇳 India – Republic Day',
  '2025-08-15': '🇮🇳 India – Independence Day',
  '2025-07-04': '🇺🇸 USA – Independence Day',
  '2025-05-09': '🇷🇺 Russia – Victory Day'
};

// Helper to format date to YYYY-MM-DD
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const StreamScheduleCalendar: React.FC = () => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // For stream-day counter (MVP: assume start today)
  const streamStart = useMemo(() => new Date(), []);

  // Build grid for current month
  const { weeks, monthName, year } = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11
    const monthName = today.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return { weeks, monthName, year };
  }, [today]);

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    setSelectedDay(day);
  };

  const closeModal = () => setSelectedDay(null);

  // Calculate day number since stream start
  const dayNumber = selectedDay
    ? Math.floor(
        (new Date(year, today.getMonth(), selectedDay).getTime() - streamStart.setHours(0, 0, 0, 0)) /
          86400000
      ) + 1
    : 0;

  return (
    <div className="stream-calendar-container">
      <h2 className="calendar-title">
        {monthName} {year}
      </h2>
      <table className="calendar-grid">
        <thead>
          <tr>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, idx) => {
                if (!day) return <td key={idx} className="empty"></td>;
                const dateObj = new Date(year, today.getMonth(), day);
                const isPast = dateObj < new Date(today.setHours(0, 0, 0, 0));
                const isToday = day === today.getDate();
                const iso = isoDate(dateObj);
                const holiday = HOLIDAYS[iso];

                return (
                  <td
                    key={idx}
                    className={`day-cell ${isPast ? 'past' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDayClick(day)}
                    title={holiday || ''}
                  >
                    {day}
                    {holiday && <span className="holiday-dot" title={holiday}></span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for selected day */}
      {selectedDay && (
        <div className="day-modal" onClick={closeModal}>
          <div className="day-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              Day {selectedDay} – Session Plan (Day #{dayNumber})
            </h3>
            <ul className="session-list">
              {SESSION_TITLES.map((title, idx) => (
                <li key={idx}>
                  <span className="session-slot">{idx + 1}</span>
                  <span className="session-title">{title}</span>
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamScheduleCalendar; 