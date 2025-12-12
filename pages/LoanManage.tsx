
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoanStatus, ItemCondition, ItemCategory, Loan } from '../types';
import { Check, X, CornerDownLeft, AlertCircle, Clock, Calendar, User, CheckSquare, FileText, Printer } from 'lucide-react';
import { LoanStatusBadge, ConditionBadge } from '../components/StatusBadge';
import { PrintableLoanLetter } from '../components/PrintableLoanLetter';

export const LoanManage = () => {
  const { loans, approveLoan, rejectLoan, returnLoan, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  
  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [returnCondition, setReturnCondition] = useState<ItemCondition>(ItemCondition.BAIK);
  const [returnNote, setReturnNote] = useState('');

  // Letter Print State
  const [printState, setPrintState] = useState<{loan: Loan, type: 'LOAN' | 'RETURN'} | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);
  const historyLoans = loans.filter(l => l.status !== LoanStatus.PENDING);

  // Filter history to show active loans first
  const activeLoans = historyLoans.filter(l => l.status === LoanStatus.APPROVED).sort((a,b) => a.tgl_kembali.localeCompare(b.tgl_kembali));
  const finishedLoans = historyLoans.filter(l => l.status !== LoanStatus.APPROVED);
  const displayHistory = [...activeLoans, ...finishedLoans];

  const handleOpenReturnModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setReturnCondition(ItemCondition.BAIK);
    setReturnNote('');
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLoan) {
        returnLoan(selectedLoan.kd_pinjam, returnCondition, returnNote);
        setIsReturnModalOpen(false);
        setSelectedLoan(null);
    }
  };

  const isEarlyReturn = selectedLoan ? today < selectedLoan.tgl_kembali : false;

  // If a loan is selected for printing, render the letter component in full screen
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Persetujuan & Pengembalian</h1>
        <p className="text-slate-500">Manajemen sirkulasi peminjaman aset</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'PENDING' 
              ? 'text-ati-600 border-b-2 border-ati-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Menunggu Persetujuan
          {pendingLoans.length > 0 && (
             <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingLoans.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'HISTORY' 
              ? 'text-ati-600 border-b-2 border-ati-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Riwayat & Pengembalian
        </button>
      </div>

      {/* Content */}
      {activeTab === 'PENDING' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingLoans.map(loan => (
              <div key={loan.kd_pinjam} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col relative overflow-hidden group hover:border-ati-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                
                <div className="flex justify-between items-start mb-4 pl-3">
                   <div>
                      <span className="text-xs font-mono text-slate-400">#{loan.kd_pinjam}</span>
                      <h3 className="font-bold text-slate-800 text-lg">{loan.item_name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{loan.item_category}</span>
                   </div>
                   <div className="text-right">
                      {loan.item_category !== ItemCategory.GEDUNG && (
                         <div className="text-xl font-bold text-ati-600">{loan.jml_pinjam} <span className="text-xs font-normal text-slate-400">Unit</span></div>
                      )}
                   </div>
                </div>

                <div className="space-y-3 mb-6 pl-3 flex-1">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={16} className="text-slate-400" />
                      <span className="font-medium">{loan.user_name}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{loan.tgl_pinjam} - {loan.tgl_kembali}</span>
                   </div>
                   {loan.item_category === ItemCategory.GEDUNG && loan.jam_pinjam_mulai && (
                       <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={16} className="text-slate-400" />
                          <span className="bg-yellow-50 text-yellow-700 px-1 rounded">{loan.jam_pinjam_mulai} - {loan.jam_pinjam_selesai}</span>
                       </div>
                   )}
                </div>

                <div className="flex gap-2 pl-3 pt-4 border-t border-slate-50">
                   <button 
                      onClick={() => rejectLoan(loan.kd_pinjam)}
                      className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                   >
                      Tolak
                   </button>
                   <button 
                      onClick={() => approveLoan(loan.kd_pinjam)}
                      className="flex-1 py-2 text-white bg-ati-600 hover:bg-ati-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                   >
                      Setujui
                   </button>
                </div>
              </div>
            ))}
            {pendingLoans.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                   <Check size={48} className="text-slate-300 mb-2" />
                   <p>Tidak ada pengajuan baru.</p>
                </div>
            )}
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700">Kode</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Peminjam</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Barang</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Detail Waktu</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Status & Kondisi</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayHistory.map(loan => {
                    const isOverdue = loan.status === LoanStatus.APPROVED && loan.tgl_kembali < today;
                    return (
                        <tr key={loan.kd_pinjam} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                        <td className="px-6 py-4 font-mono text-slate-500">{loan.kd_pinjam}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{loan.user_name}</td>
                        <td className="px-6 py-4">
                            <div className="text-slate-800">{loan.item_name}</div>
                            <div className="text-xs text-slate-500">{loan.item_category}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex flex-col">
                                <span>{loan.tgl_pinjam} / {loan.tgl_kembali}</span>
                                {isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-100 w-fit px-1 rounded mt-1">LATE</span>}
                            </div>
                            {loan.item_category === ItemCategory.GEDUNG && loan.jam_pinjam_mulai && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock size={12}/> {loan.jam_pinjam_mulai} - {loan.jam_pinjam_selesai}
                            </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-2 items-start">
                            <LoanStatusBadge status={loan.status} />
                            {loan.status === LoanStatus.RETURNED && loan.return_condition && (
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-slate-400">Cond:</span>
                                    <ConditionBadge condition={loan.return_condition} />
                                </div>
                            )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            {/* Action: Return */}
                            {loan.status === LoanStatus.APPROVED && (
                            <button 
                                onClick={() => handleOpenReturnModal(loan)}
                                className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-md hover:bg-green-50 inline-flex items-center gap-1 text-xs font-semibold shadow-sm w-full justify-center"
                            >
                                <CornerDownLeft size={14} /> 
                                Kembalikan
                            </button>
                            )}

                            {/* Action: Print Loan Letter - Available for Approved AND Returned */}
                            {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.RETURNED) && (
                               <button 
                                 onClick={() => setPrintState({loan, type: 'LOAN'})}
                                 className="px-3 py-1.5 bg-ati-50 border border-ati-200 text-ati-700 rounded-md hover:bg-ati-100 inline-flex items-center gap-1 text-xs font-semibold shadow-sm w-full justify-center"
                               >
                                 <FileText size={14} /> Bukti Pinjam
                               </button>
                            )}

                            {/* Action: Print Return Letter - Only for Returned */}
                            {loan.status === LoanStatus.RETURNED && (
                              <button 
                                 onClick={() => setPrintState({loan, type: 'RETURN'})}
                                 className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100 inline-flex items-center gap-1 text-xs font-semibold shadow-sm w-full justify-center"
                               >
                                 <Printer size={14} /> Bukti Kembali
                               </button>
                            )}
                          </div>
                        </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <CheckSquare className="text-ati-600" />
                        Konfirmasi Pengembalian
                    </h3>
                    <p className="text-sm text-slate-500">{selectedLoan.item_name}</p>
                 </div>
                 <form onSubmit={handleSubmitReturn} className="p-6">
                    {/* Early Return Notice */}
                    {isEarlyReturn && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                             <Clock size={16} className="mt-0.5 shrink-0" />
                             <p><strong>Pengembalian Lebih Awal.</strong> <br/>Jatuh Tempo: {selectedLoan.tgl_kembali}. Harap isi catatan.</p>
                        </div>
                    )}
                    
                    {/* Late Notice */}
                    {selectedLoan.tgl_kembali < today && (
                         <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <p><strong>Terlambat!</strong> <br/>Jatuh Tempo: {selectedLoan.tgl_kembali}.</p>
                       </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kondisi Barang</label>
                        <select 
                            className="w-full border rounded-lg px-3 py-2"
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value as ItemCondition)}
                        >
                            <option value={ItemCondition.BAIK}>Baik</option>
                            <option value={ItemCondition.RUSAK}>Rusak</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Catatan {isEarlyReturn && <span className="text-red-500">*</span>}
                        </label>
                        <textarea 
                            className="w-full border rounded-lg px-3 py-2"
                            rows={3}
                            placeholder="..."
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            required={isEarlyReturn}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                        <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-ati-600 text-white rounded-lg hover:bg-ati-700 flex items-center gap-2">
                           <Check size={18} /> Simpan
                        </button>
                    </div>
                 </form>
              </div>
          </div>
      )}
    </div>
  );
};
