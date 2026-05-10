import { useState } from 'react';
import DayCell from './DayCell';
import DayEditor from './DayEditor';

const DOW_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export default function MonthGrid({ year, month, monthName, custody, onUpdateDay }) {
  const [editing, setEditing] = useState(null);

  const firstDow = new Date(year, month, 1).getDay();
  const offset   = firstDow === 0 ? 6 : firstDow - 1; // lundi = 0
  const daysCount = new Date(year, month + 1, 0).getDate();

  const cells = Array(offset).fill(null);
  for (let d = 1; d <= daysCount; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ d, dateStr, date: new Date(year, month, d) });
  }

  return (
    <div className="month-card">
      <h3 className="month-title">{monthName}</h3>

      <div className="month-grid">
        {DOW_LABELS.map(l => (
          <div key={l} className="dow-hdr">{l}</div>
        ))}
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.dateStr}
              dateStr={cell.dateStr}
              day={cell.d}
              date={cell.date}
              custody={custody[cell.dateStr]}
              onEdit={() => setEditing(cell.dateStr)}
            />
          ) : (
            <div key={`e${i}`} className="day-cell empty" />
          )
        )}
      </div>

      {editing && (
        <DayEditor
          dateStr={editing}
          custody={custody[editing]}
          onUpdate={(child, parent) => onUpdateDay(editing, child, parent)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
