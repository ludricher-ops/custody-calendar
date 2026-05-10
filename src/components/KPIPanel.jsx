const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function computeStats(custody, year) {
  const monthly = [];

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const s = {
      alice: { avril: 0, leo: 0, total: 0 },
      ludo:  { avril: 0, leo: 0, total: 0 },
    };
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const day = custody[ds];
      if (!day) continue;
      if (day.avril === 'alice') { s.alice.avril++; }
      if (day.avril === 'ludo')  { s.ludo.avril++;  }
      if (day.leo   === 'alice') { s.alice.leo++;   }
      if (day.leo   === 'ludo')  { s.ludo.leo++;    }
      if (day.avril === 'alice' || day.leo === 'alice') s.alice.total++;
      if (day.avril === 'ludo'  || day.leo === 'ludo')  s.ludo.total++;
    }
    monthly.push(s);
  }

  const yearly = {
    alice: monthly.reduce((a, m) => ({ avril: a.avril + m.alice.avril, leo: a.leo + m.alice.leo, total: a.total + m.alice.total }), { avril: 0, leo: 0, total: 0 }),
    ludo:  monthly.reduce((a, m) => ({ avril: a.avril + m.ludo.avril,  leo: a.leo + m.ludo.leo,  total: a.total + m.ludo.total  }), { avril: 0, leo: 0, total: 0 }),
  };

  return { monthly, yearly };
}

export default function KPIPanel({ custody, year }) {
  const { monthly, yearly } = computeStats(custody, year);

  return (
    <div className="kpi-panel">
      <div className="kpi-cards">
        <KPICard name="Alice" cls="alice" stats={yearly.alice} />
        <KPICard name="Ludo"  cls="ludo"  stats={yearly.ludo}  />
      </div>

      <div className="kpi-table-wrap">
        <table className="kpi-table">
          <thead>
            <tr>
              <th rowSpan={2} className="th-month">Mois</th>
              <th colSpan={3} className="th-alice">Alice</th>
              <th colSpan={3} className="th-ludo">Ludo</th>
            </tr>
            <tr>
              <th className="th-alice sub">Garde</th>
              <th className="th-alice sub">Avril</th>
              <th className="th-alice sub">Léo</th>
              <th className="th-ludo sub">Garde</th>
              <th className="th-ludo sub">Avril</th>
              <th className="th-ludo sub">Léo</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((s, i) => (
              <tr key={i}>
                <td className="td-month">{MONTHS_FR[i]}</td>
                <td className="td-alice">{s.alice.total || '—'}</td>
                <td className="td-alice">{s.alice.avril || '—'}</td>
                <td className="td-alice">{s.alice.leo   || '—'}</td>
                <td className="td-ludo">{s.ludo.total  || '—'}</td>
                <td className="td-ludo">{s.ludo.avril  || '—'}</td>
                <td className="td-ludo">{s.ludo.leo    || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="tr-total">
              <td className="td-month">Total</td>
              <td className="td-alice">{yearly.alice.total}</td>
              <td className="td-alice">{yearly.alice.avril}</td>
              <td className="td-alice">{yearly.alice.leo}</td>
              <td className="td-ludo">{yearly.ludo.total}</td>
              <td className="td-ludo">{yearly.ludo.avril}</td>
              <td className="td-ludo">{yearly.ludo.leo}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function KPICard({ name, cls, stats }) {
  return (
    <div className={`kpi-card kpi-${cls}`}>
      <div className="kpi-card-name">{name}</div>
      <div className="kpi-card-big">{stats.total}<span className="kpi-unit"> j</span></div>
      <div className="kpi-card-sub">
        🌸 Avril&nbsp;<strong>{stats.avril}</strong>&nbsp;·&nbsp;🌊 Léo&nbsp;<strong>{stats.leo}</strong>
      </div>
    </div>
  );
}
