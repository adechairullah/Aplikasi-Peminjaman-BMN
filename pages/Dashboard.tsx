
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, LoanStatus } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Package, Clock, CheckCircle, AlertTriangle, ArrowRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { items, loans, currentUser, approveLoan, rejectLoan } = useApp();
  const today = new Date().toISOString().split('T')[0];

  // Statistics Calculation
  const totalItems = items.length;
  const userLoans = currentUser?.role === UserRole.USER 
    ? loans.filter(l => l.user_id === currentUser.id)
    : loans;
  
  const pendingLoans = userLoans.filter(l => l.status === LoanStatus.PENDING);
  const activeLoans = userLoans.filter(l => l.status === LoanStatus.APPROVED);
  const returnedLoans = userLoans.filter(l => l.status === LoanStatus.RETURNED);

  // Overdue Logic
  const overdueLoans = userLoans.filter(l => l.status === LoanStatus.APPROVED && l.tgl_kembali < today);

  // Admin Specific: Low Stock Items
  const lowStockItems = items.filter(i => i.available_qty < 2 && i.jml_brg > 0);

  // Chart Data: Items by Category
  const categoryData = Object.entries(items.reduce((acc, item) => {
    acc[item.kat_brg] = (acc[item.kat_brg] || 0) + item.jml_brg;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  // Chart Data: Loan Status Distribution
  const statusData = [
    { name: 'Menunggu', value: pendingLoans.length, color: '#fbbf24' },
    { name: 'Dipinjam', value: activeLoans.length, color: '#3b82f6' },
    { name: 'Dikembalikan', value: returnedLoans.length, color: '#22c55e' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} className={`text-${color.split('-')[1]}-600`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Ringkasan aktivitas peminjaman BMN</p>
      </div>

      {/* Alert Section for Overdue Items - ONLY FOR ADMIN */}
      {currentUser?.role === UserRole.ADMIN && overdueLoans.length > 0 && (
         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1">
               <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
               <h3 className="text-red-800 font-bold text-lg">Peringatan: Peminjaman Terlambat!</h3>
               <p className="text-red-700 text-sm mb-2">Terdapat barang yang belum dikembalikan melewati batas waktu.</p>
               <ul className="text-sm text-red-700 list-disc list-inside mb-3">
                 {overdueLoans.slice(0, 3).map(l => (
                    <li key={l.kd_pinjam}><strong>{l.user_name}</strong> - {l.item_name} ({l.tgl_kembali})</li>
                 ))}
                 {overdueLoans.length > 3 && <li>...</li>}
               </ul>
               <Link to="/loans" className="text-sm font-semibold text-red-800 underline hover:text-red-900">
                  Lihat & Proses Pengembalian &rarr;
               </Link>
            </div>
         </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Barang" 
          value={totalItems} 
          icon={Package} 
          color="bg-slate-500" 
        />
        <StatCard 
          title="Menunggu Persetujuan" 
          value={pendingLoans.length} 
          icon={Clock} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Sedang Dipinjam" 
          value={activeLoans.length} 
          icon={CheckCircle} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Selesai/Dikembalikan" 
          value={returnedLoans.length} 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
      </div>

      {/* Admin Action Center */}
      {currentUser?.role === UserRole.ADMIN && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
           {/* Pending Approvals Quick View */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Clock size={20} className="text-yellow-500" />
                 Perlu Persetujuan ({pendingLoans.length})
               </h3>
               <Link to="/loans" className="text-sm text-ati-600 hover:underline flex items-center gap-1">
                 Lihat Semua <ArrowRight size={14} />
               </Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                   <tr>
                     <th className="px-3 py-2">Peminjam</th>
                     <th className="px-3 py-2">Barang</th>
                     <th className="px-3 py-2 text-right">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {pendingLoans.slice(0, 5).map(loan => (
                     <tr key={loan.kd_pinjam}>
                       <td className="px-3 py-3 font-medium">{loan.user_name}</td>
                       <td className="px-3 py-3">{loan.item_name}</td>
                       <td className="px-3 py-3 text-right">
                         <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => rejectLoan(loan.kd_pinjam)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X size={16} />
                            </button>
                            <button 
                              onClick={() => approveLoan(loan.kd_pinjam)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={16} />
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                   {pendingLoans.length === 0 && (
                     <tr>
                       <td colSpan={3} className="text-center py-4 text-slate-400">Tidak ada data.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Low Stock Alert */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
               <AlertTriangle size={20} className="text-red-500" />
               Stok Menipis
             </h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                    <tr>
                      <th className="px-3 py-2">Nama Barang</th>
                      <th className="px-3 py-2 text-right">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockItems.slice(0, 5).map(item => (
                      <tr key={item.kd_brg}>
                        <td className="px-3 py-3 font-medium">{item.nama_brg}</td>
                        <td className="px-3 py-3 text-right font-bold text-red-600">{item.available_qty}</td>
                      </tr>
                    ))}
                    {lowStockItems.length === 0 && (
                       <tr>
                         <td colSpan={2} className="text-center py-4 text-slate-400">Tidak ada peringatan.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}

      {/* Charts Section - Hided for non-admin users */}
      {currentUser?.role === UserRole.ADMIN && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Chart 1: Inventory Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Distribusi Kategori Barang</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Loan Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Status Peminjaman</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
