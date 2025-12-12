import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, BMNItem, Loan, UserRole, LoanStatus, ItemCondition, LetterConfig } from '../types';
import { MOCK_ITEMS, MOCK_USERS, MOCK_LOANS } from '../constants'; 

interface AppContextType {
  // Auth
  currentUser: User | null;
  users: User[]; 
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, userData: Omit<User, 'id' | 'email'>) => Promise<void>;
  logout: () => void;
  
  // Data
  items: BMNItem[];
  loans: Loan[];
  letterConfig: LetterConfig;
  
  // Actions
  addItem: (item: Omit<BMNItem, 'kd_brg' | 'available_qty'>) => void;
  updateItem: (item: BMNItem) => void;
  deleteItem: (id: number) => void;
  
  // User Actions
  addUser: (user: User) => void; 
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  importUsers: (newUsers: User[]) => void;

  // Config Actions
  updateLetterConfig: (config: LetterConfig) => void;
  seedDatabase: () => Promise<void>;

  requestLoan: (itemId: number, qty: number, returnDate: string, startTime?: string, endTime?: string) => void;
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string) => void;
  returnLoan: (loanId: string, condition: ItemCondition, note?: string) => void;
  
  // Validation
  generateDocHash: (loan: Loan, type: 'LOAN' | 'RETURN') => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default Config (fallback)
