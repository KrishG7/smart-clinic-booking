import React, { useEffect, useState } from 'react';
import { Users, ArrowRight, Clock } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import type { User } from '../../services/authService';

interface Props {
  user: User;
}

export const DoctorDashboard: React.FC<Props> = ({ user }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentToken, setCurrentToken] = useState<any>(null);

  const fetchData = async () => {
    try {
      const qRes = await apiClient(`/tokens/queue/${user.id || 1}`); // fallback 1 for demo
      if (qRes.success) {
        setQueue(qRes.data.queue || []);
        setCurrentToken(qRes.data.currentToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const intv = setInterval(fetchData, 10000);
    return () => clearInterval(intv);
  }, []);

  const callNextPatient = async () => {
    try {
      const res = await apiClient('/tokens/next', {
        method: 'POST',
        body: JSON.stringify({ doctorId: user.id || 1 })
      });
      if (res.success) fetchData();
      else alert(res.message);
    } catch {
      alert('Error calling next token');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-panel p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center bg-slate-800/40 -mx-6 -mt-6 p-6 rounded-t-2xl border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white flex gap-2 items-center"><Users className="text-brand-500 w-5 h-5"/> Current Queue</h3>
          <div className="flex gap-3">
            <span className="glass-button px-3 py-1 text-sm bg-brand-600/20 text-brand-400 border-none">{queue.length} Waiting</span>
            <button onClick={callNextPatient} className="bg-brand-600 hover:bg-brand-500 text-brand-50 px-4 py-1 text-sm font-bold rounded-lg shadow-glass transition flex items-center gap-1">
              Call Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {currentToken && (
          <div className="p-4 rounded-xl border border-brand-500/40 bg-brand-900/20 shadow-glass-card flex justify-between items-center">
            <div>
              <span className="text-xs text-brand-400 uppercase font-bold tracking-widest pl-1">Now Serving</span>
              <h4 className="text-2xl font-black text-white">{currentToken.patientName}</h4>
            </div>
            <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_#0d9488]">
              {currentToken.tokenNumber}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {queue.length === 0 && <p className="text-slate-500 py-6 text-center italic">No patients waiting in queue.</p>}
          {queue.map((patient: any) => (
            <div key={patient.tokenNumber} className="group relative flex justify-between items-center p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800 transition-colors shadow-none hover:shadow-glass-card">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${patient.status === 'in_progress' ? 'bg-brand-500 shadow-[0_0_12px_#14b8a6]' : 'bg-slate-500'}`} />
                <div className="flex flex-col">
                  <span className="font-medium text-white text-lg">{patient.patientName}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Token #{patient.tokenNumber} &bull; {patient.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-3xl font-bold tracking-tighter text-white font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" />
                  {patient.estimatedWait}<span className="text-lg text-slate-500 font-medium">m</span>
                </span>
                <span className="text-xs text-slate-400">Est. Wait</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-4">Performance</h3>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-slate-400 font-medium text-sm tracking-wider uppercase">Today's Load</span>
            <div className="flex items-end gap-2">
              <h4 className="text-5xl font-black text-white">{queue.length * 2 + 12}</h4>
              <span className="text-brand-500 font-semibold mb-1 uppercase text-sm">+5%</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 border-t border-slate-700/40 pt-6">
            <span className="text-slate-400 font-medium text-sm tracking-wider uppercase">Efficiency Rating</span>
            <div className="flex items-end gap-2">
              <h4 className="text-5xl font-black text-emerald-400">98%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
