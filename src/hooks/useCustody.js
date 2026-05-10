import { useState, useEffect, useRef, useCallback } from 'react';

export function useCustody(year) {
  const [custody, setCustody] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const custodyRef = useRef(custody);

  // Keep ref in sync with state (for optimistic updates)
  useEffect(() => { custodyRef.current = custody; }, [custody]);

  // Fetch all custody data for the year
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/custody/${year}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setCustody(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [year]);

  // Optimistic update + background sync
  const updateDay = useCallback(async (dateStr, child, parent) => {
    const current = custodyRef.current[dateStr] ?? {};
    const updated  = { ...current, [child]: parent };

    // Optimistic UI update
    setCustody(prev => {
      const next = { ...prev, [dateStr]: updated };
      if (!next[dateStr].avril && !next[dateStr].leo) delete next[dateStr];
      return next;
    });

    // Sync to server
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

  return { custody, loading, error, updateDay };
}
