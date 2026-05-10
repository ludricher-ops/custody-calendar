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

  // Single day update
  const updateDay = useCallback(async (dateStr, child, parent) => {
    const current = custodyRef.current[dateStr] ?? {};
    const updated  = { ...current, [child]: parent };

    setCustody(prev => {
      const next = { ...prev, [dateStr]: updated };
      if (!next[dateStr].avril && !next[dateStr].leo) delete next[dateStr];
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

    // Optimistic
    setCustody(prev => {
      const next = { ...prev };
      for (const { date, avril, leo } of updates) {
        if (!avril && !leo) delete next[date];
        else next[date] = { avril, leo };
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

  return { custody, loading, error, updateDay, bulkUpdate };
}
