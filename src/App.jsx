import { useState, useCallback } from 'react';
import MonthGrid from './components/MonthGrid';
import KPIPanel from './components/KPIPanel';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

const STORAGE_KEY = 'custody-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [year, setYear]       = useState(new Date().getFullYear());
  const [custody, setCustody] = useState(load);
  const [showKPI, setShowKPI] = useState(true);

  const updateDay = useCallback((dateStr, child, parent) => {
    setCustody(prev => {
      const next = {
        ...prev,
        [dateStr]: { ...prev[dateStr], [child]: parent },
      };
      // Remove the day entry if both children are unset
      if (next[dateStr].avril === null && next[dateStr].leo === null) {
        delete next[dateStr];
      }
      save(next);
      return next;
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <h1>📅 Calendrier de garde</h1>
          <div className="header-children">
            <span className="chip-child">🌸 Avril</span>
            <span className="chip-child">🌊 Léo</span>
          </div>
        </div>

        <div className="header-legend">
          <span className="legend-pill alice">Alice</span>
          <span className="legend-pill ludo">Ludo</span>
        </div>

        <div className="header-controls">
          <div className="year-nav">
            <button onClick={() => setYear(y => y - 1)} aria-label="Année précédente">‹</button>
            <span className="year-label">{year}</span>
            <button onClick={() => setYear(y => y + 1)} aria-label="Année suivante">›</button>
          </div>
          <button className="btn-toggle-kpi" onClick={() => setShowKPI(v => !v)}>
            {showKPI ? 'Masquer stats' : 'Voir stats'}
          </button>
        </div>
      </header>

      {showKPI && <KPIPanel custody={custody} year={year} />}

      <div className="legend-bar">
        <span className="lb-item"><span className="lb-dot vac" /> Vacances scolaires</span>
        <span className="lb-item"><span className="lb-dot ph"  /> Jour férié</span>
        <span className="lb-item"><span className="lb-dot alice-dot" /> Alice</span>
        <span className="lb-item"><span className="lb-dot ludo-dot"  /> Ludo</span>
        <span className="lb-item"><span className="ci ci-none" style={{fontSize:'0.6rem',width:12,height:12}}>A</span>&nbsp;= Avril&nbsp;&nbsp;<span className="ci ci-none" style={{fontSize:'0.6rem',width:12,height:12}}>L</span>&nbsp;= Léo</span>
      </div>

      <main className="calendar-container">
        {MONTHS.map((name, i) => (
          <MonthGrid
            key={i}
            year={year}
            month={i}
            monthName={name}
            custody={custody}
            onUpdateDay={updateDay}
          />
        ))}
      </main>
    </div>
  );
}
