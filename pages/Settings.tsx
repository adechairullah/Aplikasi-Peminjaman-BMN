import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, RefreshCw, FileText, Image as ImageIcon, CornerDownLeft, Hash, Type, Database } from 'lucide-react';

export const Settings = () => {
  const { letterConfig, updateLetterConfig, seedDatabase } = useApp();
  const [formData, setFormData] = useState(letterConfig);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' || e.target.type === 'range' ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLetterConfig(formData);
    alert('Pengaturan surat berhasil disimpan!');
  };

  const handleReset = () => {
    if(confirm('Kembalikan ke pengaturan default?')) {
       setFormData({
        ministryName: 'Kementerian Perindustrian Republik Indonesia',
        institutionName: 'Politeknik ATI Padang',
        address: 'Jl. Bungo Pasang Tabing, Padang, Sumatera Barat. Telp (0751) 7055053',
        contactInfo: 'Website: www.poltekatipdg.ac.id | Email: info@poltekatipdg.ac.id',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Politeknik_ATI_Padang.png',
        
        // Defaults
        headerMinistryFontSize: 16,
        headerInstitutionFontSize: 24,
        headerAddressFontSize: 13,
        logoSize: 100,

        loanLetterNumberFormat: '[ID]/BA-PINJAM/ATI/[BLN]/[THN]',
        returnLetterNumberFormat: '[ID]/BA-KEMBALI/ATI/[BLN]/[THN]',

        bodyHeader: 'BERITA ACARA PEMINJAMAN BMN',
        bodyOpening: 'Pada hari ini, kami yang bertanda tangan di bawah ini:',
        bodyClosing: 'Demikian Berita Acara Peminjaman ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.',

        returnBodyHeader: 'BERITA ACARA PENGEMBALIAN BMN',
        returnBodyOpening: 'Pada hari ini, telah dilakukan pengembalian Barang Milik Negara (BMN) dengan rincian sebagai berikut:',
        returnBodyClosing: 'Barang tersebut telah diperiksa kondisinya dan dikembalikan kepada Unit Pengelola BMN. Demikian Berita Acara Pengembalian ini dibuat dengan sebenar-benarnya.'
       });
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
           <p className="text-slate-500">Konfigurasi Kop Surat dan Logo Laporan</p>
        </div>
        
        {/* Helper Button to populate Firebase */}
        <button 
           onClick={seedDatabase} 
           className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
           <Database size={16} /> Seed Database
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Left Column: Kop Surat & Numbering */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="text-ati-600" /> Identitas Instansi (Kop Surat)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kementerian / Yayasan</label>
                <input 
                  type="text" 
                  name="ministryName"
                  value={formData.ministryName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Institusi</label>
                <input 
                  type="text" 
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kontak (Telp/Email/Web)</label>
                <input 
                  type="text" 
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Header Appearance Config */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
               <Type className="text-orange-500" /> Tampilan Header
            </h3>
            <div className="space-y-5">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <label className="text-slate-700">Ukuran Font Kementerian</label>
                     <span className="font-bold">{formData.headerMinistryFontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="headerMinistryFontSize"
                    min="10" max="32"
                    value={formData.headerMinistryFontSize}
                    onChange={handleChange}
                    className="w-full accent-ati-600"
                  />
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <label className="text-slate-700">Ukuran Font Institusi</label>
                     <span className="font-bold">{formData.headerInstitutionFontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="headerInstitutionFontSize"
                    min="14" max="48"
                    value={formData.headerInstitutionFontSize}
                    onChange={handleChange}
                    className="w-full accent-ati-600"
                  />
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <label className="text-slate-700">Ukuran Font Alamat</label>
                     <span className="font-bold">{formData.headerAddressFontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="headerAddressFontSize"
                    min="8" max="20"
                    value={formData.headerAddressFontSize}
                    onChange={handleChange}
                    className="w-full accent-ati-600"
                  />
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <label className="text-slate-700">Ukuran Logo (Width)</label>
                     <span className="font-bold">{formData.logoSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="logoSize"
                    min="40" max="200"
                    value={formData.logoSize}
                    onChange={handleChange}
                    className="w-full accent-ati-600"
                  />
               </div>
            </div>
          </div>

           {/* Numbering Config */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Hash className="text-purple-600" /> Format Nomor Surat
            </h3>
            
            <div className="mb-4 bg-purple-50 p-3 rounded-lg text-xs text-purple-800 border border-purple-100">
              <p className="font-semibold mb-1">Legend (Kode Otomatis):</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>[ID]</code> : Kode Peminjaman (misal: P1234)</li>
                <li><code>[BLN]</code> : Bulan Romawi saat ini (misal: XI)</li>
                <li><code>[THN]</code> : Tahun saat ini (misal: 2023)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Format No. Surat Peminjaman</label>
                <input 
                  type="text" 
                  name="loanLetterNumberFormat"
                  value={formData.loanLetterNumberFormat}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  placeholder="[ID]/BA-PINJAM/[BLN]/[THN]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Format No. Surat Pengembalian</label>
                <input 
                  type="text" 
                  name="returnLetterNumberFormat"
                  value={formData.returnLetterNumberFormat}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  placeholder="[ID]/BA-KEMBALI/[BLN]/[THN]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon className="text-ati-600" /> Logo Instansi
             </h3>
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL Logo</label>
                  <input 
                    type="text" 
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm text-slate-600"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Masukkan URL gambar logo yang valid.</p>
               </div>
               
               <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-center h-32">
                  <img 
                    src={formData.logoUrl} 
                    alt="Preview Logo" 
                    style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                    onError={(e) => e.currentTarget.style.display='none'}
                  />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Letter Content */}
        <div className="space-y-6">
           {/* Loan Letter */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
               <FileText className="text-blue-600" /> Template Surat Peminjaman
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Surat</label>
                <input 
                  type="text" 
                  name="bodyHeader"
                  value={formData.bodyHeader}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paragraf Pembuka</label>
                <textarea 
                  name="bodyOpening"
                  value={formData.bodyOpening}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paragraf Penutup</label>
                <textarea 
                  name="bodyClosing"
                  value={formData.bodyClosing}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Return Letter */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
               <CornerDownLeft className="text-green-600" /> Template Surat Pengembalian
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Surat</label>
                <input 
                  type="text" 
                  name="returnBodyHeader"
                  value={formData.returnBodyHeader}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paragraf Pembuka</label>
                <textarea 
                  name="returnBodyOpening"
                  value={formData.returnBodyOpening}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paragraf Penutup</label>
                <textarea 
                  name="returnBodyClosing"
                  value={formData.returnBodyClosing}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button 
               type="button" 
               onClick={handleReset}
               className="flex-1 py-3 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 flex justify-center items-center gap-2"
             >
               <RefreshCw size={18} /> Reset Default
             </button>
             <button 
               type="submit"
               className="flex-1 py-3 bg-ati-600 hover:bg-ati-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-md"
             >
               <Save size={18} /> Simpan Pengaturan
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};