import React, { useEffect, useState } from 'react';
import { Search, UserCheck, ShieldAlert, BadgeInfo } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminAllUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient('/auth/admin/users');
        if (res.success) setUsers(res.users || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => 
    u.name?.toLowerCase().includes(filter.toLowerCase()) || 
    u.phone?.includes(filter) || 
    u.role?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-brand-500 animate-pulse">Loading user records...</div>;

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="glass-panel p-6 mb-2 flex justify-between items-center gap-4 flex-wrap border-brand-500/20 shadow-glass">
         <div className="flex gap-4 items-center w-full md:w-auto">
           <Search className="text-brand-500 w-6 h-6" />
           <input 
             type="text" 
             placeholder="Search name, phone, or role..." 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-transparent border-none text-white text-lg font-medium outline-none placeholder:text-slate-600 w-full md:w-80" 
           />
         </div>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700/50">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No users found matching query.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-300 font-mono text-sm">#{u.id}</td>
                    <td className="p-4 text-white font-medium">{u.name}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300">{u.phone}</span>
                        <span className="text-xs text-slate-500">{u.email || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded border border-amber-500/20 flex w-max items-center gap-1"><ShieldAlert className="w-3 h-3"/> Admin</span>
                      ) : u.role === 'doctor' ? (
                        <span className="px-2 py-1 bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider rounded border border-brand-500/20 w-max flex items-center gap-1"><BadgeInfo className="w-3 h-3"/> Doctor</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-slate-700 w-max flex items-center gap-1"><UserCheck className="w-3 h-3"/> Patient</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.is_active ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Active"></span>
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" title="Pending"></span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                       {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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
