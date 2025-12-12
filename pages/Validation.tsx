
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShieldCheck, AlertTriangle, CheckCircle, XCircle, QrCode } from 'lucide-react';

export const Validation = () => {
  const { loans, generateDocHash } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    loan?: any;
    hashType?: 'LOAN' | 'RETURN';
  } | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationResult(null);

    if (!inputCode) return;

    // Try to decode base64 first to see if it's our standard Hash
    try {
      const decoded = atob(inputCode);
      const parts = decoded.split('|');
      
      // Expected Format: TYPE|LOAN_ID|USER_ID|DATE|STATUS
      if (parts.length === 5) {
        const [type, loanId, userId, date, status] = parts;
        
        const loan = loans.find(l => l.kd_pinjam === loanId);
        
        if (!loan) {
           setValidationResult({ isValid: false, message: 'Data Peminjaman tidak ditemukan di database.' });
           return;
        }

        // Reconstruct hash to verify integrity
        const currentHash = generateDocHash(loan, type as 'LOAN' | 'RETURN');
        
        if (currentHash === inputCode) {
           setValidationResult({ isValid: true, message: 'Dokumen VALID dan Sesuai Database.', loan, hashType: type as any });
        } else {
           // Hash mismatch means status changed or data tampered
           setValidationResult({ 
             isValid: false, 
             message: `Dokumen Kadaluarsa atau Tidak Valid. Status Database: ${loan.status}`, 
             loan 
           });
        }
        return;
      }
    } catch (e) {
      // Not a base64 string, maybe just a Loan ID
    }

    // Fallback: Try searching by Loan ID directly
    const loan = loans.find(l => l.kd_pinjam === inputCode);
    if (loan) {
      setValidationResult({ 
          isValid: true, 
          message: 'Data ditemukan (Pencarian Manual ID).', 
          loan 
      });
    } else {
      setValidationResult({ isValid: false, message: 'Kode Hash atau ID Peminjaman tidak dikenali.' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Validasi Dokumen</h1>
        <p className="text-slate-500">Verifikasi keaslian surat peminjaman dan tanda tangan digital</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
            <div className="w-20 h-20 bg-blue-50 text-ati-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode size={40} />
            </div>
            
            <h2 className="text-xl font-bold mb-2">Scan atau Input Kode</h2>
            <p className="text-slate-500 mb-6 text-sm">
                Masukkan kode Hash yang tertera pada bagian bawah dokumen atau scan QR Code validasi.
            </p>

            <form onSubmit={handleValidate} className="relative max-w-lg mx-auto mb-8">
                <input 
                    type="text" 
                    className="w-full pl-4 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-ati-500 focus:outline-none font-mono text-center"
                    placeholder="Paste Hash Code / Loan ID here..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />
                <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-ati-600 text-white px-4 rounded-lg hover:bg-ati-700 transition-colors"
                >
                    <Search size={20} />
                </button>
            </form>

            {/* RESULT AREA */}
            {validationResult && (
                <div className={`mt-8 p-6 rounded-xl border-l-4 text-left animate-in fade-in slide-in-from-bottom-4 ${
                    validationResult.isValid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${validationResult.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {validationResult.isValid ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                                {validationResult.message}
                            </h3>
                            
                            {validationResult.loan && (
                                <div className="mt-4 bg-white/60 p-4 rounded-lg text-sm border border-black/5">
                                    <div className="grid grid-cols-2 gap-y-2">
                                        <span className="text-slate-500">Kode Pinjam:</span>
                                        <span className="font-mono font-bold">{validationResult.loan.kd_pinjam}</span>

                                        <span className="text-slate-500">Peminjam:</span>
                                        <span className="font-medium">{validationResult.loan.user_name}</span>

                                        <span className="text-slate-500">Barang:</span>
                                        <span>{validationResult.loan.item_name}</span>

                                        <span className="text-slate-500">Status Saat Ini:</span>
                                        <span className="font-bold uppercase">{validationResult.loan.status}</span>

                                        <span className="text-slate-500">Tgl Pinjam:</span>
                                        <span>{validationResult.loan.tgl_pinjam}</span>

                                        <span className="text-slate-500">Jenis Dokumen:</span>
                                        <span>{validationResult.hashType || 'Unknown'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
