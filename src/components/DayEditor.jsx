import { useEffect } from 'react';
import { getPublicHolidayLabel, getSchoolHolidayLabel } from '../data/holidays';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export default function DayEditor({ dateStr, custody, onUpdate, onClose }) {
  const date = new Date(dateStr + 'T12:00:00');
  const label = getPublicHolidayLabel(dateStr) || getSchoolHolidayLabel(dateStr);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const avrilParent = custody?.avril ?? null;
  const leoParent   = custody?.leo   ?? null;

  function toggle(child, parent, current) {
    onUpdate(child, current === parent ? null : parent);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>

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
