
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemStatus, ItemCondition, ItemCategory } from '../types';
import { ShoppingBag, Search, Info, Building } from 'lucide-react';
import { ConditionBadge } from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export const LoanRequest = () => {
  const { items, requestLoan } = useApp();
  const navigate = useNavigate(); // Hook for navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  
  // Request Form State
  const [qty, setQty] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const categories = ['ALL', ...Object.values(ItemCategory)];

  const filteredItems = items.filter(item => {
    const isAvailable = item.status_brg === ItemStatus.TAMPIL && item.available_qty > 0 && item.kondisi_brg === ItemCondition.BAIK;
    const matchesSearch = item.nama_brg.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.kat_brg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || item.kat_brg === activeCategory;
    
    return isAvailable && matchesSearch && matchesCategory;
  });

  const getSelectedItemDetails = () => items.find(i => i.kd_brg === selectedItem);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      requestLoan(selectedItem, qty, returnDate, startTime, endTime);
      
      // Notification and Redirect
      alert('Permintaan peminjaman berhasil dikirim! Anda akan dialihkan ke halaman Riwayat.');
      navigate('/history');

      setSelectedItem(null);
      setQty(1);
      setReturnDate('');
      setStartTime('');
      setEndTime('');
    }
  };

  const isBuilding = getSelectedItemDetails()?.kat_brg === ItemCategory.GEDUNG;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pinjam Barang</h1>
        <p className="text-slate-500">Pilih barang atau gedung yang tersedia untuk dipinjam</p>
      </div>

       {/* Filters & Search */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari alat, gedung, atau perangkat..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ati-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              {cat === 'ALL' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.kd_brg} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-slate-200 relative overflow-hidden group">
               <img src={item.image} alt={item.nama_brg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
               <div className="absolute top-2 right-2">
                 <ConditionBadge condition={item.kondisi_brg} />
               </div>
               {item.kat_brg === ItemCategory.GEDUNG && (
                 <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow">
                    GEDUNG
                 </div>
               )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-xs text-ati-600 font-bold uppercase tracking-wide mb-1">{item.kat_brg}</p>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{item.nama_brg}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.des_brg}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <span className="font-semibold bg-slate-100 px-2 py-1 rounded">
                    {item.kat_brg === ItemCategory.GEDUNG ? 'Status: Tersedia' : `Stok: ${item.available_qty}`}
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="truncate max-w-[150px]">{item.merk_brg}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(item.kd_brg)}
                className="w-full bg-ati-600 text-white py-2 rounded-lg hover:bg-ati-700 transition-colors flex justify-center items-center gap-2"
              >
                {item.kat_brg === ItemCategory.GEDUNG ? <Building size={18} /> : <ShoppingBag size={18} />} 
                {item.kat_brg === ItemCategory.GEDUNG ? 'Booking Gedung' : 'Ajukan Pinjam'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
         <div className="text-center py-12">
            <Info className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">Tidak ada barang yang cocok atau tersedia saat ini.</p>
         </div>
      )}

      {/* Request Modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
               <h3 className="font-bold text-lg text-slate-800">
                 {isBuilding ? 'Booking Gedung/Ruangan' : 'Konfirmasi Peminjaman'}
               </h3>
               <p className="text-sm text-slate-500">{getSelectedItemDetails()?.nama_brg}</p>
            </div>
            <form onSubmit={handleRequest} className="p-6">
              
              {!isBuilding && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Pinjam</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={getSelectedItemDetails()?.available_qty || 1}
                    className="w-full border rounded-lg px-3 py-2"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value))}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Maksimal: {getSelectedItemDetails()?.available_qty}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isBuilding ? 'Tanggal Pemakaian' : 'Tanggal Pengembalian (Rencana)'}
                </label>
                <input 
                  type="date" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>

              {isBuilding && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai</label>
                    <input 
                      type="time" 
                      className="w-full border rounded-lg px-3 py-2"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Selesai</label>
                    <input 
                      type="time" 
                      className="w-full border rounded-lg px-3 py-2"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-ati-600 text-white rounded-lg hover:bg-ati-700">
                  {isBuilding ? 'Booking Sekarang' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
