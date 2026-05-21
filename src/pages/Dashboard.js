import React, { useEffect, useState } from 'react';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    window.hris.karyawan.stats().then(setStats);
  }, []);

  if (!stats) return (
    <div style={{ padding: 32, color: 'var(--text3)', fontFamily: 'DM Mono', fontSize: 13 }}>
      Memuat data...
    </div>
  );

  const statCards = [
    { label: 'Total Karyawan', value: stats.total, meta: 'seluruh karyawan terdaftar', color: 'var(--accent)' },
    { label: 'Karyawan Aktif', value: stats.aktif, meta: `${stats.total - stats.aktif} tidak aktif`, color: 'var(--green)' },
    {
      label: 'Tetap',
      value: stats.byTipe.find(t => t.tipe_karyawan === 'Tetap')?.count || 0,
      meta: 'karyawan tetap',
      color: 'var(--accent2)',
    },
    {
      label: 'Kontrak',
      value: stats.byTipe.find(t => t.tipe_karyawan === 'Kontrak')?.count || 0,
      meta: 'karyawan kontrak',
      color: 'var(--amber)',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Ringkasan data karyawan perusahaan</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('karyawan-form')}>
          + Tambah Karyawan
        </button>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-meta">{s.meta}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* By Department */}
        <div className="card">
          <div className="form-section-title" style={{ marginBottom: 16 }}>Per Departemen</div>
          {stats.byDept.length === 0 ? (
            <div className="text-muted text-sm text-mono">Belum ada data departemen</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.byDept.map(d => {
                const pct = stats.total > 0 ? (d.count / stats.total) * 100 : 0;
                return (
                  <div key={d.departemen}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{d.departemen}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono' }}>{d.count}</span>
                    </div>
                    <div style={{ background: 'var(--bg4)', borderRadius: 4, height: 6 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 4,
                        background: 'var(--accent)', transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Mess & Gender */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="form-section-title" style={{ marginBottom: 16 }}>Mess / Non Mess</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {stats.byMess.map(m => (
                <div key={m.mess} style={{
                  flex: 1, background: 'var(--bg3)', borderRadius: 10,
                  padding: '14px', textAlign: 'center', border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: m.mess === 'Mess' ? 'var(--accent)' : 'var(--text2)' }}>
                    {m.count}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono', marginTop: 4 }}>
                    {m.mess || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="form-section-title" style={{ marginBottom: 16 }}>Jenis Kelamin</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {stats.byGender.map(g => (
                <div key={g.jenis_kelamin} style={{
                  flex: 1, background: 'var(--bg3)', borderRadius: 10,
                  padding: '14px', textAlign: 'center', border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: g.jenis_kelamin === 'Laki-laki' ? 'var(--accent2)' : 'var(--accent3)' }}>
                    {g.count}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono', marginTop: 4 }}>
                    {g.jenis_kelamin || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
