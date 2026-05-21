const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f5f5f5',
    show: false,
  });

  mainWindow.maximize();

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── JSON Database (zero native deps) ────────────────────────────────────────
function getDbPath() {
  return isDev
    ? path.join(__dirname, 'hris-data.json')
    : path.join(app.getPath('userData'), 'hris-data.json');
}

function readDb() {
  const p = getDbPath();
  if (!fs.existsSync(p)) {
    const init = { karyawan: [], _lastId: 0 };
    fs.writeFileSync(p, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2));
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
function setupIpcHandlers() {

  ipcMain.handle('karyawan:getAll', (_, { search = '', filter = {} } = {}) => {
    const db = readDb();
    let rows = [...db.karyawan].reverse();

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(k =>
        (k.nama || '').toLowerCase().includes(s) ||
        (k.npk || '').toLowerCase().includes(s) ||
        (k.nik || '').toLowerCase().includes(s) ||
        (k.sid || '').toLowerCase().includes(s) ||
        (k.jabatan || '').toLowerCase().includes(s) ||
        (k.departemen || '').toLowerCase().includes(s)
      );
    }
    if (filter.departemen) rows = rows.filter(k => k.departemen === filter.departemen);
    if (filter.tipe_karyawan) rows = rows.filter(k => k.tipe_karyawan === filter.tipe_karyawan);
    if (filter.status_karyawan) rows = rows.filter(k => k.status_karyawan === filter.status_karyawan);
    if (filter.mess) rows = rows.filter(k => k.mess === filter.mess);

    return rows;
  });

  ipcMain.handle('karyawan:getOne', (_, id) => {
    const db = readDb();
    return db.karyawan.find(k => k.id === id) || null;
  });

  ipcMain.handle('karyawan:create', (_, data) => {
    const db = readDb();
    db._lastId = (db._lastId || 0) + 1;
    const now = new Date().toISOString();
    const record = { ...data, id: db._lastId, created_at: now, updated_at: now };
    db.karyawan.push(record);
    writeDb(db);
    return record;
  });

  ipcMain.handle('karyawan:update', (_, { id, ...data }) => {
    const db = readDb();
    const idx = db.karyawan.findIndex(k => k.id === id);
    if (idx === -1) throw new Error('Data tidak ditemukan');
    db.karyawan[idx] = { ...db.karyawan[idx], ...data, id, updated_at: new Date().toISOString() };
    writeDb(db);
    return db.karyawan[idx];
  });

  ipcMain.handle('karyawan:delete', (_, id) => {
    const db = readDb();
    db.karyawan = db.karyawan.filter(k => k.id !== id);
    writeDb(db);
    return { success: true };
  });

  ipcMain.handle('karyawan:stats', () => {
    const db = readDb();
    const rows = db.karyawan;
    const total = rows.length;
    const aktif = rows.filter(k => k.status_karyawan === 'Aktif').length;

    const groupBy = (key) => {
      const map = {};
      rows.forEach(k => {
        const v = k[key] || '';
        if (!v) return;
        map[v] = (map[v] || 0) + 1;
      });
      return Object.entries(map).map(([k, count]) => ({ [key]: k, count }));
    };

    const byTipe = groupBy('tipe_karyawan');
    const byDept = groupBy('departemen').sort((a, b) => b.count - a.count).slice(0, 8);
    const byMess = groupBy('mess');
    const byGender = groupBy('jenis_kelamin');

    return { total, aktif, byTipe, byDept, byMess, byGender };
  });

  ipcMain.handle('karyawan:export', () => {
    return readDb().karyawan;
  });

  ipcMain.handle('karyawan:getDistinct', (_, field) => {
    const allowed = ['departemen', 'jabatan', 'tipe_karyawan'];
    if (!allowed.includes(field)) return [];
    const db = readDb();
    const vals = [...new Set(db.karyawan.map(k => k[field]).filter(Boolean))].sort();
    return vals;
  });
}
