import React, { useEffect, useState } from 'react';
import { Mail, Phone, BookOpen, Clock, Activity } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminPendingDoctors: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await apiClient('/auth/admin/pending-doctors');
      if (res.success) setPending(res.doctors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approveDoc = async (uid: number) => {
    try {
      const res = await apiClient(`/auth/admin/approve-doctor/${uid}`, { method: 'PUT' });
      if (res.success) fetchPending();
      else alert(res.message || 'Failed to approve');
    } catch {
      alert('Network error');
    }
  };

  const rejectDoc = async (uid: number) => {
    if (!window.confirm('Are you sure you want to reject this doctor profile?')) return;
    try {
      const res = await apiClient(`/auth/admin/reject-doctor/${uid}`, { method: 'DELETE' });
      if (res.success) fetchPending();
      else alert(res.message || 'Failed to reject');
    } catch {
      alert('Network error');
    }
  };

  if (loading) {
    return <div className="p-8 text-brand-500 animate-pulse">Loading pending profiles...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {pending.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Caught up!</h3>
          <p className="text-slate-400">There are no pending doctor accounts waiting for approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map(doc => (
            <div key={doc.id} className="glass-panel p-6 border-t-4 border-amber-500 hover:shadow-glass-card transition-all">
               <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                 <div>
                   <h4 className="text-lg font-bold text-white mb-1">Dr. {doc.name}</h4>
                   <span className="text-sm text-brand-400 font-semibold tracking-wide uppercase px-2 py-0.5 bg-brand-500/10 rounded">{doc.specialization || 'General'}</span>
                 </div>
               </div>

               <div className="flex flex-col gap-2 mb-6">
                 <p className="text-sm text-slate-300 flex gap-2 items-center"><Phone className="w-4 h-4 text-slate-500" /> {doc.phone}</p>
                 <p className="text-sm text-slate-300 flex gap-2 items-center"><Mail className="w-4 h-4 text-slate-500" /> {doc.email || 'No email provided'}</p>
                 <p className="text-sm text-slate-300 flex gap-2 items-center"><BookOpen className="w-4 h-4 text-slate-500" /> {doc.qualification || 'No qualification listed'}</p>
                 <p className="text-sm text-slate-300 flex gap-2 items-center"><Clock className="w-4 h-4 text-slate-500" /> {doc.experience_years || 0} years experience</p>
                 <p className="text-sm text-slate-300 flex gap-2 items-center"><Activity className="w-4 h-4 text-slate-500" /> ₹{doc.consultation_fee || 500} consult fee</p>
               </div>

               <div className="flex gap-3 mt-auto">
                 <button onClick={() => approveDoc(doc.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors shadow-glass">
                   ✓ Approve Profile
                 </button>
                 <button onClick={() => rejectDoc(doc.id)} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 rounded-lg border border-rose-500/20 transition-colors">
                   ✗ Delete
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
