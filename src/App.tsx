/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { db } from './firebase';
import { Lock, Unlock, ShieldAlert, Smartphone, Loader2 } from 'lucide-react';

export default function App() {
  const [pin, setPin] = useState('');
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Memantau path /status/is_locked di Firebase Realtime Database
    const statusRef = ref(db, 'status/is_locked');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setIsLocked(snapshot.val() || false);
      setErrorMsg(''); // Clear error jika berhasil membaca
    }, (error) => {
      console.error("Firebase read error:", error);
      setErrorMsg("Gagal membaca data dari Firebase. Pastikan Rules Realtime Database diizinkan (read: true).");
    });
    
    return () => unsubscribe();
  }, []);

  const handleLock = async () => {
    if (!pin) {
      setErrorMsg('Masukkan PIN terlebih dahulu!');
      return;
    }
    if (pin.length < 4) {
      setErrorMsg('PIN minimal 4 angka.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      // Update PIN dan status kunci secara bersamaan
      const updates = {
        'status/lock_pin': pin,
        'status/is_locked': true
      };
      await update(ref(db), updates);
      setPin(''); // Reset input
    } catch (error: any) {
      console.error("Error locking:", error);
      setErrorMsg('Gagal mengunci: ' + error.message + '. Pastikan Rules mengizinkan (write: true).');
    }
    setLoading(false);
  };

  const handleUnlock = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Buka kunci secara remote
      await set(ref(db, 'status/is_locked'), false);
    } catch (error: any) {
      console.error("Error unlocking:", error);
      setErrorMsg('Gagal membuka kunci: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-700 opacity-20 transform -skew-y-6 origin-top-left"></div>
          <ShieldAlert className="w-14 h-14 text-white mx-auto mb-3 relative z-10" />
          <h1 className="text-3xl font-bold text-white relative z-10 tracking-tight">Parental Control</h1>
          <p className="text-indigo-100 mt-2 relative z-10 font-medium tracking-wide uppercase text-sm">Dashboard Orang Tua</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 flex items-start">
              <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Smartphone className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Status HP Anak</p>
                {isLocked === null ? (
                  <p className="text-slate-700 font-bold flex items-center text-lg">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
                  </p>
                ) : isLocked ? (
                  <p className="text-red-600 font-bold flex items-center text-lg">
                    <Lock className="w-5 h-5 mr-2" /> Terkunci
                  </p>
                ) : (
                  <p className="text-emerald-600 font-bold flex items-center text-lg">
                    <Unlock className="w-5 h-5 mr-2" /> Terbuka
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Atur PIN Baru
              </label>
              <input
                type="number"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN (misal: 1234)"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg tracking-widest font-mono"
                disabled={loading || isLocked === true}
              />
            </div>

            <button
              onClick={handleLock}
              disabled={loading || isLocked === true || !pin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Lock className="w-6 h-6 mr-2" />
                  Kunci HP Anak
                </>
              )}
            </button>

            {isLocked && (
              <button
                onClick={handleUnlock}
                disabled={loading}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Unlock className="w-6 h-6 mr-2" />
                    Buka Kunci (Remote)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
