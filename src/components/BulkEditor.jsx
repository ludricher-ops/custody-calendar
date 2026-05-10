import { useState } from 'react';

export default function BulkEditor({ count, onApply, onCancel }) {
  const [avril, setAvril] = useState(null); // 'alice' | 'ludo' | 'clear' | null
  const [leo,   setLeo]   = useState(null);

  const canApply = avril !== null || leo !== null;

  function toggle(current, setter, value) {
    setter(current === value ? null : value);
  }

  function handleApply() {
    onApply({ avril, leo });
    setAvril(null);
    setLeo(null);
  }

  return (
    <div className="bulk-bar">
      <div className="bulk-header">
        <span className="bulk-count">
          <strong>{count}</strong> jour{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
        </span>
        <button className="bulk-cancel" onClick={onCancel}>✕ Annuler la sélection</button>
      </div>

      <div className="bulk-rows">
        <BulkRow
          emoji="🌸" label="Avril"
          value={avril}
          onAlice={() => toggle(avril, setAvril, 'alice')}
          onLudo={()  => toggle(avril, setAvril, 'ludo')}
          onClear={()  => toggle(avril, setAvril, 'clear')}
        />
        <BulkRow
          emoji="🌊" label="Léo"
          value={leo}
          onAlice={() => toggle(leo, setLeo, 'alice')}
          onLudo={()  => toggle(leo, setLeo, 'ludo')}
          onClear={()  => toggle(leo, setLeo, 'clear')}
        />
      </div>

      <button
        className="bulk-apply"
        disabled={!canApply}
        onClick={handleApply}
      >
        Appliquer à {count} jour{count > 1 ? 's' : ''}
      </button>
    </div>
  );
}

function BulkRow({ emoji, label, value, onAlice, onLudo, onClear }) {
  return (
    <div className="bulk-row">
      <span className="bulk-child">{emoji} {label}</span>
      <div className="bulk-btns">
        <button className={`bb bb-alice ${value === 'alice' ? 'active' : ''}`} onClick={onAlice}>Alice</button>
        <button className={`bb bb-ludo  ${value === 'ludo'  ? 'active' : ''}`} onClick={onLudo}>Ludo</button>
        <button className={`bb bb-clear ${value === 'clear' ? 'active' : ''}`} onClick={onClear}>Effacer</button>
      </div>
      {value === null && <span className="bulk-hint">inchangé</span>}
    </div>
  );
}
