
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoanStatusBadge } from '../components/StatusBadge';
import { UserRole, ItemCategory, Loan, LoanStatus } from '../types';
import { FileText, X, Printer, Download, Filter, CornerDownLeft } from 'lucide-react';
import { PrintableLoanLetter } from '../components/PrintableLoanLetter';

export const History = () => {
  const { loans, currentUser } = useApp();
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [printState, setPrintState] = useState<{loan: Loan, type: 'LOAN' | 'RETURN'} | null>(null);

  // 1. Filter based on role
  let filteredLoans = currentUser?.role === UserRole.USER 
    ? loans.filter(l => l.user_id === currentUser.id)
    : loans;

  // 2. Filter based on Date Range
  if (startDate) {
    filteredLoans = filteredLoans.filter(l => l.tgl_pinjam >= startDate);
  }
  if (endDate) {
    filteredLoans = filteredLoans.filter(l => l.tgl_pinjam <= endDate);
  }

  const togglePrintMode = () => {
    setIsPrintMode(!isPrintMode);
    if (!isPrintMode) {
        setTimeout(() => {
            try { window.print(); } catch(e) { console.error("Print blocked"); }
        }, 500);
    }
  };

  const handleExportCSV = () => {
    if (filteredLoans.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["Kode Pinjam", "Nama Barang", "Kategori", "Peminjam", "Tgl Pinjam", "Tgl Kembali", "Tgl Dikembalikan", "Catatan", "Status", "Petugas"];
    
    const rows = filteredLoans.map(loan => {
      const timeSlot = loan.item_category === ItemCategory.GEDUNG 
        ? `${loan.jam_pinjam_mulai} - ${loan.jam_pinjam_selesai}` 
        : '-';
      
      return [
        loan.kd_pinjam,
        `"${loan.item_name}"`, // Quote strings with potential commas
        loan.item_category,
        `"${loan.user_name}"`,
        loan.tgl_pinjam,
        loan.tgl_kembali,
        loan.return_date_actual || '-',
        `"${loan.return_note || ''}"`,
        loan.status,
        loan.petugas_approver || '-'
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_BMN_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const InfoIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  );

  // Render individual letter if selected
  if (printState && currentUser) {
     return (
        <PrintableLoanLetter 
           loan={printState.loan} 
           onClose={() => setPrintState(null)} 
           currentUserRole={currentUser.role}
           type={printState.type}
        />
     );
  }

  if (isPrintMode) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-auto p-8 text-black font-serif">
        {/* Print Controls - Hidden in actual print */}
        <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white/90 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPrintMode(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 font-sans text-sm"
            >
              <X size={18} /> Tutup Preview
            </button>
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-sans">
              <InfoIcon size={16} /> 
              Jika dialog cetak tidak muncul, tekan <strong>Ctrl + P</strong>.
            </div>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-ati-600 text-white rounded-lg flex items-center gap-2 font-sans text-sm hover:bg-ati-700">
             <Printer size={18} /> Cetak Sekarang
          </button>
        </div>

        {/* Header Laporan (Kop Surat) */}
        <div className="mb-8 border-b-4 border-black pb-4">
          <div className="flex justify-center items-center gap-6 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Politeknik_ATI_Padang.png" className="w-24 h-24 object-contain" alt="Logo" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="text-center">
              <h1 className="text-3xl font-bold uppercase tracking-wider">Politeknik ATI Padang</h1>
              <h2 className="text-xl font-semibold mt-1">KEMENTERIAN PERINDUSTRIAN REPUBLIK INDONESIA</h2>
              <p className="text-sm mt-2">Jl. Bungo Pasang Tabing, Padang, Sumatera Barat. Telp (0751) 7055053</p>
              <p className="text-sm italic">Website: www.poltekatipdg.ac.id | Email: info@poltekatipdg.ac.id</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
            <h3 className="text-xl font-bold underline uppercase">Laporan Peminjaman BMN</h3>
            <p className="text-sm mt-1">
              Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
            </p>
        </div>

        {/* Content Table */}
        <div className="mb-8">
          <table className="w-full text-sm border-collapse border border-black">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black px-2 py-2 text-center w-12">No</th>
                <th className="border border-black px-3 py-2 text-left">Kode Pinjam</th>
                <th className="border border-black px-3 py-2 text-left">Nama Barang</th>
                <th className="border border-black px-3 py-2 text-left">Peminjam</th>
                <th className="border border-black px-3 py-2 text-center">Tgl Pinjam</th>
                <th className="border border-black px-3 py-2 text-center">Tgl Kembali</th>
                <th className="border border-black px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, idx) => (
                <tr key={loan.kd_pinjam} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-black px-2 py-2 text-center">{idx + 1}</td>
                  <td className="border border-black px-3 py-2 font-mono text-xs">{loan.kd_pinjam}</td>
                  <td className="border border-black px-3 py-2">
                    {loan.item_name}
                    {loan.item_category === ItemCategory.GEDUNG && (
                      <div className="text-[10px] italic">
                         Jam: {loan.jam_pinjam_mulai} - {loan.jam_pinjam_selesai}
                      </div>
                    )}
                  </td>
                  <td className="border border-black px-3 py-2">{loan.user_name}</td>
                  <td className="border border-black px-3 py-2 text-center">{loan.tgl_pinjam}</td>
                  <td className="border border-black px-3 py-2 text-center">
                     {loan.return_date_actual || loan.tgl_kembali}
                  </td>
                  <td className="border border-black px-3 py-2 text-center uppercase text-xs font-bold">{loan.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Signature */}
        <div className="flex justify-end mt-20 px-12 break-inside-avoid">
          <div className="text-center w-64">
            <p className="mb-24">Padang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold border-b border-black">{currentUser?.role === UserRole.ADMIN ? currentUser.name : '..........................'}</p>
            <p className="text-sm mt-1">{currentUser?.role === UserRole.ADMIN ? 'Petugas BMN' : 'Peminjam'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Riwayat</h1>
          <p className="text-slate-500">
            {currentUser?.role === UserRole.ADMIN ? 'Rekapitulasi data peminjaman BMN' : 'Daftar riwayat peminjaman saya'}
          </p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleExportCSV} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={togglePrintMode} 
            className="bg-ati-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ati-700 transition-colors shadow-sm text-sm"
          >
            <Printer size={18} /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap items-end gap-4">
          <div>
             <label className="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
             <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ati-500 outline-none"
             />
          </div>
          <div>
             <label className="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
             <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ati-500 outline-none"
             />
          </div>
          <div className="pb-0.5">
             <button 
               onClick={() => { setStartDate(''); setEndDate(''); }}
               className="text-sm text-slate-500 hover:text-ati-600 underline"
             >
                Reset Filter
             </button>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Kode Pinjam</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Detail Barang</th>
                {currentUser?.role === UserRole.ADMIN && <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Peminjam</th>}
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Jadwal</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Petugas</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan, idx) => (
                <tr key={loan.kd_pinjam} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="px-6 py-4 font-mono text-slate-500 font-medium">{loan.kd_pinjam}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{loan.item_name}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${loan.item_category === ItemCategory.GEDUNG ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {loan.item_category}
                    </span>
                    {loan.return_note && (
                        <div className="mt-1 text-xs text-slate-500 italic max-w-[200px] truncate">
                           "{loan.return_note}"
                        </div>
                    )}
                  </td>
                  {currentUser?.role === UserRole.ADMIN && (
                    <td className="px-6 py-4">
                        <div className="font-medium">{loan.user_name}</div>
                        <div className="text-xs text-slate-400">{loan.user_id}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-slate-600">Pinjam: <strong>{loan.tgl_pinjam}</strong></span>
                       {loan.item_category === ItemCategory.GEDUNG ? (
                          <span className="text-slate-600 text-xs bg-yellow-50 px-1 rounded inline-block w-fit">
                             Jam: {loan.jam_pinjam_mulai} - {loan.jam_pinjam_selesai}
                          </span>
                       ) : (
                          <span className="text-slate-600">Jatuh Tempo: <strong>{loan.tgl_kembali}</strong></span>
                       )}
                       {loan.return_date_actual && (
                           <span className="text-green-600 text-xs mt-1">Kembali: {loan.return_date_actual}</span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4"><LoanStatusBadge status={loan.status} /></td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{loan.petugas_approver || '-'}</td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-1">
                      {/* Button: Cetak Surat Peminjaman */}
                      {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.RETURNED) && (
                          <button 
                            onClick={() => setPrintState({loan, type: 'LOAN'})}
                            className="p-1.5 text-ati-600 hover:bg-ati-50 rounded border border-ati-200 shadow-sm"
                            title="Cetak Bukti Peminjaman"
                          >
                            <FileText size={16} />
                          </button>
                      )}

                      {/* Button: Cetak Surat Pengembalian */}
                      {loan.status === LoanStatus.RETURNED && (
                          <button 
                            onClick={() => setPrintState({loan, type: 'RETURN'})}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200 shadow-sm"
                            title="Cetak Bukti Pengembalian"
                          >
                            <CornerDownLeft size={16} />
                          </button>
                      )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLoans.length === 0 && <div className="p-12 text-center text-slate-400 bg-slate-50">Belum ada data riwayat untuk filter ini.</div>}
      </div>
    </div>
  );
};
