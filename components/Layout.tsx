
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, LoanStatus } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  LogOut, 
  History,
  Menu,
  X,
  School,
  Users,
  Settings,
  ScanLine,
  FileBarChart
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, loans } = useApp();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!currentUser) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path ? 'bg-ati-800 text-white' : 'text-ati-100 hover:bg-ati-600 hover:text-white';

  // Calculate overdue loans for notification
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = loans.filter(l => 
    l.status === LoanStatus.APPROVED && l.tgl_kembali < today
  ).length;

  const NavItem = ({ to, icon: Icon, label, alertCount }: { to: string, icon: any, label: string, alertCount?: number }) => (
    <Link 
      to={to} 
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 relative ${isActive(to)}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {alertCount && alertCount > 0 && (
         <span className="absolute right-3 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
           {alertCount > 9 ? '9+' : alertCount}
         </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="bg-ati-900 text-white p-4 flex justify-between items-center md:hidden sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <School className="text-white" />
          <span className="font-bold">SIP-BMN</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-ati-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-ati-800 flex flex-col items-center">
          <div className="bg-white p-2 rounded-full mb-3">
             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Politeknik_ATI_Padang.png" alt="Logo" className="w-12 h-12 object-contain" onError={(e) => e.currentTarget.src='https://via.placeholder.com/50?text=ATI'} />
          </div>
          <h1 className="text-xl font-bold text-center leading-tight">Politeknik<br/>ATI Padang</h1>
          <p className="text-xs text-ati-200 mt-1">Sistem Informasi BMN</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <div className="mt-4 mb-2 px-4 text-xs font-semibold text-ati-400 uppercase tracking-wider">Menu Admin</div>
              <NavItem to="/inventory" icon={Package} label="Data Barang (BMN)" />
              <NavItem to="/loans" icon={ClipboardList} label="Persetujuan Pinjam" alertCount={overdueCount} />
              <NavItem to="/reports" icon={FileBarChart} label="Laporan Rekap" />
              <NavItem to="/users" icon={Users} label="Manajemen User" />
              <NavItem to="/validation" icon={ScanLine} label="Validasi Dokumen" />
              <NavItem to="/settings" icon={Settings} label="Pengaturan Surat" />
            </>
          )}

          {currentUser.role === UserRole.USER && (
            <>
              <div className="mt-4 mb-2 px-4 text-xs font-semibold text-ati-400 uppercase tracking-wider">Menu User</div>
              <NavItem to="/request" icon={Package} label="Pinjam Barang" />
              <NavItem to="/my-loans" icon={History} label="Peminjaman Saya" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-ati-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-ati-500" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-ati-300 truncate">{currentUser.role === UserRole.ADMIN ? 'Petugas BMN' : currentUser.nobp_nip}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors text-sm"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-60px)] md:h-screen w-full">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
