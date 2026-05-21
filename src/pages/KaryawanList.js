import React, { useEffect, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

const TIPE_OPTIONS = ['Tetap', 'Kontrak', 'Magang', 'PKWTT'];
const STATUS_OPTIONS = ['Aktif', 'Tidak Aktif', 'Resign', 'PHK'];

function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Hapus Karyawan?</div>
        <div className="modal-body">
          Data <strong>{name}</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button className="btn btn-danger" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  );
}

export default function KaryawanList({ onNavigate }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({});
  const [depts, setDepts] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const load = useCallback(() => {
    window.hris.karyawan.getAll({ search, filter }).then(setData);
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    window.hris.karyawan.getDistinct('departemen').then(setDepts);
  }, []);

  const handleDelete = async () => {
    await window.hris.karyawan.delete(deleteTarget.id);
    setDeleteTarget(null);
    addToast(`${deleteTarget.nama} berhasil dihapus`);
    load();
  };

  const handleExport = async () => {
    const rows = await window.hris.karyawan.export();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Karyawan');
    XLSX.writeFile(wb, `Data_Karyawan_${new Date().toISOString().slice(0,10)}.xlsx`);
    addToast('Data berhasil diexport ke Excel');
  };

  const badgeTipe = (t) => {
    const map = { 'Tetap': 'badge-green', 'Kontrak': 'badge-blue', 'Magang': 'badge-amber', 'PKWTT': 'badge-gray' };
    return map[t] || 'badge-gray';
  };

  const badgeStatus = (s) => {
    const map = { 'Aktif': 'badge-green', 'Tidak Aktif': 'badge-gray', 'Resign': 'badge-amber', 'PHK': 'badge-red' };
    return map[s] || 'badge-gray';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Karyawan</h1>
          <p className="page-sub">{data.length} karyawan ditemukan</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={handleExport}>↓ Export Excel</button>
          <button className="btn btn-primary" onClick={() => onNavigate('karyawan-form', null)}>
            + Tambah Karyawan
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Cari nama, NPK, NIK, SID, jabatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter.departemen || ''}
          onChange={e => setFilter(f => ({ ...f, departemen: e.target.value || undefined }))}
          style={{ minWidth: 140 }}
        >
          <option value="">Semua Dept.</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filter.tipe_karyawan || ''}
          onChange={e => setFilter(f => ({ ...f, tipe_karyawan: e.target.value || undefined }))}
          style={{ minWidth: 130 }}
        >
          <option value="">Semua Tipe</option>
          {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.status_karyawan || ''}
          onChange={e => setFilter(f => ({ ...f, status_karyawan: e.target.value || undefined }))}
          style={{ minWidth: 130 }}
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {Object.keys(filter).length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilter({})}>✕ Reset Filter</button>
        )}
      </div>

      <div className="p-32">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SID / NPK</th>
                  <th>Nama</th>
                  <th>NIK</th>
                  <th>Jabatan</th>
                  <th>Departemen</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Tanggal Masuk</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="empty-icon">◈</div>
                        <div className="empty-text">Belum ada data karyawan</div>
                        <div className="empty-sub">Klik "Tambah Karyawan" untuk mulai</div>
                      </div>
                    </td>
                  </tr>
                ) : data.map(k => (
                  <tr key={k.id}>
                    <td>
                      <div className="td-mono" style={{ color: 'var(--text3)', fontSize: 11 }}>{k.sid || '—'}</div>
                      <div className="td-mono" style={{ fontSize: 12 }}>{k.npk || '—'}</div>
                    </td>
                    <td className="td-primary">{k.nama}</td>
                    <td className="td-mono">{k.nik || '—'}</td>
                    <td>{k.jabatan || '—'}</td>
                    <td>{k.departemen || '—'}</td>
                    <td><span className={`badge ${badgeTipe(k.tipe_karyawan)}`}>{k.tipe_karyawan}</span></td>
                    <td><span className={`badge ${badgeStatus(k.status_karyawan)}`}>{k.status_karyawan}</span></td>
                    <td className="td-mono">{k.tanggal_masuk || '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('karyawan-form', k.id)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(k)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.nama}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
