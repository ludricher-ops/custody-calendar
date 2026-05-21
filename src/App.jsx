import { useState, useCallback } from 'react';
import MonthGrid from './components/MonthGrid';
import KPIPanel from './components/KPIPanel';
import BulkEditor from './components/BulkEditor';
import FAQ from './components/FAQ';
import { useCustody } from './hooks/useCustody';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

export default function App() {
  const [year, setYear]               = useState(new Date().getFullYear());
  const [showKPI, setShowKPI]         = useState(true);
  const [selectionMode, setSelection] = useState(false);
  const [selectedDays, setSelected]   = useState(new Set());
  const [showFAQ, setShowFAQ]         = useState(false);

  const { custody, loading, error, updateDay, updateNote, bulkUpdate } = useCustody(year);

  const toggleDay = useCallback((dateStr) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  }, []);

  const selectMonth = useCallback((year, month) => {
    const days = new Date(year, month + 1, 0).getDate();
    setSelected(prev => {
      const next = new Set(prev);
      for (let d = 1; d <= days; d++) {
        next.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
      return next;
    });
  }, []);

  const deselectMonth = useCallback((year, month) => {
    const days = new Date(year, month + 1, 0).getDate();
    setSelected(prev => {
      const next = new Set(prev);
      for (let d = 1; d <= days; d++) {
        next.delete(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
      return next;
    });
  }, []);

  function enterSelectionMode() {
    setSelection(true);
    setSelected(new Set());
  }

  function cancelSelection() {
    setSelection(false);
    setSelected(new Set());
  }

  async function handleBulkApply(choices) {
    await bulkUpdate([...selectedDays], choices);
    cancelSelection();
  }

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
          <button
            className={`btn-selection ${selectionMode ? 'active' : ''}`}
            onClick={selectionMode ? cancelSelection : enterSelectionMode}
          >
            {selectionMode ? '✕ Quitter la sélection' : '☑ Sélection multiple'}
          </button>
          <button className="btn-toggle-kpi" onClick={() => setShowKPI(v => !v)}>
            {showKPI ? 'Masquer stats' : 'Voir stats'}
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            🖨 Imprimer
          </button>
          <button className="btn-faq" onClick={() => setShowFAQ(true)} aria-label="Aide">
            ?
          </button>
        </div>
      </header>

      {!selectionMode && (
        <div className={showKPI ? 'kpi-wrap' : 'kpi-wrap kpi-hidden-screen'}>
          <KPIPanel custody={custody} year={year} />
        </div>
      )}

      {!selectionMode && (
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
      )}

      {selectionMode && (
        <div className="selection-banner">
          Clique sur les jours pour les sélectionner — utilise "Tout le mois" dans chaque mois pour aller plus vite
        </div>
      )}

      {loading && <div className="status-bar loading">Chargement des données…</div>}
      {error   && <div className="status-bar error">Erreur de connexion : {error}</div>}

      <main className="calendar-container">
        {[[0, 'semester-1'], [6, 'semester-2']].map(([start, cls]) => (
          <div key={cls} className={`semester ${cls}`}>
            {MONTHS.slice(start, start + 6).map((name, idx) => {
              const i = start + idx;
              return (
                <MonthGrid
                  key={i}
                  year={year}
                  month={i}
                  monthName={name}
                  custody={custody}
                  onUpdateDay={updateDay}
                  onUpdateNote={updateNote}
                  selectionMode={selectionMode}
                  selectedDays={selectedDays}
                  onToggleDay={toggleDay}
                  onSelectMonth={() => selectMonth(year, i)}
                  onDeselectMonth={() => deselectMonth(year, i)}
                />
              );
            })}
          </div>
        ))}
      </main>

      {selectionMode && selectedDays.size > 0 && (
        <BulkEditor
          count={selectedDays.size}
          onApply={handleBulkApply}
          onCancel={cancelSelection}
        />
      )}

      {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
    </div>
  );
}
