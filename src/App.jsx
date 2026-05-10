import { useState } from 'react';
import MonthGrid from './components/MonthGrid';
import KPIPanel from './components/KPIPanel';
import { useCustody } from './hooks/useCustody';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [showKPI, setShowKPI] = useState(true);
  const { custody, loading, error, updateDay } = useCustody(year);

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
        <span className="lb-item">
          <span className="ci ci-none" style={{fontSize:'0.6rem',width:12,height:12}}>A</span>
          &nbsp;= Avril&nbsp;&nbsp;
          <span className="ci ci-none" style={{fontSize:'0.6rem',width:12,height:12}}>L</span>
          &nbsp;= Léo
        </span>
      </div>

      {loading && (
        <div className="status-bar loading">Chargement des données…</div>
      )}
      {error && (
        <div className="status-bar error">Erreur de connexion : {error}</div>
      )}

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
