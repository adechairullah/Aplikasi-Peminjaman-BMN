
import React, { useEffect } from 'react';
import { Loan, UserRole, LoanStatus, ItemCondition } from '../types';
import { X, Printer, Info, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRCode from "react-qr-code";
import { ItemCondition as ItemConditionEnum } from '../types'; // Fix for missing import

interface PrintableLoanLetterProps {
  loan: Loan;
  onClose: () => void;
  currentUserRole: UserRole;
  type?: 'LOAN' | 'RETURN'; // Define type of letter
}

export const PrintableLoanLetter: React.FC<PrintableLoanLetterProps> = ({ loan, onClose, currentUserRole, type = 'LOAN' }) => {
  const { letterConfig, generateDocHash } = useApp();

  // Auto-trigger print when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error("Auto-print blocked", e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const isLoan = type === 'LOAN';
  
  // Use Config for Header Texts
  const headerText = isLoan ? letterConfig.bodyHeader : letterConfig.returnBodyHeader;
  const openingText = isLoan ? letterConfig.bodyOpening : letterConfig.returnBodyOpening;

  const bodyText = isLoan 
      ? 'PIHAK PERTAMA menyerahkan Barang Milik Negara (BMN) kepada PIHAK KEDUA untuk keperluan kegiatan akademik/operasional dengan rincian sebagai berikut:'
      : 'PIHAK KEDUA menyerahkan kembali Barang Milik Negara (BMN) kepada PIHAK PERTAMA setelah selesai digunakan dengan rincian sebagai berikut:';

  const closingText = isLoan ? letterConfig.bodyClosing : letterConfig.returnBodyClosing;

  // Generate Letter Number
  const getRomanMonth = (date: Date) => {
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return months[date.getMonth()];
  };

  const formatLetterNumber = (fmt: string, id: string) => {
    const d = new Date();
    let res = fmt;
    res = res.replace(/\[ID\]/g, id);
    res = res.replace(/\[BLN\]/g, getRomanMonth(d));
    res = res.replace(/\[THN\]/g, d.getFullYear().toString());
    return res;
  };

  const numberFormat = isLoan ? letterConfig.loanLetterNumberFormat : letterConfig.returnLetterNumberFormat;
  const letterNumber = formatLetterNumber(numberFormat || '[ID]/BA/ATI/[BLN]/[THN]', loan.kd_pinjam);

  // Generate Hashes for QR Codes
  const docHash = generateDocHash(loan, type);
  const signDate = new Date().toLocaleString('id-ID');
  
  // Digital Signature Strings
  const userSignData = `SIGN:USER:${loan.user_id}:${loan.user_name.replace(/\s/g, '_')}:${signDate}`;
  const adminSignData = `SIGN:ADMIN:${loan.petugas_approver?.replace(/\s/g, '_') || 'PETUGAS'}:${signDate}`;

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto text-black font-serif">
      {/* Screen-only Controls */}
      <div className="print:hidden sticky top-0 left-0 right-0 bg-white/95 backdrop-blur shadow-sm p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-sans text-sm font-medium"
          >
            <X size={18} /> Tutup
          </button>
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-sans">
            <Info size={16} />
            <span>Gunakan kertas A4 untuk hasil terbaik.</span>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-ati-600 hover:bg-ati-700 text-white rounded-lg transition-colors font-sans font-bold shadow-sm"
        >
          <Printer size={18} /> Print
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] min-h-[297mm] print:p-0 print:mx-0 print:w-full relative">
        
        {/* Verification QR (Top Right) */}
        <div className="absolute top-[20mm] right-[20mm] opacity-80">
           <div className="border p-1 bg-white">
              <QRCode value={docHash} size={64} />
           </div>
           <p className="text-[8px] font-sans text-center mt-1">VALID</p>
        </div>

        {/* KOP SURAT DYNAMIC */}
        <div className="flex items-center gap-4 border-b-4 border-black pb-4 mb-8 pr-20">
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

        {/* JUDUL SURAT */}
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold underline uppercase tracking-wider">{headerText}</h3>
          <p className="text-sm mt-1">No: {letterNumber}</p>
        </div>

        {/* ISI SURAT */}
        <div className="space-y-6 text-justify leading-relaxed text-base">
          <p>
            {openingText}
          </p>

          <div className="pl-4 space-y-4">
            {/* PIHAK 1 */}
            <div>
              <div className="grid grid-cols-[30px_150px_auto] gap-1">
                <span>1.</span>
                <span>Nama</span>
                <span>: <strong>{loan.petugas_approver || 'Petugas BMN'}</strong></span>
                
                <span></span>
                <span>Jabatan</span>
                <span>: Pengelola BMN {letterConfig.institutionName}</span>
              </div>
              <p className="pl-8 mt-1">
                Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> 
                ({isLoan ? "Yang Menyerahkan" : "Yang Menerima"}).
              </p>
            </div>

            {/* PIHAK 2 */}
            <div>
              <div className="grid grid-cols-[30px_150px_auto] gap-1">
                <span>2.</span>
                <span>Nama</span>
                <span>: <strong>{loan.user_name}</strong></span>

                <span></span>
                <span>ID / BP</span>
                <span>: {loan.user_id}</span>
              </div>
              <p className="pl-8 mt-1">
                Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong> 
                ({isLoan ? "Yang Menerima" : "Yang Menyerahkan"}).
              </p>
            </div>
          </div>

          <p>
            {bodyText}
          </p>

          {/* TABEL BARANG */}
          <table className="w-full border-collapse border border-black text-sm mt-4 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-4 py-2 text-center w-12">No</th>
                <th className="border border-black px-4 py-2 text-left">Kode Barang</th>
                <th className="border border-black px-4 py-2 text-left">Nama Barang</th>
                <th className="border border-black px-4 py-2 text-center">Jumlah</th>
                <th className="border border-black px-4 py-2 text-center">Kondisi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-4 py-3 text-center">1</td>
                <td className="border border-black px-4 py-3 font-mono">{loan.kd_brg}</td>
                <td className="border border-black px-4 py-3">
                  <div className="font-bold">{loan.item_name}</div>
                  <div className="text-xs italic">{loan.item_category}</div>
                </td>
                <td className="border border-black px-4 py-3 text-center">{loan.jml_pinjam} Unit</td>
                <td className="border border-black px-4 py-3 text-center">
                   {isLoan ? 'Baik' : (loan.return_condition === ItemConditionEnum.BAIK ? 'Baik' : 'Rusak')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* KETENTUAN */}
          <div>
            <p className="font-bold mb-2">Ketentuan:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Tanggal Pinjam: <strong>{loan.tgl_pinjam}</strong>.</li>
              <li>Jatuh Tempo: <strong>{loan.tgl_kembali}</strong>.</li>
              {!isLoan && <li>Tanggal Dikembalikan: <strong>{loan.return_date_actual}</strong>.</li>}
              
              {loan.jam_pinjam_mulai && (
                <li>Waktu Pemakaian: {loan.jam_pinjam_mulai} - {loan.jam_pinjam_selesai}.</li>
              )}
              
              {isLoan ? (
                <>
                  <li>PIHAK KEDUA bertanggung jawab penuh atas keamanan barang.</li>
                </>
              ) : (
                <>
                   <li>Barang telah diperiksa kelengkapannya oleh PIHAK PERTAMA.</li>
                   {loan.return_note && <li>Catatan: <em>{loan.return_note}</em></li>}
                </>
              )}
            </ol>
          </div>

          <p>
            {closingText}
          </p>
        </div>

        {/* TANDA TANGAN */}
        <div className="mt-16 flex justify-between px-8 text-center break-inside-avoid">
          <div className="flex flex-col items-center">
            <p className="mb-2">PIHAK KEDUA</p>
            <p className="text-xs mb-4">({isLoan ? 'Peminjam' : 'Yang Menyerahkan'})</p>
            
            {/* User Digital Signature */}
            <div className="mb-4 p-1 border border-slate-200">
               <QRCode value={userSignData} size={80} />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mb-2">Valid: {signDate}</p>

            <p className="font-bold underline uppercase">{loan.user_name}</p>
            <p className="text-sm">NIP/NIM. {loan.user_id}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-2">PIHAK PERTAMA</p>
            <p className="text-xs mb-4">({isLoan ? 'Admin' : 'Yang Menerima'})</p>
            
            {/* Admin Digital Signature */}
            <div className="mb-4 p-1 border border-slate-200">
               <QRCode value={adminSignData} size={80} />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mb-2">Valid: {signDate}</p>

            <p className="font-bold underline uppercase">{loan.petugas_approver || 'Petugas BMN'}</p>
            <p className="text-sm">NIP. {loan.petugas_nip || '.........................'}</p>
          </div>
        </div>

        {/* Footer Admin */}
        <div className="mt-12 pt-4 border-t border-gray-400 text-[10px] text-gray-500 font-sans flex flex-col gap-1">
          <div className="flex justify-between">
            <span>System Generated (SIP-BMN)</span>
            <span>{new Date().toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck size={10} />
            <span>Dokumen ini sah dan ditandatangani secara digital.</span>
          </div>
          <div className="font-mono text-xs mt-1">HASH: {docHash}</div>
        </div>

      </div>
    </div>
  );
};
