import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import KaryawanList from './pages/KaryawanList';
import KaryawanForm from './pages/KaryawanForm';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [editId, setEditId] = useState(null);

  const navigate = (p, id = null) => {
    setEditId(id);
    setPage(p);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
    { id: 'karyawan', label: 'Karyawan', icon: '◈' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◈</span>
          <div>
            <div className="brand-name">HRIS</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id || (page === 'karyawan-form' && item.id === 'karyawan') ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="nav-section-label">Segera Hadir</div>
          {['MCU', 'Kompetensi', 'Invoice'].map(m => (
            <button key={m} className="nav-item disabled" disabled>
              <span className="nav-icon">○</span>
              <span>{m}</span>
              <span className="nav-badge">Soon</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">v1.0.0</div>
      </aside>

      <main className="main-content">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'karyawan' && <KaryawanList onNavigate={navigate} />}
        {page === 'karyawan-form' && (
          <KaryawanForm
            editId={editId}
            onSave={() => navigate('karyawan')}
            onCancel={() => navigate('karyawan')}
          />
        )}
      </main>
    </div>
  );
}
