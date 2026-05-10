import { useState } from 'react';
import DayCell from './DayCell';
import DayEditor from './DayEditor';

const DOW_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export default function MonthGrid({
  year, month, monthName, custody, onUpdateDay,
  selectionMode, selectedDays, onToggleDay, onSelectMonth, onDeselectMonth,
}) {
  const [editing, setEditing] = useState(null);

  const firstDow  = new Date(year, month, 1).getDay();
  const offset    = firstDow === 0 ? 6 : firstDow - 1;
  const daysCount = new Date(year, month + 1, 0).getDate();

  const monthDates = Array.from({ length: daysCount }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const allSelected = monthDates.every(ds => selectedDays.has(ds));

  const cells = Array(offset).fill(null);
  for (let d = 1; d <= daysCount; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ d, dateStr, date: new Date(year, month, d) });
  }

  return (
    <div className={`month-card${selectionMode ? ' selection-mode' : ''}`}>
      <div className="month-header">
        <h3 className="month-title">{monthName}</h3>
        {selectionMode && (
          <button
            className="btn-select-month"
            onClick={allSelected ? onDeselectMonth : onSelectMonth}
          >
            {allSelected ? 'Tout désélect.' : 'Tout le mois'}
          </button>
        )}
      </div>

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
              selectionMode={selectionMode}
              isSelected={selectedDays.has(cell.dateStr)}
              onEdit={() => setEditing(cell.dateStr)}
              onToggleSelect={() => onToggleDay(cell.dateStr)}
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
