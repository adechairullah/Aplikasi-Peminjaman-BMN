
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoanStatus, ItemCategory, ItemCondition } from '../types';
import { Printer, Calendar, FileText, Info, X } from 'lucide-react';
import QRCode from "react-qr-code";

export const Report = () => {
  const { loans, letterConfig, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'LOAN' | 'RETURN'>('LOAN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Filter Logic
  let filteredLoans = loans;

  if (activeTab === 'LOAN') {
    // Show all approved or returned loans (History of borrowing)
    filteredLoans = loans.filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.RETURNED);
  } else {
    // Show only Returned loans
    filteredLoans = loans.filter(l => l.status === LoanStatus.RETURNED);
  }

  if (startDate) {
    filteredLoans = filteredLoans.filter(l => l.tgl_pinjam >= startDate);
  }
  if (endDate) {
    const compareDate = activeTab === 'RETURN' ? 'return_date_actual' : 'tgl_pinjam';
    filteredLoans = filteredLoans.filter(l => (l as any)[compareDate] <= endDate);
  }

  // Sort by date descending
  filteredLoans.sort((a, b) => b.tgl_pinjam.localeCompare(a.tgl_pinjam));

  const togglePrintMode = () => {
    setIsPrintMode(!isPrintMode);
    if (!isPrintMode) {
      setTimeout(() => {
        try { window.print(); } catch (e) { console.error("Print blocked"); }
      }, 500);
    }
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Generate a hash for the report itself
  const reportHash = `REPORT:${activeTab}:${startDate}:${endDate}:${new Date().toISOString()}`;

  const renderPrintView = () => (
    <div className="fixed inset-0 bg-white z-[9999] overflow-auto p-8 text-black font-serif">
      {/* Print Controls */}
      <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white/95 backdrop-blur shadow-sm p-4">
        <button 
          onClick={() => setIsPrintMode(false)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 font-sans text-sm"
        >
          <X size={18} /> Tutup
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-ati-600 text-white rounded-lg flex items-center gap-2 font-sans text-sm hover:bg-ati-700">
           <Printer size={18} /> Print
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto min-h-[297mm] relative bg-white">
        {/* KOP SURAT */}
        <div className="flex items-center gap-4 border-b-4 border-black pb-4 mb-8 pr-4">
          <img 
            src={letterConfig.logoUrl} 
            alt="Logo" 
            style={{ width: `${letterConfig.logoSize}px`, height: 'auto', objectFit: 'contain' }}
            onError={(e) => e.currentTarget.style.display='none'}
          />
          <div className="flex-1 text-center">
            <h1 style={{ fontSize: `${letterConfig.headerMinistryFontSize}px` }} className="font-bold uppercase tracking-wider font-sans leading-tight">
              {letterConfig.ministryName}
            </h1>
            <h2 style={{ fontSize: `${letterConfig.headerInstitutionFontSize}px` }} className="font-extrabold uppercase tracking-wide font-sans text-black leading-tight">
              {letterConfig.institutionName}
            </h2>
            <p style={{ fontSize: `${letterConfig.headerAddressFontSize}px` }} className="font-sans mt-1">
              {letterConfig.address}
            </p>
            <p style={{ fontSize: `${letterConfig.headerAddressFontSize}px` }} className="font-sans italic">
              {letterConfig.contactInfo}
            </p>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold underline uppercase tracking-wider mb-2">
            Laporan Rekapitulasi - {activeTab === 'LOAN' ? 'PEMINJAMAN' : 'PENGEMBALIAN'}
          </h3>
          <p className="text-sm">
            Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
          </p>
        </div>

        {/* TABEL DATA */}
        <table className="w-full border-collapse border border-black text-sm mb-8">
          <thead>
            <tr className="bg-slate-200">
              <th className="border border-black px-2 py-2 text-center w-10">No</th>
              <th className="border border-black px-2 py-2 text-left">Kode</th>
              <th className="border border-black px-2 py-2 text-left">Peminjam (ID)</th>
              <th className="border border-black px-2 py-2 text-left">Nama Barang</th>
              <th className="border border-black px-2 py-2 text-center">Jml</th>
              <th className="border border-black px-2 py-2 text-center">Tgl Pinjam</th>
              {activeTab === 'LOAN' && <th className="border border-black px-2 py-2 text-center">Jatuh Tempo</th>}
              {activeTab === 'RETURN' && <th className="border border-black px-2 py-2 text-center">Tgl Kembali</th>}
              {activeTab === 'RETURN' && <th className="border border-black px-2 py-2 text-center">Kondisi</th>}
              <th className="border border-black px-2 py-2 text-center">Ket</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan, idx) => (
              <tr key={loan.kd_pinjam}>
                <td className="border border-black px-2 py-2 text-center">{idx + 1}</td>
                <td className="border border-black px-2 py-2 font-mono text-xs">{loan.kd_pinjam}</td>
                <td className="border border-black px-2 py-2">
                  <div className="font-bold">{loan.user_name}</div>
                  <div className="text-xs">{loan.user_id}</div>
                </td>
                <td className="border border-black px-2 py-2">
                  {loan.item_name}
                  <div className="text-xs italic">{loan.item_category}</div>
                </td>
                <td className="border border-black px-2 py-2 text-center">{loan.jml_pinjam}</td>
                <td className="border border-black px-2 py-2 text-center">{loan.tgl_pinjam}</td>
                
                {activeTab === 'LOAN' && (
                  <td className="border border-black px-2 py-2 text-center">{loan.tgl_kembali}</td>
                )}
                
                {activeTab === 'RETURN' && (
                  <>
                    <td className="border border-black px-2 py-2 text-center">{loan.return_date_actual}</td>
                    <td className="border border-black px-2 py-2 text-center">
                       {loan.return_condition === ItemCondition.BAIK ? 'Baik' : 'Rusak'}
                    </td>
                  </>
                )}
                
                <td className="border border-black px-2 py-2 text-xs">
                   {loan.item_category === ItemCategory.GEDUNG 
                      ? `${loan.jam_pinjam_mulai}-${loan.jam_pinjam_selesai}` 
                      : (activeTab === 'RETURN' ? loan.return_note : loan.status)
                   }
                </td>
              </tr>
            ))}
            {filteredLoans.length === 0 && (
              <tr>
                <td colSpan={activeTab === 'LOAN' ? 8 : 9} className="border border-black px-4 py-8 text-center italic">
                   -- Tidak ada data --
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PENUTUP & TTD DIGITAL */}
        <div className="mt-8 break-inside-avoid">
          <p className="mb-8 text-justify">
            Demikian laporan rekapitulasi ini dibuat dengan sebenar-benarnya berdasarkan data transaksi pada Sistem Informasi Peminjaman BMN Politeknik ATI Padang untuk dapat dipergunakan sebagaimana mestinya.
          </p>

          <div className="flex justify-end px-8">
            <div className="text-center w-64">
              <p className="mb-1">Padang, {currentDateStr}</p>
              <p className="font-bold mb-4">Petugas BMN / Pengelola Aset</p>
              
              {/* Digital Signature QR */}
              <div className="flex justify-center mb-4">
                 <div className="p-2 border border-slate-300 bg-white">
                    <QRCode value={reportHash} size={90} />
                 </div>
              </div>
              
              <p className="font-bold underline uppercase">{currentUser?.name}</p>
              <p className="text-sm">NIP. {currentUser?.nobp_nip || '...........................'}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">Digital Sign Valid</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  if (isPrintMode) return renderPrintView();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Rekapitulasi</h1>
        <p className="text-slate-500">Cetak laporan formal aktivitas peminjaman</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('LOAN')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'LOAN' ? 'text-ati-600 border-ati-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Laporan Peminjaman
          </button>
          <button
            onClick={() => setActiveTab('RETURN')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'RETURN' ? 'text-ati-600 border-ati-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Laporan Pengembalian
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
               <Calendar size={12} /> Dari Tanggal
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
               <Calendar size={12} /> Sampai Tanggal
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 text-right">
             <button 
                onClick={togglePrintMode}
                disabled={filteredLoans.length === 0}
                className="bg-ati-600 text-white px-6 py-2.5 rounded-lg hover:bg-ati-700 transition-colors shadow-sm inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Printer size={18} /> 
                Cetak Laporan
             </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
           <h3 className="font-bold text-slate-700">Preview Data ({filteredLoans.length} items)</h3>
           <div className="text-xs text-slate-500">Preview</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-700">Kode</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Peminjam</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Barang</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Tgl Pinjam</th>
                <th className="px-6 py-3 font-semibold text-slate-700">
                   {activeTab === 'LOAN' ? 'Jatuh Tempo' : 'Tgl Kembali'}
                </th>
                <th className="px-6 py-3 font-semibold text-slate-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.kd_pinjam} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-slate-500">{loan.kd_pinjam}</td>
                  <td className="px-6 py-3">{loan.user_name}</td>
                  <td className="px-6 py-3">{loan.item_name}</td>
                  <td className="px-6 py-3">{loan.tgl_pinjam}</td>
                  <td className="px-6 py-3">
                    {activeTab === 'LOAN' ? loan.tgl_kembali : loan.return_date_actual}
                  </td>
                  <td className="px-6 py-3 text-right">
                     <span className={`text-xs px-2 py-1 rounded font-bold ${
                        loan.status === LoanStatus.RETURNED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                        {loan.status}
                     </span>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                       <FileText size={48} className="mx-auto mb-2 opacity-20" />
                       Tidak ada data.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
