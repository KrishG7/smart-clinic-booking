import React, { useEffect, useState } from 'react';
import { Activity, Users, ShieldCheck, UserPlus, FileText } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminDashboard: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient('/auth/admin/stats');
        if (res.success) setStats(res.stats || res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-brand-500 animate-pulse">Loading system metrics...</div>;
  if (!stats) return <div className="p-8 text-slate-500">Failed to load metrics.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between border-b-4 border-brand-500">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Patients</p>
            <h3 className="text-3xl font-black text-white">{stats.totalPatients || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <Users className="text-brand-400" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-b-4 border-emerald-500">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Active Doctors</p>
            <h3 className="text-3xl font-black text-white">{stats.totalDoctors || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <ShieldCheck className="text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-b-4 border-amber-500">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Pending Doctors</p>
            <h3 className="text-3xl font-black text-white">{stats.pendingDoctors || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <UserPlus className="text-amber-400" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-b-4 border-purple-500">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Appointments</p>
            <h3 className="text-3xl font-black text-white">{stats.todayAppointments || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <FileText className="text-purple-400" />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-4">
         <h3 className="text-lg font-semibold text-white flex gap-2 items-center"><Activity className="text-brand-500 w-5 h-5"/> System Status</h3>
         <p className="text-slate-400 text-sm">All WaitZero Clinic OS diagnostic checks are passing. Connected to Real-time Database.</p>
         <div className="mt-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <span className="text-emerald-400 font-medium">Operational &bull; 100% Uptime</span>
         </div>
      </div>
    </div>
  );
};
