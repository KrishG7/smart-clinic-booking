import React, { useEffect, useState } from 'react';
import { CalendarRange, Search } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const DoctorSchedule: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // 1. Find this user's doctor profile ID
        const meRes = await apiClient('/auth/me');
        const userId = meRes?.user?.id;
        const docRes = await apiClient('/doctors');
        let docId = 1;
        if (docRes.success && Array.isArray(docRes.doctors)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mine = docRes.doctors.find((d: any) => d.user_id === userId);
          if (mine) docId = mine.id;
        }

        // 2. Fetch today's schedule for that doctor
        const today = new Date().toISOString().split('T')[0];
        const res = await apiClient(`/appointments/doctor/${docId}?date=${today}`);
        if (res.success) setAppointments(res.appointments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const filtered = appointments.filter(a => 
    a.patient_name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.reason?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-brand-500 animate-pulse">Loading schedule...</div>;

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="glass-panel p-6 mb-2 flex justify-between items-center gap-4 flex-wrap border-brand-500/20 shadow-glass">
         <div className="flex gap-4 items-center w-full md:w-auto">
           <Search className="text-brand-500 w-6 h-6" />
           <input 
             type="text" 
             placeholder="Search patient or reason..." 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-transparent border-none text-white text-lg font-medium outline-none placeholder:text-slate-600 w-full md:w-80" 
           />
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-brand-400 font-semibold uppercase tracking-wider text-sm border border-slate-700">
           <CalendarRange className="w-5 h-5"/> Today's Slate
         </div>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700/50">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Token</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Time</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Patient</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reason</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No appointments found matching constraints.</td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-white font-mono font-bold text-lg">#{a.token_no || '—'}</td>
                    <td className="p-4 text-slate-300 font-mono text-sm">{a.appointment_time || '—'}</td>
                    <td className="p-4 text-white font-medium">{a.patient_name || 'Patient'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-slate-700/50">
                         {(a.type || 'regular').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm max-w-xs truncate">{a.reason || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border flex w-max items-center gap-1 ${
                        a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        a.status === 'in_progress' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                        a.status === 'cancelled' || a.status === 'no_show' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                         {a.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
