import React, { useEffect, useState } from 'react';
import { CalendarRange, Activity, FileText } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface Props {
  // FIX #17: 'upcoming' = Appointments tab (scheduled/in_progress)
  //          'past' = Visit History tab (completed/no_show/cancelled)
  filter?: 'upcoming' | 'past';
}

export const PatientHistory: React.FC<Props> = ({ filter }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient('/appointments/my');
        if (res.success) setAppointments(res.appointments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'in_progress');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'no_show' || a.status === 'cancelled');

  if (loading) return <div className="p-8 text-brand-500 animate-pulse">Loading health records...</div>;

  // FIX #17: When 'filter' prop is set, render only the relevant section as a full-width view
  if (filter === 'upcoming') {
    return (
      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="glass-panel p-6 border-t-4 border-brand-500">
           <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <CalendarRange className="text-brand-500 w-5 h-5"/> Upcoming Appointments
             </h3>
             <span className="text-xs font-bold uppercase tracking-widest text-brand-500 bg-brand-500/10 px-2 py-1 rounded-md">{upcoming.length} active</span>
           </div>

           {upcoming.length === 0 ? (
             <div className="text-center py-8">
               <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
               <p className="text-slate-400">No upcoming clinic visits.</p>
             </div>
           ) : (
             <ul className="flex flex-col gap-4">
               {upcoming.map(a => (
                 <li key={a.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-2 hover:border-brand-500/50 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                         {new Date(a.appointment_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                         {' '} &bull; {a.appointment_time}
                       </span>
                       {/* FIX #16: Only prefix 'Dr.' if doctor_name doesn't already start with 'Dr.' */}
                       <h4 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                         {a.doctor_name?.startsWith('Dr.') ? a.doctor_name : `Dr. ${a.doctor_name || 'Unknown'}`}
                       </h4>
                     </div>
                     <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-brand-500/10 text-brand-400 rounded border border-brand-500/20 shadow-glass">
                       {a.type?.replace('_', ' ') || 'regular'}
                     </span>
                   </div>
                   {/* FIX #14: Display patient symptoms/reason in Appointments view */}
                   {a.reason && (
                     <p className="text-slate-400 text-sm mt-1">
                       <span className="text-slate-500 font-semibold">Reason: </span>{a.reason}
                     </p>
                   )}
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    );
  }

  if (filter === 'past') {
    return (
      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="glass-panel p-6 border-t-4 border-slate-600">
           <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <FileText className="text-slate-400 w-5 h-5"/> Past Records
             </h3>
           </div>

           {past.length === 0 ? (
             <div className="text-center py-8">
               <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
               <p className="text-slate-400">Your health history is empty.</p>
             </div>
           ) : (
             <ul className="flex flex-col gap-4">
               {past.map(a => (
                 <li key={a.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-2 opacity-75 hover:opacity-100 transition-opacity">
                   <div className="flex justify-between items-center mb-1">
                     {/* FIX #16: Prevent double 'Dr.' prefix */}
                     <span className="text-sm font-bold text-white">
                       {a.doctor_name?.startsWith('Dr.') ? a.doctor_name : `Dr. ${a.doctor_name || 'Unknown'}`}
                     </span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${
                       a.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                     } px-2 py-0.5 rounded`}>
                       {a.status?.replace('_', ' ')}
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                     <span>{new Date(a.appointment_date).toLocaleDateString()}</span>
                     <span>Token #{a.token_no || 'NA'}</span>
                   </div>
                   {a.notes && (
                     <p className="text-slate-400 text-sm mt-2 border-t border-slate-800 pt-2 italic">&quot;{a.notes}&quot;</p>
                   )}
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    );
  }

  // Legacy: no filter prop—render both panels side by side (backwards compatible)
  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Appointments */}
        <div className="glass-panel p-6 border-t-4 border-brand-500">
           <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <CalendarRange className="text-brand-500 w-5 h-5"/> Upcoming Visits
             </h3>
             <span className="text-xs font-bold uppercase tracking-widest text-brand-500 bg-brand-500/10 px-2 py-1 rounded-md">{upcoming.length} active</span>
           </div>

           {upcoming.length === 0 ? (
             <div className="text-center py-8">
               <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
               <p className="text-slate-400">No upcoming clinic visits.</p>
             </div>
           ) : (
             <ul className="flex flex-col gap-4">
               {upcoming.map(a => (
                 <li key={a.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-2 hover:border-brand-500/50 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                         {new Date(a.appointment_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                         {' '} &bull; {a.appointment_time}
                       </span>
                       {/* FIX #16: Prevent double 'Dr.' prefix */}
                       <h4 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                         {a.doctor_name?.startsWith('Dr.') ? a.doctor_name : `Dr. ${a.doctor_name || 'Unknown'}`}
                       </h4>
                     </div>
                     <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-brand-500/10 text-brand-400 rounded border border-brand-500/20 shadow-glass">
                       {a.type?.replace('_', ' ')}
                     </span>
                   </div>
                   {/* FIX #14: Show symptoms/reason */}
                   {a.reason && <p className="text-slate-400 text-sm mt-1"><span className="text-slate-500 font-semibold">Reason: </span>{a.reason}</p>}
                 </li>
               ))}
             </ul>
           )}
        </div>

        {/* Visit History */}
        <div className="glass-panel p-6 border-t-4 border-slate-600">
           <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <FileText className="text-slate-400 w-5 h-5"/> Past Records
             </h3>
           </div>

           {past.length === 0 ? (
             <div className="text-center py-8">
               <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
               <p className="text-slate-400">Your health history is empty.</p>
             </div>
           ) : (
             <ul className="flex flex-col gap-4">
               {past.map(a => (
                 <li key={a.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-2 opacity-75 hover:opacity-100 transition-opacity">
                   <div className="flex justify-between items-center mb-1">
                     {/* FIX #16: Prevent double 'Dr.' prefix */}
                     <span className="text-sm font-bold text-white">
                       {a.doctor_name?.startsWith('Dr.') ? a.doctor_name : `Dr. ${a.doctor_name || 'Unknown'}`}
                     </span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${
                       a.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                     } px-2 py-0.5 rounded`}>
                       {a.status?.replace('_', ' ')}
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                     <span>{new Date(a.appointment_date).toLocaleDateString()}</span>
                     <span>Token #{a.token_no || 'NA'}</span>
                   </div>
                   {a.notes && (
                     <p className="text-slate-400 text-sm mt-2 border-t border-slate-800 pt-2 italic">&quot;{a.notes}&quot;</p>
                   )}
                 </li>
               ))}
             </ul>
           )}
        </div>

      </div>
    </div>
  );
};
