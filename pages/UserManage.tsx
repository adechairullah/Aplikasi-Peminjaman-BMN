
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Plus, Trash2, Upload, Download, Search, ShieldCheck, UserCircle, Edit } from 'lucide-react';

export const UserManage = () => {
  const { users, addUser, updateUser, deleteUser, importUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    name: '',
    role: UserRole.USER,
    nobp_nip: '',
    email: ''
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to generate next ID
  const generateNextId = (role: UserRole) => {
    const prefix = role === UserRole.ADMIN ? 'A' : 'U';
    // Find all IDs starting with prefix
    const existingNumbers = users
      .filter(u => u.id.startsWith(prefix))
      .map(u => {
        const numPart = parseInt(u.id.substring(1));
        return isNaN(numPart) ? 0 : numPart;
      });
    
    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    // Generate initial ID for default role (USER)
    const nextId = generateNextId(UserRole.USER);
    setFormData({ id: nextId, username: '', name: '', role: UserRole.USER, nobp_nip: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditMode(true);
    setFormData({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        nobp_nip: user.nobp_nip || '',
        email: user.email || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
        ...formData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
    };

    if (editMode) {
        updateUser(newUser);
        alert('Data user berhasil diperbarui.');
    } else {
        addUser(newUser);
    }
    
    setIsModalOpen(false);
    setFormData({ id: '', username: '', name: '', role: UserRole.USER, nobp_nip: '', email: '' });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value as UserRole;
      
      // If adding new user, regenerate ID based on new role
      if (!editMode) {
          const nextId = generateNextId(newRole);
          setFormData({ ...formData, role: newRole, id: nextId });
      } else {
          // In edit mode, usually we don't change ID even if role changes, 
          // but we update the role state
          setFormData({ ...formData, role: newRole });
      }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "id,username,name,role,nobp_nip,email\n" +
        "U002,budi_santoso,Budi Santoso,USER,2001002,budi@ati.ac.id\n" +
        "A002,staff_bmn,Staff BMN,ADMIN,19800101,staff@ati.ac.id";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_users_sipbmn.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        const newUsers: User[] = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [id, username, name, roleStr, nobp_nip, email] = line.split(',');
            
            if (id && username && name) {
                newUsers.push({
                    id: id.trim(),
                    username: username.trim(),
                    name: name.trim(),
                    role: roleStr.trim().toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.USER,
                    nobp_nip: nobp_nip?.trim(),
                    email: email?.trim(),
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`
                });
            }
        }

        if (newUsers.length > 0) {
            importUsers(newUsers);
            alert(`Berhasil mengimpor ${newUsers.length} user.`);
        } else {
            alert("Gagal membaca file atau file kosong.");
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-slate-500">Kelola akun Admin dan Peminjam (Mahasiswa/Pegawai)</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={downloadTemplate}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
                <Download size={16} /> Template CSV
            </button>
            <div className="relative">
                <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                    <Upload size={16} /> Import CSV
                </button>
            </div>
            <button 
                onClick={handleOpenAdd}
                className="bg-ati-600 hover:bg-ati-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
                <Plus size={16} /> Tambah User
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama, username, atau ID..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ati-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                  <div className="flex gap-4">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border" />
                      <div>
                          <h3 className="font-bold text-slate-800">{user.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                              {user.role === UserRole.ADMIN ? <ShieldCheck size={12} className="text-blue-600"/> : <UserCircle size={12} />}
                              <span>{user.role}</span>
                              <span className="text-slate-300">|</span>
                              <span>{user.id}</span>
                          </div>
                          <p className="text-sm text-slate-600">{user.email || '-'}</p>
                          {user.nobp_nip && <p className="text-xs text-slate-400 mt-1">NIP/BP: {user.nobp_nip}</p>}
                      </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button 
                        onClick={() => handleOpenEdit(user)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit User"
                      >
                          <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Hapus user ini?')) deleteUser(user.id); }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Hapus User"
                      >
                          <Trash2 size={18} />
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">{editMode ? 'Edit Data User' : 'Tambah User Baru'}</h3>
               <button onClick={() => setIsModalOpen(false)}><Plus className="rotate-45 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID User (Otomatis)</label>
                        <input 
                            required 
                            className="w-full border rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed"
                            value={formData.id} 
                            readOnly
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                         <select 
                            className="w-full border rounded-lg px-3 py-2" 
                            value={formData.role} 
                            onChange={handleRoleChange}
                         >
                             <option value={UserRole.USER}>User (Peminjam)</option>
                             <option value={UserRole.ADMIN}>Admin (Petugas)</option>
                         </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input required className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input required className="w-full border rounded-lg px-3 py-2" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" className="w-full border rounded-lg px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">NIP / No. BP</label>
                        <input className="w-full border rounded-lg px-3 py-2" value={formData.nobp_nip} onChange={e => setFormData({...formData, nobp_nip: e.target.value})} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2 border-t mt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-ati-600 text-white rounded-lg hover:bg-ati-700">
                        {editMode ? 'Simpan Perubahan' : 'Simpan User'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
