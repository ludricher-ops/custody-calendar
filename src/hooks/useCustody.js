import { useState, useEffect, useRef, useCallback } from 'react';

export function useCustody(year) {
  const [custody, setCustody] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const custodyRef = useRef(custody);

  useEffect(() => { custodyRef.current = custody; }, [custody]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/custody/${year}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setCustody(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [year]);

  // Single day update (avril / leo)
  const updateDay = useCallback(async (dateStr, child, parent) => {
    const current = custodyRef.current[dateStr] ?? {};
    const updated  = { ...current, [child]: parent };

    setCustody(prev => {
      const next = { ...prev, [dateStr]: updated };
      if (!next[dateStr].avril && !next[dateStr].leo && !next[dateStr].note) delete next[dateStr];
      return next;
    });

    try {
      const res = await fetch(`/api/custody/${dateStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Erreur de sauvegarde :', err);
    }
  }, []);

  // Note update — préserve avril/leo et envoie la note (trim côté serveur)
  const updateNote = useCallback(async (dateStr, note) => {
    const current = custodyRef.current[dateStr] ?? {};
    const trimmed = typeof note === 'string' ? note.trim() : '';

    setCustody(prev => {
      const next = { ...prev };
      const merged = { ...current };
      if (trimmed) merged.note = trimmed;
      else delete merged.note;

      if (!merged.avril && !merged.leo && !merged.note) delete next[dateStr];
      else next[dateStr] = merged;
      return next;
    });

    try {
      const res = await fetch(`/api/custody/${dateStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avril: current.avril ?? null,
          leo:   current.leo   ?? null,
          note:  trimmed,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Erreur de sauvegarde note :', err);
    }
  }, []);

  // Bulk update — avril/leo: 'alice' | 'ludo' | 'clear' | null (null = inchangé)
  const bulkUpdate = useCallback(async (days, { avril, leo }) => {
    const updates = days.map(dateStr => {
      const current = custodyRef.current[dateStr] ?? {};
      return {
        date:  dateStr,
        avril: avril === null ? (current.avril ?? null) : (avril === 'clear' ? null : avril),
        leo:   leo   === null ? (current.leo   ?? null) : (leo   === 'clear' ? null : leo),
      };
    });

    // Optimistic — bulk ne touche pas la note : on la préserve côté client
    setCustody(prev => {
      const next = { ...prev };
      for (const { date, avril, leo } of updates) {
        const note = prev[date]?.note;
        if (!avril && !leo && !note) {
          delete next[date];
        } else {
          next[date] = { avril, leo, ...(note ? { note } : {}) };
        }
      }
      return next;
    });

    try {
      const res = await fetch('/api/custody/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Erreur bulk :', err);
    }
  }, []);

  return { custody, loading, error, updateDay, updateNote, bulkUpdate };
}
