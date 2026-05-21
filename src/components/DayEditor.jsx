import { useEffect, useRef, useState } from 'react';
import { getPublicHolidayLabel, getSchoolHolidayLabel } from '../data/holidays';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export default function DayEditor({ dateStr, custody, onUpdate, onUpdateNote, onClose }) {
  const date = new Date(dateStr + 'T12:00:00');
  const label = getPublicHolidayLabel(dateStr) || getSchoolHolidayLabel(dateStr);

  const initialNote = custody?.note ?? '';
  const [note, setNote] = useState(initialNote);
  const lastSavedRef = useRef(initialNote);

  function persistNote() {
    const trimmed = note.trim();
    if (trimmed !== (lastSavedRef.current ?? '').trim()) {
      onUpdateNote?.(trimmed);
      lastSavedRef.current = trimmed;
    }
  }

  function handleClose() {
    persistNote();
    onClose();
  }

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const avrilParent = custody?.avril ?? null;
  const leoParent   = custody?.leo   ?? null;

  function toggle(child, parent, current) {
    onUpdate(child, current === parent ? null : parent);
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} aria-label="Fermer">×</button>

        <div className="modal-date">
          <span className="modal-day-name">
            {DAYS_FR[date.getDay()]} {date.getDate()} {MONTHS_FR[date.getMonth()]} {date.getFullYear()}
          </span>
          {label && <span className="modal-holiday-label">{label}</span>}
        </div>

        <p className="modal-hint">Sélectionne le parent qui a la garde de chaque enfant</p>

        <div className="child-rows">
          <ChildRow
            childName="Avril"
            emoji="🌸"
            parent={avrilParent}
            onAlice={() => toggle('avril', 'alice', avrilParent)}
            onLudo={()  => toggle('avril', 'ludo',  avrilParent)}
          />
          <ChildRow
            childName="Léo"
            emoji="🌊"
            parent={leoParent}
            onAlice={() => toggle('leo', 'alice', leoParent)}
            onLudo={()  => toggle('leo', 'ludo',  leoParent)}
          />
        </div>

        <div className="modal-preview">
          <ChildSummary name="Avril" parent={avrilParent} />
          <ChildSummary name="Léo"   parent={leoParent}   />
        </div>

        <div className="note-row">
          <label className="note-label" htmlFor={`note-${dateStr}`}>📝 Note</label>
          <textarea
            id={`note-${dateStr}`}
            className="note-input"
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={persistNote}
            placeholder="Ajouter une note (rendez-vous, événement, remarque…)"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

function ChildRow({ childName, emoji, parent, onAlice, onLudo }) {
  return (
    <div className="child-row">
      <span className="child-name">{emoji} {childName}</span>
      <div className="parent-buttons">
        <button
          className={`parent-btn btn-alice ${parent === 'alice' ? 'active' : ''}`}
          onClick={onAlice}
        >
          Alice
        </button>
        <button
          className={`parent-btn btn-ludo ${parent === 'ludo' ? 'active' : ''}`}
          onClick={onLudo}
        >
          Ludo
        </button>
      </div>
    </div>
  );
}

function ChildSummary({ name, parent }) {
  if (!parent) return null;
  return (
    <div className={`summary-chip ${parent}`}>
      {name} → {parent === 'alice' ? 'Alice' : 'Ludo'}
    </div>
  );
}
