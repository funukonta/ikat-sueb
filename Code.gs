/**
 * Ikat — weighing session tracker.
 * Database: this spreadsheet. One tab per session ("sesi 20-september-2026"),
 * one row per step: Step | Jumlah Ikat | Berat (kg) | Waktu.
 */

const SESSION_PREFIX = 'sesi ';
const HEADERS = ['Step', 'Jumlah Ikat', 'Berat (kg)', 'Waktu'];
const MONTHS = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Ikat')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/** All session tabs in tab order, with totals. */
function listSessions() {
  return SpreadsheetApp.getActive().getSheets()
    .filter(sh => sh.getName().indexOf(SESSION_PREFIX) === 0)
    .map(sh => summarize_(sh.getName(), readSteps_(sh)));
}

/** Steps of one session. */
function getSession(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Sesi "' + name + '" tidak ditemukan');
  const steps = readSteps_(sh);
  return Object.assign(summarize_(name, steps), { stepList: steps });
}

/**
 * Appends one step. If sessionName is empty, a new session tab is created first,
 * so abandoned sessions never leave empty tabs behind.
 */
function addStep(sessionName, ikat, berat) {
  ikat = Number(ikat);
  berat = Number(berat);
  if (!(ikat >= 1 && ikat <= 5 && Math.floor(ikat) === ikat)) throw new Error('Jumlah ikat harus 1–5');
  if (!(berat > 0)) throw new Error('Berat harus lebih dari 0');

  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActive();
    const sh = sessionName ? ss.getSheetByName(sessionName) : createSessionSheet_(ss);
    if (!sh) throw new Error('Sesi "' + sessionName + '" tidak ditemukan');

    const step = Math.max(sh.getLastRow(), 1); // row 1 is the header
    sh.appendRow([step, ikat, berat, new Date()]);
    SpreadsheetApp.flush();
    return getSession(sh.getName());
  } finally {
    lock.releaseLock();
  }
}

function createSessionSheet_(ss) {
  const now = new Date();
  const tz = ss.getSpreadsheetTimeZone();
  const day = Utilities.formatDate(now, tz, 'd');
  const month = MONTHS[Number(Utilities.formatDate(now, tz, 'M')) - 1];
  const year = Utilities.formatDate(now, tz, 'yyyy');
  const base = SESSION_PREFIX + day + '-' + month + '-' + year;

  let name = base;
  for (let i = 2; ss.getSheetByName(name); i++) name = base + ' (' + i + ')';

  const sh = ss.insertSheet(name, ss.getSheets().length);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange('C:C').setNumberFormat('0.##');
  sh.getRange('D:D').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  return sh;
}

function readSteps_(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 4).getValues()
    .filter(r => r[0] !== '')
    .map(r => ({
      step: Number(r[0]),
      ikat: Number(r[1]),
      berat: Number(r[2]),
      // Date objects can't cross google.script.run, send ISO strings
      waktu: r[3] instanceof Date ? r[3].toISOString() : String(r[3]),
    }));
}

function summarize_(name, steps) {
  return {
    name: name,
    steps: steps.length,
    totalIkat: steps.reduce((a, s) => a + s.ikat, 0),
    totalKg: Math.round(steps.reduce((a, s) => a + s.berat, 0) * 100) / 100,
  };
}
