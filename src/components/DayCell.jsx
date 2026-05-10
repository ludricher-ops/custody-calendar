import { isSchoolHoliday, isPublicHoliday, getPublicHolidayLabel, getSchoolHolidayLabel } from '../data/holidays';

const todayStr = new Date().toISOString().slice(0, 10);

function getBg(isPH, isSH, isWE, ap, lp) {
  if (ap === 'alice' && lp === 'alice') return '#fce4ec';
  if (ap === 'ludo'  && lp === 'ludo')  return '#e3f2fd';
  if (ap === 'alice' || lp === 'alice') return '#fdeef5';
  if (ap === 'ludo'  || lp === 'ludo')  return '#edf3fd';
  if (isPH) return '#fff3e0';
  if (isSH) return '#fffde7';
  if (isWE) return '#f5f5f5';
  return '#ffffff';
}

export default function DayCell({ dateStr, day, date, custody, selectionMode, isSelected, onEdit, onToggleSelect }) {
  const dow   = date.getDay();
  const isWE  = dow === 0 || dow === 6;
  const isSH  = isSchoolHoliday(dateStr);
  const isPH  = isPublicHoliday(dateStr);
  const today = dateStr === todayStr;

  const ap = custody?.avril ?? null;
  const lp = custody?.leo   ?? null;

  const tooltipParts = [];
  if (isPH) tooltipParts.push(getPublicHolidayLabel(dateStr) || 'Jour férié');
  if (isSH && !isPH) tooltipParts.push(getSchoolHolidayLabel(dateStr) || 'Vacances');

  const style = {
    background: getBg(isPH, isSH, isWE, ap, lp),
    border: isSelected
      ? '2px solid #7c3aed'
      : today
      ? '2px solid #2196f3'
      : '1px solid transparent',
    outline: isSelected ? '2px solid #ddd6fe' : undefined,
  };

  return (
    <div
      className={`day-cell${isSelected ? ' selected' : ''}`}
      style={style}
      onClick={selectionMode ? onToggleSelect : onEdit}
      title={tooltipParts.join(' · ') || undefined}
    >
      {isSelected && <div className="sel-check">✓</div>}
      {!isSelected && isSH && !isPH && <div className="vac-dot" title={getSchoolHolidayLabel(dateStr)} />}
      <span className={`day-num${isPH ? ' ph' : ''}`}>{day}</span>
      {!selectionMode && (
        <div className="ci-row">
          <span className={`ci ci-${ap || 'none'}`}>A</span>
          <span className={`ci ci-${lp || 'none'}`}>L</span>
        </div>
      )}
    </div>
  );
}
