import React, { useEffect, useState } from 'react';
import { Search, Star, Users } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const drName = (name: string) => `Dr. ${name.replace(/^dr\.?\s*/i, '').trim()}`;

export const PatientFindDoctor: React.FC<{setActiveTab: (val: string) => void}> = ({setActiveTab}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingModal, setBookingModal] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await apiClient('/doctors');
        if (docRes.success) setDoctors(docRes.doctors || []);
        
        const specRes = await apiClient('/doctors/specializations');
        if (specRes.success) setSpecializations(specRes.specializations || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = doctors.filter(d => 
    (d.name?.toLowerCase().includes(search.toLowerCase())) &&
    (selectedSpec === '' || d.specialization === selectedSpec)
  );

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const body = {
      doctorId: bookingModal.id,
      appointmentDate: form.bkDate.value,
      appointmentTime: form.bkTime.value,
      type: form.bkType.value,
      reason: form.bkReason.value
    };
    
    try {
      const res = await apiClient('/appointments', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (res.success) {
        alert(`Booked! Your token is #${res.token?.tokenNumber || '—'}`);
        setBookingModal(null);
        setActiveTab('history');
      } else {
        alert(res.message || 'Booking failed');
      }
    } catch {
      alert('Network error');
    }
  };

  if (loading) return <div className="p-8 text-brand-500 animate-pulse">Loading clinics...</div>;

  return (
    <div className="flex flex-col gap-6 w-full mx-auto relative">
      <div className="glass-panel p-6 mb-2 flex justify-between items-center gap-4 flex-wrap border-brand-500/20 shadow-glass">
         <div className="flex gap-4 items-center w-full md:w-1/2">
           <Search className="text-brand-500 w-6 h-6" />
           <input 
             type="text" 
             placeholder="Search by doctor name..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-transparent border-none text-white text-lg font-medium outline-none placeholder:text-slate-600 w-full" 
           />
         </div>
         <select 
           value={selectedSpec} 
           onChange={(e) => setSelectedSpec(e.target.value)}
           className="bg-slate-900 border border-slate-700 text-slate-300 py-2 px-4 rounded-xl outline-none focus:border-brand-500"
         >
           <option value="">All Specializations</option>
           {specializations.map(s => <option key={s} value={s}>{s}</option>)}
         </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-500 py-12">No doctors found.</div>
        ) : (
          filtered.map((doc, idx) => (
            <div key={doc.id} className="glass-panel p-6 flex flex-col gap-4 border-t-4 border-brand-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all">
               <div className="flex gap-4 items-center border-b border-slate-800 pb-4">
                 <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl shadow-inline">
                   {['👨‍⚕️','👩‍⚕️','🧑‍⚕️','👨‍🔬','👩‍🔬'][idx % 5]}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white">{drName(doc.name)}</h3>
                   <span className="text-sm font-semibold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded">{doc.specialization || 'General'}</span>
                 </div>
               </div>

               <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                 <div className="flex flex-col items-center">
                   <span className="text-amber-400 font-bold flex items-center gap-1 text-sm"><Star className="w-4 h-4" fill="currentColor"/> {(4+Math.random()).toFixed(1)}</span>
                   <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mt-1">Rating</span>
                 </div>
                 <div className="w-px h-8 bg-slate-800"></div>
                 <div className="flex flex-col items-center">
                   <span className="text-slate-300 font-bold text-sm tracking-wide">{doc.experience_years || 0} YRS</span>
                   <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mt-1">Experience</span>
                 </div>
                 <div className="w-px h-8 bg-slate-800"></div>
                 <div className="flex flex-col items-center">
                   <span className="text-brand-400 font-bold flex items-center gap-1 text-sm"><Users className="w-4 h-4"/> {doc.max_patients_per_day || 30}</span>
                   <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mt-1">Limit</span>
                 </div>
               </div>

               <div className="flex items-center justify-between mt-auto pt-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Consultation</span>
                   <span className="text-lg font-bold text-white tracking-wider">₹{doc.consultation_fee || 500}</span>
                 </div>
                 <button 
                   onClick={() => setBookingModal(doc)}
                   className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs shadow-glass transition-colors"
                 >
                   Book Token
                 </button>
               </div>
            </div>
          ))
        )}
      </div>

      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="glass-panel w-full max-w-lg p-8 relative border-brand-500/30">
             <button onClick={() => setBookingModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/50 hover:bg-rose-500/20 rounded-full transition-colors">&times;</button>
             
             <h2 className="text-2xl font-bold text-white mb-1">Book Clinic Visit</h2>
             <p className="text-slate-400 mb-6">with {drName(bookingModal.name)} &bull; <span className="text-brand-400">{bookingModal.specialization}</span></p>

             <form onSubmit={handleBook} className="flex flex-col gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Select Date</label>
                 <input type="date" name="bkDate" required min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-500 transition-colors" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Select Time</label>
                   <select name="bkTime" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-500">
                     {['09:00:00','09:30:00','10:00:00','10:30:00','11:00:00','14:00:00','14:30:00','15:00:00'].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Visit Type</label>
                   <select name="bkType" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-500">
                     <option value="regular">Regular</option>
                     <option value="follow_up">Follow Up</option>
                     <option value="emergency">Emergency</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Symptoms Summary</label>
                 <textarea name="bkReason" placeholder="Describe your symptoms briefly..." required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-500 transition-colors h-24 resize-none"></textarea>
               </div>
               
               <button type="submit" className="mt-4 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg py-4 rounded-xl shadow-glass transition-colors uppercase tracking-widest">
                 Confirm Booking
               </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};