const DEFAULT_CONFIG: LetterConfig = {
    ministryName: 'Kementerian Perindustrian Republik Indonesia',
    institutionName: 'Politeknik ATI Padang',
    address: 'Jl. Bungo Pasang Tabing, Padang, Sumatera Barat. Telp (0751) 7055053',
    contactInfo: 'Website: www.poltekatipdg.ac.id | Email: info@poltekatipdg.ac.id',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Politeknik_ATI_Padang.png',
    
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
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // Load initial state from LocalStorage or use Mocks
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadState('sipbmn_currentUser', null));
  const [items, setItems] = useState<BMNItem[]>(() => loadState('sipbmn_items', MOCK_ITEMS));
  const [loans, setLoans] = useState<Loan[]>(() => loadState('sipbmn_loans', MOCK_LOANS));
  const [users, setUsers] = useState<User[]>(() => loadState('sipbmn_users', MOCK_USERS));
  const [letterConfig, setLetterConfig] = useState<LetterConfig>(() => loadState('sipbmn_config', DEFAULT_CONFIG));

  // Persist State to LocalStorage
  useEffect(() => localStorage.setItem('sipbmn_currentUser', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('sipbmn_items', JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('sipbmn_loans', JSON.stringify(loans)), [loans]);
  useEffect(() => localStorage.setItem('sipbmn_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('sipbmn_config', JSON.stringify(letterConfig)), [letterConfig]);

  // --- AUTH ACTIONS ---
  const login = async (email: string, pass: string) => {
    // Simple Mock Login
    // Find user in local users list
    const user = users.find(u => u.email === email);
    
    // For demo/dev purposes, simple password check or bypass
    // Check if password matches a simple pattern or specific demo accounts
    if (user) {
        if (pass === 'admin123' || pass === 'user123' || pass === '123456') {
             setCurrentUser(user);
             return;
        } else {
             throw new Error("Password salah (Hint: admin123)");
        }
    } else {
        throw new Error("User tidak ditemukan.");
    }
  };

  const register = async (email: string, pass: string, userData: Omit<User, 'id' | 'email'>) => {
    if (users.some(u => u.email === email)) {
        throw new Error("Email sudah terdaftar.");
    }

    const role = email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.USER;

    const newUser: User = {
        id: (role === UserRole.ADMIN ? 'A' : 'U') + Date.now().toString().slice(-4),
        email,
        ...userData,
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sipbmn_currentUser');
  };

  // --- ITEM MANAGEMENT ---
  const addItem = (newItem: Omit<BMNItem, 'kd_brg' | 'available_qty'>) => {
    const maxId = items.length > 0 ? Math.max(...items.map(i => i.kd_brg)) : 1000;
    const item: BMNItem = {
      ...newItem,
      kd_brg: maxId + 1,
      available_qty: newItem.jml_brg 
    };
    setItems(prev => [...prev, item]);
  };

  const updateItem = (updatedItem: BMNItem) => {
    setItems(prev => prev.map(item => item.kd_brg === updatedItem.kd_brg ? updatedItem : item));
  };

  const deleteItem = (id: number) => {
    setItems(prev => prev.filter(item => item.kd_brg !== id));
  };

  // --- USER MANAGEMENT (ADMIN) ---
  const addUser = (user: User) => {
      setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const importUsers = (newUsers: User[]) => {
    // Avoid duplicates by ID
    const currentIds = new Set(users.map(u => u.id));
    const toAdd = newUsers.filter(u => !currentIds.has(u.id));
    setUsers(prev => [...prev, ...toAdd]);
  };

  // --- CONFIG MANAGEMENT ---
  const updateLetterConfig = (config: LetterConfig) => {
    setLetterConfig(config);
  };

  const seedDatabase = async () => {
    if (!confirm("Ini akan mereset data ke default (MOCK). Data tersimpan akan hilang. Lanjutkan?")) return;
    setItems(MOCK_ITEMS);
    setLoans(MOCK_LOANS);
    setUsers(MOCK_USERS);
    setLetterConfig(DEFAULT_CONFIG);
    alert("Database berhasil di-reset ke data default.");
  };

  // --- LOAN MANAGEMENT ---
  const requestLoan = (itemId: number, qty: number, returnDate: string, startTime?: string, endTime?: string) => {
    if (!currentUser) return;
    const item = items.find(i => i.kd_brg === itemId);
    if (!item) return;

    const newLoan: Loan = {
      kd_pinjam: `P${Math.floor(Math.random() * 10000)}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      kd_brg: itemId,
      item_name: item.nama_brg,
      item_category: item.kat_brg,
      jml_pinjam: qty,
      tgl_pinjam: new Date().toISOString().split('T')[0],
      tgl_kembali: returnDate,
      jam_pinjam_mulai: startTime,
      jam_pinjam_selesai: endTime,
      status: LoanStatus.PENDING
    };
    
    setLoans(prev => [newLoan, ...prev]);
  };

  const approveLoan = (loanId: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    
    // Find loan
    const loanIndex = loans.findIndex(l => l.kd_pinjam === loanId);
    if (loanIndex === -1) return;
    const loan = loans[loanIndex];

    // Update Loan
    const updatedLoan = {
        ...loan,
        status: LoanStatus.APPROVED,
        petugas_approver: currentUser.name,
        petugas_nip: currentUser.nobp_nip || ''
    };

    const newLoans = [...loans];
    newLoans[loanIndex] = updatedLoan;
    setLoans(newLoans);

    // Decrease Inventory
    const itemIndex = items.findIndex(i => i.kd_brg === loan.kd_brg);
    if (itemIndex > -1) {
        const item = items[itemIndex];
        const newQty = Math.max(0, item.available_qty - loan.jml_pinjam);
        const updatedItem = { ...item, available_qty: newQty };
        
        const newItems = [...items];
        newItems[itemIndex] = updatedItem;
        setItems(newItems);
    }
  };

  const rejectLoan = (loanId: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    setLoans(prev => prev.map(l => l.kd_pinjam === loanId ? {
        ...l,
        status: LoanStatus.REJECTED,
        petugas_approver: currentUser.name,
        petugas_nip: currentUser.nobp_nip || ''
    } : l));
  };

  const returnLoan = (loanId: string, condition: ItemCondition, note?: string) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
    
    const loanIndex = loans.findIndex(l => l.kd_pinjam === loanId);
    if (loanIndex === -1) return;
    const loan = loans[loanIndex];

    // Update Loan
    const updatedLoan = {
        ...loan,
        status: LoanStatus.RETURNED,
        return_condition: condition,
        return_date_actual: new Date().toISOString().split('T')[0],
        return_note: note || ''
    };
    
    const newLoans = [...loans];
    newLoans[loanIndex] = updatedLoan;
    setLoans(newLoans);

    // Restore Inventory
    const itemIndex = items.findIndex(i => i.kd_brg === loan.kd_brg);
    if (itemIndex > -1) {
        const item = items[itemIndex];
        const newQty = Math.min(item.jml_brg, item.available_qty + loan.jml_pinjam);
        const updatedItem = { ...item, available_qty: newQty };
        
        const newItems = [...items];
        newItems[itemIndex] = updatedItem;
        setItems(newItems);
    }
  };

  // --- VALIDATION HELPER ---
  const generateDocHash = (loan: Loan, type: 'LOAN' | 'RETURN') => {
    const data = `${type}|${loan.kd_pinjam}|${loan.user_id}|${loan.tgl_pinjam}|${loan.status}`;
    return btoa(data);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, login, register, logout,
      items, loans, letterConfig,
      addItem, updateItem, deleteItem,
      addUser, updateUser, deleteUser, importUsers, updateLetterConfig, seedDatabase,
      requestLoan, approveLoan, rejectLoan, returnLoan,
      generateDocHash
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};