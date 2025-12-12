import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { School, AlertCircle, Info, Shield, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register additional fields
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
        if (isRegistering) {
            await register(email, password, {
                username,
                name,
                role: UserRole.USER, // Role will be overridden to ADMIN if email contains 'admin'
                nobp_nip: nip
            });
            alert("Registrasi berhasil! Anda telah login.");
        } else {
            await login(email, password);
        }
        navigate('/');
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal login/registrasi.');
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'USER') => {
    try {
        if (role === 'ADMIN') {
            await login('admin@ati.ac.id', 'admin123');
        } else {
            await login('ade@student.ati.ac.id', 'user123');
        }
        navigate('/');
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex overflow-hidden min-h-[600px]">
        
        {/* Left Side: Visual */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-ati-900 text-white p-12 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')] bg-cover opacity-20"></div>
          <div className="relative z-10">
            <div className="mb-6 inline-block bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <School size={64} />
            </div>
            <h1 className="text-3xl font-bold mb-4">SIP-BMN</h1>
            <p className="text-ati-100 text-lg">Sistem Informasi Peminjaman<br/>Barang Milik Negara</p>
            <div className="mt-8 border-t border-white/20 pt-8">
              <p className="font-semibold text-xl">Politeknik ATI Padang</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-slate-800 mb-1">
                 {isRegistering ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
             </h2>
             <p className="text-slate-500">
                 {isRegistering ? 'Isi data diri Anda untuk mendaftar.' : 'Masuk untuk mengakses sistem.'}
             </p>
          </div>

          {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} /> {error}
              </div>
          )}

          {/* DEMO ACCOUNTS SECTION */}
          {!isRegistering && (
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Akun Demo (Klik untuk Login)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleDemoLogin('ADMIN')}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-ati-500 hover:shadow-md transition-all text-left group"
                    >
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Petugas BMN</div>
                            <div className="text-[10px] text-slate-500">Admin Access</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleDemoLogin('USER')}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-ati-500 hover:shadow-md transition-all text-left group"
                    >
                        <div className="bg-green-100 text-green-600 p-2 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <User size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Mahasiswa</div>
                            <div className="text-[10px] text-slate-500">User Access</div>
                        </div>
                    </button>
                </div>
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Atau login manual</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegistering && (
                <>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                     <input type="text" required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ati-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Budi Santoso" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input type="text" required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ati-500 outline-none" value={username} onChange={e => setUsername(e.target.value)} placeholder="budi_s" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">NIP / NIM</label>
                        <input type="text" required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ati-500 outline-none" value={nip} onChange={e => setNip(e.target.value)} placeholder="19xxx" />
                     </div>
                   </div>
                </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ati-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@ati.ac.id" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-ati-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
            </div>

            {isRegistering && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>
                    Gunakan email mengandung kata <strong>"admin"</strong> untuk mendaftar sebagai Petugas/Admin.
                    </p>
                </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-ati-600 hover:bg-ati-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isRegistering ? 'Daftar Sekarang' : 'Masuk'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="ml-2 text-ati-600 font-bold hover:underline"
            >
              {isRegistering ? 'Login disini' : 'Daftar sekarang'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};