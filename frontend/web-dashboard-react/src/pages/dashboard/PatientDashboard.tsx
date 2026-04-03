import React, { useEffect, useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const PatientDashboard: React.FC<{setActiveTab: any}> = ({setActiveTab}) => {
  const [myToken, setMyToken] = useState<any>(null);

  const fetchData = async () => {
    try {
      const tRes = await apiClient('/tokens/my');
      if (tRes.success) setMyToken(tRes.tokens?.[0] ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const intv = setInterval(fetchData, 10000);
    return () => clearInterval(intv);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-6">
      <div className="glass-panel p-8 flex flex-col items-center justify-center gap-6 text-center shadow-glass relative overflow-hidden border-brand-500/30">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-600/10 blur-[80px] rounded-full pointer-events-none" />
        
        {myToken ? (
          <>
            <h2 className="text-brand-400 font-bold uppercase tracking-widest text-sm">Your Live Token</h2>
            
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" strokeWidth="8"></circle>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#14b8a6" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * Math.min(100, (30 - myToken.estimated_wait_minutes)/30*100)) / 100} className="transition-all duration-1000 ease-in-out"></circle>
              </svg>
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-6xl font-black text-white">#{myToken.token_number}</span>
                <span className="text-sm font-semibold text-brand-500 uppercase tracking-wider">{myToken.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex flex-col text-center">
                <span className="text-3xl font-bold text-white mb-1"><Clock className="inline w-5 h-5 text-brand-500 mr-1"/>{myToken.estimated_wait_minutes}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Min Wait</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex flex-col text-center">
                <span className="text-3xl font-bold text-white mb-1">{myToken.queue_position}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">In Line</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
             <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-2">
               <Bell className="w-8 h-8 text-slate-500" />
             </div>
             <h3 className="text-xl font-bold text-white">No Active Tokens</h3>
             <p className="text-slate-400">You don't have any clinics queued right now. Head to the reception to get your token.</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-8 flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-4">Recent Visits</h3>
        <div className="flex flex-col gap-3">
           <p className="text-slate-500 text-sm">You have no upcoming scheduled appointments.</p>
           <button onClick={() => setActiveTab('book')} className="w-full py-3 mt-4 glass-button text-white font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand-500">
             Book New Appointment
           </button>
        </div>
      </div>
    </div>
  );
};
