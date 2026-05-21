import React, { useEffect, useState } from 'react';

const EMPTY = {
  sid: '', npk: '', nik: '', nama: '', jenis_kelamin: '', tempat_lahir: '', tanggal_lahir: '',
  alamat: '', rt: '', rw: '', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '',
  negara: 'Indonesia', kode_pos: '', no_hp: '', email: '',
  kontak_emergency_nama: '', kontak_emergency_hp: '', kontak_emergency_hubungan: '',
  mess: 'Non Mess', status_perkawinan: '', pendidikan_terakhir: '', jurusan: '',
  jumlah_anak: 0, perusahaan_sebelumnya: '', jabatan_sebelumnya: '', tanggal_keluar_sebelumnya: '',
  ukuran_baju: '', ukuran_celana: '',
  jabatan: '', departemen: '', status_karyawan: 'Aktif', tipe_karyawan: 'Tetap', tanggal_masuk: '',
};

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

function FieldSpan({ label, span = 1, children }) {
  return (
    <div className={`form-group ${span === 2 ? 'span-2' : span === 3 ? 'span-3' : ''}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function KaryawanForm({ editId, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editId) {
      window.hris.karyawan.getOne(editId).then(data => {
        if (data) setForm({ ...EMPTY, ...data });
      });
    }
  }, [editId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nama.trim()) { setError('Nama karyawan wajib diisi.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      if (editId) {
        await window.hris.karyawan.update({ id: editId, ...payload });
      } else {
        await window.hris.karyawan.create(payload);
      }
      onSave();
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const inp = (k, extra = {}) => (
    <input value={form[k] ?? ''} onChange={e => set(k, e.target.value)} {...extra} />
  );

  const sel = (k, opts, placeholder = '— Pilih —') => (
    <select value={form[k] ?? ''} onChange={e => set(k, e.target.value)}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{editId ? 'Edit Karyawan' : 'Tambah Karyawan'}</h1>
          <p className="page-sub">{editId ? `ID: ${editId}` : 'Mengisi data karyawan baru'}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah Karyawan')}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ margin: '12px 32px', padding: '12px 16px', borderRadius: 10, background: 'rgba(247,94,135,0.1)', border: '1px solid rgba(247,94,135,0.25)', color: 'var(--accent3)', fontSize: 13 }}>
          ✕ {error}
        </div>
      )}

      <div style={{ padding: '20px 32px 40px' }}>
        {/* Identitas Perusahaan */}
        <div className="form-section">
          <div className="form-section-title">Identitas Perusahaan</div>
          <div className="form-grid">
            <Field label="SID">{inp('sid', { placeholder: 'SID karyawan' })}</Field>
            <Field label="NPK">{inp('npk', { placeholder: 'Nomor Pokok Karyawan' })}</Field>
            <Field label="NIK">{inp('nik', { placeholder: '16 digit NIK' })}</Field>
            <Field label="Jabatan">{inp('jabatan', { placeholder: 'Posisi/jabatan' })}</Field>
            <Field label="Departemen">{inp('departemen', { placeholder: 'Nama departemen' })}</Field>
            <Field label="Tipe Karyawan">{sel('tipe_karyawan', ['Tetap', 'Kontrak', 'Magang', 'PKWTT'])}</Field>
            <Field label="Status Karyawan">{sel('status_karyawan', ['Aktif', 'Tidak Aktif', 'Resign', 'PHK'])}</Field>
            <Field label="Tanggal Masuk">{inp('tanggal_masuk', { type: 'date' })}</Field>
          </div>
        </div>

        {/* Data Diri */}
        <div className="form-section">
          <div className="form-section-title">Data Diri</div>
          <div className="form-grid">
            <FieldSpan label="Nama Lengkap" span={2}>
              {inp('nama', { placeholder: 'Nama lengkap sesuai KTP' })}
            </FieldSpan>
            <Field label="Jenis Kelamin">{sel('jenis_kelamin', ['Laki-laki', 'Perempuan'])}</Field>
            <Field label="Tempat Lahir">{inp('tempat_lahir', { placeholder: 'Kota tempat lahir' })}</Field>
            <Field label="Tanggal Lahir">{inp('tanggal_lahir', { type: 'date' })}</Field>
            <Field label="Status Perkawinan">{sel('status_perkawinan', ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'])}</Field>
            <Field label="Jumlah Anak">
              <input type="number" min={0} value={form.jumlah_anak} onChange={e => set('jumlah_anak', +e.target.value)} />
            </Field>
            <Field label="Mess / Non Mess">{sel('mess', ['Mess', 'Non Mess'])}</Field>
          </div>
        </div>

        {/* Alamat */}
        <div className="form-section">
          <div className="form-section-title">Alamat</div>
          <div className="form-grid">
            <FieldSpan label="Alamat Lengkap" span={3}>
              <textarea value={form.alamat} onChange={e => set('alamat', e.target.value)} placeholder="Jalan, nomor rumah, dll." style={{ minHeight: 60 }} />
            </FieldSpan>
            <Field label="RT">{inp('rt', { placeholder: '001' })}</Field>
            <Field label="RW">{inp('rw', { placeholder: '002' })}</Field>
            <Field label="Kode Pos">{inp('kode_pos', { placeholder: '00000' })}</Field>
            <Field label="Kelurahan">{inp('kelurahan')}</Field>
            <Field label="Kecamatan">{inp('kecamatan')}</Field>
            <Field label="Kabupaten / Kota">{inp('kabupaten')}</Field>
            <Field label="Provinsi">{inp('provinsi')}</Field>
            <Field label="Negara">{inp('negara')}</Field>
          </div>
        </div>

        {/* Kontak */}
        <div className="form-section">
          <div className="form-section-title">Kontak</div>
          <div className="form-grid">
            <Field label="No. HP">{inp('no_hp', { placeholder: '08xxxxxxxxxx' })}</Field>
            <FieldSpan label="Email" span={2}>{inp('email', { type: 'email', placeholder: 'email@domain.com' })}</FieldSpan>
            <Field label="Nama Kontak Emergency">{inp('kontak_emergency_nama', { placeholder: 'Nama lengkap' })}</Field>
            <Field label="No. HP Kontak Emergency">{inp('kontak_emergency_hp', { placeholder: '08xxxxxxxxxx' })}</Field>
            <Field label="Hubungan">{sel('kontak_emergency_hubungan', ['Ayah', 'Ibu', 'Suami', 'Istri', 'Kakak', 'Adik', 'Anak', 'Saudara', 'Lainnya'])}</Field>
          </div>
        </div>

        {/* Pendidikan */}
        <div className="form-section">
          <div className="form-section-title">Pendidikan</div>
          <div className="form-grid form-grid-2">
            <Field label="Pendidikan Terakhir">
              {sel('pendidikan_terakhir', ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'])}
            </Field>
            <Field label="Jurusan / Program Studi">{inp('jurusan', { placeholder: 'Teknik Informatika, dll.' })}</Field>
          </div>
        </div>

        {/* Riwayat Pekerjaan */}
        <div className="form-section">
          <div className="form-section-title">Riwayat Pekerjaan Sebelumnya</div>
          <div className="form-grid">
            <FieldSpan label="Perusahaan Sebelumnya" span={2}>
              {inp('perusahaan_sebelumnya', { placeholder: 'Nama perusahaan' })}
            </FieldSpan>
            <Field label="Jabatan di Perusahaan Sebelumnya">
              {inp('jabatan_sebelumnya', { placeholder: 'Posisi terakhir' })}
            </Field>
            <Field label="Tanggal Keluar">
              {inp('tanggal_keluar_sebelumnya', { type: 'date' })}
            </Field>
          </div>
        </div>

        {/* Lainnya */}
        <div className="form-section">
          <div className="form-section-title">Informasi Lainnya</div>
          <div className="form-grid form-grid-2">
            <Field label="Ukuran Baju">{sel('ukuran_baju', ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'])}</Field>
            <Field label="Ukuran Celana">{inp('ukuran_celana', { placeholder: 'Contoh: 30, 32, 34' })}</Field>
          </div>
        </div>
      </div>
    </div>
  );
}
