
import { BMNItem, ItemCategory, ItemCondition, ItemStatus, Loan, LoanStatus, User, UserRole } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: 'U001',
    username: 'ade_chairullah',
    name: 'Ade Chairullah',
    role: UserRole.USER,
    nobp_nip: '171200015',
    email: 'ade@student.ati.ac.id',
    avatar: 'https://picsum.photos/200/200'
  },
  {
    id: 'A001',
    username: 'admin',
    name: 'Rifa Turaina (Admin)',
    role: UserRole.ADMIN,
    nobp_nip: '198503202010012005', // Added NIP for Admin
    email: 'admin@ati.ac.id',
    avatar: 'https://picsum.photos/201/201'
  }
];

export const MOCK_ITEMS: BMNItem[] = [
  {
    kd_brg: 1001,
    nup_brg: 1,
    nama_brg: 'Laptop Dell Latitude',
    merk_brg: 'Dell',
    kat_brg: ItemCategory.ELEKTRONIK,
    des_brg: 'Laptop untuk praktikum pemrograman',
    jml_brg: 10,
    available_qty: 8,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80'
  },
  {
    kd_brg: 1002,
    nup_brg: 2,
    nama_brg: 'Proyektor Epson',
    merk_brg: 'Epson',
    kat_brg: ItemCategory.ELEKTRONIK,
    des_brg: 'Proyektor LCD resolusi tinggi',
    jml_brg: 5,
    available_qty: 4,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1517430529647-90c8b947deb8?auto=format&fit=crop&w=800&q=80'
  },
  {
    kd_brg: 1003,
    nup_brg: 3,
    nama_brg: 'Kamera DSLR',
    merk_brg: 'Canon',
    kat_brg: ItemCategory.ELEKTRONIK,
    des_brg: 'Kamera dokumentasi kegiatan',
    jml_brg: 2,
    available_qty: 2,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
  },
  {
    kd_brg: 1004,
    nup_brg: 4,
    nama_brg: 'Kursi Kuliah',
    merk_brg: 'Futura',
    kat_brg: ItemCategory.MEBEL,
    des_brg: 'Kursi lipat warna merah',
    jml_brg: 50,
    available_qty: 50,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.RUSAK,
    image: 'https://images.unsplash.com/photo-1503602642458-2321114458ed?auto=format&fit=crop&w=800&q=80'
  },
  // New Building Items
  {
    kd_brg: 2001,
    nup_brg: 101,
    nama_brg: 'Aula Utama (Lt. 3)',
    merk_brg: 'Gedung A',
    kat_brg: ItemCategory.GEDUNG,
    des_brg: 'Kapasitas 200 orang, Sound System lengkap',
    jml_brg: 1,
    available_qty: 1,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'
  },
  {
    kd_brg: 2002,
    nup_brg: 102,
    nama_brg: 'Laboratorium Komputer',
    merk_brg: 'Gedung B',
    kat_brg: ItemCategory.GEDUNG,
    des_brg: 'Lab Komputer Dasar, 30 PC',
    jml_brg: 1,
    available_qty: 1,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
  },
  {
    kd_brg: 3001,
    nup_brg: 201,
    nama_brg: 'Toyota Avanza',
    merk_brg: 'Toyota',
    kat_brg: ItemCategory.KENDARAAN,
    des_brg: 'Mobil Operasional Kampus BA 1234 XY',
    jml_brg: 2,
    available_qty: 2,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_LOANS: Loan[] = [
  {
    kd_pinjam: 'P001',
    user_id: 'U001',
    user_name: 'Ade Chairullah',
    kd_brg: 1001,
    item_name: 'Laptop Dell Latitude',
    item_category: ItemCategory.ELEKTRONIK,
    jml_pinjam: 1,
    tgl_pinjam: '2023-11-28',
    tgl_kembali: '2023-11-30',
    status: LoanStatus.APPROVED,
    petugas_approver: 'Rifa Turaina (Admin)',
    petugas_nip: '198503202010012005' // Added NIP for existing approved loan
  },
  {
    kd_pinjam: 'P002',
    user_id: 'U001',
    user_name: 'Ade Chairullah',
    kd_brg: 1002,
    item_name: 'Proyektor Epson',
    item_category: ItemCategory.ELEKTRONIK,
    jml_pinjam: 1,
    tgl_pinjam: '2023-12-01',
    tgl_kembali: '2023-12-02',
    status: LoanStatus.PENDING
  }
];