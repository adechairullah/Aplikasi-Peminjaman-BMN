
// Enumerations based on PDF
export enum ItemCondition {
  BAIK = 'BAIK',
  RUSAK = 'RUSAK'
}

export enum ItemStatus {
  TAMPIL = 'TAMPIL',
  TIDAK_TAMPIL = 'TIDAK_TAMPIL'
}

export enum ItemCategory {
  GEDUNG = 'GEDUNG',
  ELEKTRONIK = 'ELEKTRONIK',
  MEBEL = 'MEBEL',
  KENDARAAN = 'KENDARAAN',
  LAINNYA = 'LAINNYA'
}

export enum UserRole {
  ADMIN = 'ADMIN', // Petugas
  USER = 'USER'   // Mahasiswa/Pegawai
}

export enum LoanStatus {
  PENDING = 'PENDING',       // Menunggu Persetujuan
  APPROVED = 'APPROVED',     // Disetujui / Sedang Dipinjam
  REJECTED = 'REJECTED',     // Ditolak
  RETURNED = 'RETURNED'      // Sudah Dikembalikan
}

// Configuration for Printable Letter
export interface LetterConfig {
  institutionName: string;
  ministryName: string;
  address: string;
  contactInfo: string;
  logoUrl: string;
  
  // Appearance Config
  headerMinistryFontSize: number; // px
  headerInstitutionFontSize: number; // px
  headerAddressFontSize: number; // px
  logoSize: number; // px (width)

  // Letter Number Formatting
  loanLetterNumberFormat: string; // e.g. [ID]/BA-PINJAM/ATI/[BLN]/[THN]
  returnLetterNumberFormat: string;

  // Loan Letter Config
  bodyHeader: string; // "BERITA ACARA PEMINJAMAN BMN"
  bodyOpening: string; // Text before the table
  bodyClosing: string; // Text after the table

  // Return Letter Config
  returnBodyHeader: string; // "BERITA ACARA PENGEMBALIAN BMN"
  returnBodyOpening: string;
  returnBodyClosing: string;
}

// Interfaces
export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  nobp_nip?: string; // For borrowers & admin
  email?: string;
  avatar?: string;
}

export interface BMNItem {
  kd_brg: number;         // Primary Key
  nup_brg: number;
  nama_brg: string;
  merk_brg: string;
  kat_brg: ItemCategory | string; // Changed to support specific categories
  des_brg: string;
  jml_brg: number;        // Total quantity
  available_qty: number;  // Calculated available quantity
  status_brg: ItemStatus;
  kondisi_brg: ItemCondition;
  image?: string;
}

export interface Loan {
  kd_pinjam: string;      // Primary Key
  user_id: string;
  user_name: string;
  kd_brg: number;
  item_name: string;
  item_category: string;  // Added for easier filtering
  jml_pinjam: number;
  tgl_pinjam: string;     // ISO Date (Start Date)
  jam_pinjam_mulai?: string; // Start Time (HH:mm) for Buildings
  jam_pinjam_selesai?: string; // End Time (HH:mm) for Buildings
  tgl_kembali: string;    // ISO Date (End Date - Scheduled)
  
  // Return Details
  return_date_actual?: string; // Actual return date
  return_note?: string;        // Reason for early return or general notes
  status: LoanStatus;
  petugas_approver?: string; // Name of officer
  petugas_nip?: string;      // NIP of officer
  return_condition?: ItemCondition;
}
