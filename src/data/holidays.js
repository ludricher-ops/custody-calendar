// Vacances scolaires Île-de-France (Zone C) — source : education.gouv.fr
// Les dates marquent le premier et dernier jour de vacances inclus.
const SCHOOL_HOLIDAYS = [
  // 2024-2025
  { label: 'Toussaint 2024',   start: '2024-10-19', end: '2024-11-03' },
  { label: 'Noël 2024',        start: '2024-12-21', end: '2025-01-05' },
  { label: 'Hiver 2025',       start: '2025-02-22', end: '2025-03-09' },
  { label: 'Printemps 2025',   start: '2025-04-19', end: '2025-05-04' },
  { label: 'Été 2025',         start: '2025-07-05', end: '2025-08-31' },
  // 2025-2026
  { label: 'Toussaint 2025',   start: '2025-10-18', end: '2025-11-02' },
  { label: 'Noël 2025',        start: '2025-12-20', end: '2026-01-04' },
  { label: 'Hiver 2026',       start: '2026-02-21', end: '2026-03-08' },
  { label: 'Printemps 2026',   start: '2026-04-11', end: '2026-04-26' },
  { label: 'Été 2026',         start: '2026-07-04', end: '2026-08-31' },
  // 2026-2027
  { label: 'Toussaint 2026',   start: '2026-10-17', end: '2026-11-01' },
  { label: 'Noël 2026',        start: '2026-12-19', end: '2027-01-03' },
  { label: 'Hiver 2027',       start: '2027-02-20', end: '2027-03-07' },
  { label: 'Printemps 2027',   start: '2027-04-10', end: '2027-04-25' },
  { label: 'Été 2027',         start: '2027-07-03', end: '2027-08-31' },
];

// Jours fériés France 2024-2027
const PUBLIC_HOLIDAYS = new Set([
  // 2024
  '2024-01-01','2024-04-01','2024-05-01','2024-05-08',
  '2024-05-09','2024-05-20','2024-07-14','2024-08-15',
  '2024-11-01','2024-11-11','2024-12-25',
  // 2025
  '2025-01-01','2025-04-21','2025-05-01','2025-05-08',
  '2025-05-29','2025-06-09','2025-07-14','2025-08-15',
  '2025-11-01','2025-11-11','2025-12-25',
  // 2026
  '2026-01-01','2026-04-06','2026-05-01','2026-05-08',
  '2026-05-14','2026-05-25','2026-07-14','2026-08-15',
  '2026-11-01','2026-11-11','2026-12-25',
  // 2027
  '2027-01-01','2027-03-29','2027-05-01','2027-05-08',
  '2027-05-06','2027-05-17','2027-07-14','2027-08-15',
  '2027-11-01','2027-11-11','2027-12-25',
]);

const PUBLIC_HOLIDAY_LABELS = {
  '01-01': 'Jour de l\'an',
  '05-01': 'Fête du Travail',
  '05-08': 'Victoire 1945',
  '07-14': 'Fête nationale',
  '08-15': 'Assomption',
  '11-01': 'Toussaint',
  '11-11': 'Armistice',
  '12-25': 'Noël',
};

const VARIABLE_HOLIDAYS = {
  '2024-04-01': 'Lundi de Pâques',
  '2024-05-09': 'Ascension',
  '2024-05-20': 'Lundi de Pentecôte',
  '2025-04-21': 'Lundi de Pâques',
  '2025-05-29': 'Ascension',
  '2025-06-09': 'Lundi de Pentecôte',
  '2026-04-06': 'Lundi de Pâques',
  '2026-05-14': 'Ascension',
  '2026-05-25': 'Lundi de Pentecôte',
  '2027-03-29': 'Lundi de Pâques',
  '2027-05-06': 'Ascension',
  '2027-05-17': 'Lundi de Pentecôte',
};

export function isSchoolHoliday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return SCHOOL_HOLIDAYS.some(h => {
    return d >= new Date(h.start + 'T00:00:00') && d <= new Date(h.end + 'T23:59:59');
  });
}

export function getSchoolHolidayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const h = SCHOOL_HOLIDAYS.find(h =>
    d >= new Date(h.start + 'T00:00:00') && d <= new Date(h.end + 'T23:59:59')
  );
  return h ? h.label : null;
}

export function isPublicHoliday(dateStr) {
  return PUBLIC_HOLIDAYS.has(dateStr);
}

export function getPublicHolidayLabel(dateStr) {
  if (VARIABLE_HOLIDAYS[dateStr]) return VARIABLE_HOLIDAYS[dateStr];
  const mmdd = dateStr.slice(5);
  return PUBLIC_HOLIDAY_LABELS[mmdd] || null;
}
