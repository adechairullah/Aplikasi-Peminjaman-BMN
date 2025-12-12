
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCondition, ItemStatus, ItemCategory, BMNItem } from '../types';
import { Plus, Search, Trash2, Edit, Save, AlertTriangle } from 'lucide-react';
import { ConditionBadge } from '../components/StatusBadge';

export const Inventory = () => {
  const { items, addItem, updateItem, deleteItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Form State
  const initialFormState = {
    nama_brg: '',
    merk_brg: '',
    kat_brg: ItemCategory.ELEKTRONIK,
    des_brg: '',
    jml_brg: 1,
    nup_brg: 0,
    status_brg: ItemStatus.TAMPIL,
    kondisi_brg: ItemCondition.BAIK,
    image: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const categories = ['ALL', ...Object.values(ItemCategory)];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nama_brg.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.kd_brg.toString().includes(searchTerm);
    const matchesCategory = activeCategory === 'ALL' || item.kat_brg === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditMode(false);
    setEditId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BMNItem) => {
    setEditMode(true);
    setEditId(item.kd_brg);
    setFormData({
      nama_brg: item.nama_brg,
      merk_brg: item.merk_brg,
      kat_brg: item.kat_brg as ItemCategory,
      des_brg: item.des_brg,
      jml_brg: item.jml_brg,
      nup_brg: item.nup_brg,
      status_brg: item.status_brg,
      kondisi_brg: item.kondisi_brg,
      image: item.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Ensure positive integer
    if (formData.jml_brg < 0 || !Number.isInteger(formData.jml_brg)) {
        alert("Jumlah stok harus berupa angka bulat positif.");
        return;
    }

    if (editMode && editId) {
       // Update existing
       const existingItem = items.find(i => i.kd_brg === editId);
       if (existingItem) {
           const borrowed = existingItem.jml_brg - existingItem.available_qty;
           
           // Validation: Cannot reduce total stock below currently borrowed amount
           if (formData.jml_brg < borrowed) {
               alert(`Gagal update: Stok total tidak boleh kurang dari jumlah yang sedang dipinjam (${borrowed} unit).`);
               return;
           }

           const newAvailable = Math.max(0, formData.jml_brg - borrowed);

           const updatedItem: BMNItem = {
             ...formData,
             kd_brg: editId,
             available_qty: newAvailable
           };
           updateItem(updatedItem);
       }
    } else {
       // Add new
       if (formData.jml_brg < 1) {
          alert("Jumlah stok minimal 1.");
          return;
       }
       addItem(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Barang (BMN)</h1>
          <p className="text-slate-500">Kelola inventaris berdasarkan kategori</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-ati-600 hover:bg-ati-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Barang
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama atau kode barang..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ati-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    activeCategory === cat 
                    ? 'bg-ati-100 text-ati-700 border-ati-200 ring-2 ring-ati-50' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            {/* Threshold Config */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
               <label>Batas Alert Low Stock:</label>
               <input 
                 type="number" 
                 min="1"
                 className="w-16 border rounded px-2 py-1"
                 value={lowStockThreshold}
                 onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
               />
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Kode</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Nama Barang</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Stok (Total/Sisa)</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kondisi</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isLowStock = item.available_qty < lowStockThreshold && item.kat_brg !== ItemCategory.GEDUNG;
                return (
                  <tr key={item.kd_brg} className={`transition-colors hover:bg-slate-50 ${isLowStock ? 'bg-red-50/60' : ''}`}>
                    <td className="px-6 py-4 font-mono text-slate-500">{item.kd_brg}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{item.nama_brg}</div>
                      <div className="text-xs text-slate-500">{item.merk_brg}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        {item.kat_brg}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.jml_brg}</span>
                        <span className="text-slate-400">/</span>
                        <span className={`font-bold ${item.available_qty === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {item.available_qty}
                        </span>
                        {isLowStock && (
                           <span className="text-red-500" title={`Stok dibawah ${lowStockThreshold}`}><AlertTriangle size={14} /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ConditionBadge condition={item.kondisi_brg} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Barang"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Apakah Anda yakin ingin menghapus barang ini?')) deleteItem(item.kd_brg)
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus Barang"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500">Tidak ada barang ditemukan untuk kategori ini.</div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editMode ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Barang</label>
                  <input required className="w-full border rounded-lg px-3 py-2" value={formData.nama_brg} onChange={e => setFormData({...formData, nama_brg: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Merk / Gedung</label>
                  <input required className="w-full border rounded-lg px-3 py-2" value={formData.merk_brg} onChange={e => setFormData({...formData, merk_brg: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select 
                     className="w-full border rounded-lg px-3 py-2"
                     value={formData.kat_brg}
                     onChange={(e) => setFormData({...formData, kat_brg: e.target.value as ItemCategory})}
                  >
                    {Object.values(ItemCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NUP</label>
                  <input type="number" required className="w-full border rounded-lg px-3 py-2" value={formData.nup_brg} onChange={e => setFormData({...formData, nup_brg: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={formData.des_brg} onChange={e => setFormData({...formData, des_brg: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Stok Total</label>
                  <input type="number" min="1" required className="w-full border rounded-lg px-3 py-2" value={formData.jml_brg} onChange={e => setFormData({...formData, jml_brg: parseInt(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Kondisi</label>
                   <select 
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.kondisi_brg}
                      onChange={(e) => setFormData({...formData, kondisi_brg: e.target.value as ItemCondition})}
                   >
                     <option value={ItemCondition.BAIK}>Baik</option>
                     <option value={ItemCondition.RUSAK}>Rusak</option>
                   </select>
                </div>
              </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar (Opsional)</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-ati-600 text-white rounded-lg hover:bg-ati-700 flex items-center gap-2">
                  <Save size={18} /> {editMode ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
