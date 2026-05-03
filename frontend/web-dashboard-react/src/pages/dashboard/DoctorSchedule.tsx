import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, Search, Pill, X, Plus, Trash2, History, Clock, FileText } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const DoctorSchedule: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Prescription Modal State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medications, setMedications] = useState([{ name: '', dose: '', frequency: '' }]);
  const [submittingRx, setSubmittingRx] = useState(false);

  // Patient History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const meRes = await apiClient('/auth/me');
      const userId = meRes?.user?.id;
      const docRes = await apiClient('/doctors');
      let docId = 1;
      if (docRes.success && Array.isArray(docRes.doctors)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mine = docRes.doctors.find((d: any) => d.user_id === userId);
        if (mine) docId = mine.id;
      }

      const res = await apiClient(`/appointments/doctor/${docId}?date=${selectedDate}`);
      if (res.success) setAppointments(res.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(a => 
    a.patient_name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.reason?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenPrescriptionModal = (appt: any) => {
    setSelectedAppointment(appt);
    setDiagnosis('');
    setInstructions('');
    setFollowUpDate('');
    setMedications([{ name: '', dose: '', frequency: '' }]);
    setIsModalOpen(true);
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dose: '', frequency: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    // Filter out empty medications
    const validMedications = medications.filter(m => m.name.trim() !== '');

    setSubmittingRx(true);
    try {
      const res = await apiClient('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          diagnosis,
          instructions,
          followUpDate: followUpDate || null,
          medications: validMedications
        })
      });

      if (res.success) {
        alert('Prescription issued successfully!');
        setIsModalOpen(false);
        fetchSchedule(); // Refresh the list to reflect status changes
      } else {
        alert(res.message || 'Failed to issue prescription');
      }
    } catch (err) {
      alert('Error issuing prescription');
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleOpenPatientHistory = async (patientId: number) => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await apiClient(`/patients/${patientId}/history`);
      if (res.success) {
        setPatientHistory(res.history);
      }
    } catch (e) {
      console.error('Failed to fetch patient history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto relative">
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
         <div className="flex items-center gap-3">
           <input 
             type="date"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-brand-500"
             style={{ colorScheme: 'dark' }}
           />
           <button 
             onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-semibold uppercase tracking-wider text-sm transition-colors shadow-[0_0_10px_rgba(13,148,136,0.2)]"
           >
             <CalendarRange className="w-4 h-4"/> Today's Slate
           </button>
         </div>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-700/50 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-brand-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
               Loading Schedule...
            </div>
          </div>
        )}
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
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(!loading && filtered.length === 0) ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">No appointments found matching constraints.</td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-white font-mono font-bold text-lg">#{a.token_no || '—'}</td>
                    <td className="p-4 text-slate-300 font-mono text-sm">{a.appointment_time || '—'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleOpenPatientHistory(a.patient_id)}
                        className="text-white font-medium hover:text-brand-400 transition-colors flex items-center gap-2 group"
                        title="View Patient History"
                      >
                        {a.patient_name || 'Patient'}
                        <History className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
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
                    <td className="p-4 text-right">
                      {(a.status === 'completed' || a.status === 'in_progress') && (
                        <button 
                          onClick={() => handleOpenPrescriptionModal(a)}
                          className="px-3 py-1 bg-brand-600/20 text-brand-400 hover:bg-brand-500 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold uppercase ml-auto border border-brand-500/30"
                        >
                          <Pill className="w-3 h-3" /> Issue Rx
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient History Modal */}
      {isHistoryModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-brand-500" />
                Patient Medical History
              </h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-brand-500 font-bold uppercase tracking-widest animate-pulse">Loading Records...</div>
                </div>
              ) : patientHistory ? (
                <div className="flex flex-col gap-8">
                  {/* Past Appointments Section */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Clock className="w-4 h-4 text-slate-400" /> Past Appointments
                    </h3>
                    {patientHistory.appointments?.length > 0 ? (
                      <div className="grid gap-3">
                        {patientHistory.appointments.map((appt: any) => (
                          <div key={appt.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-brand-400 font-bold text-sm">
                                {new Date(appt.appointment_date).toLocaleDateString()} @ {appt.appointment_time}
                              </span>
                              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold uppercase tracking-wider">
                                {appt.status}
                              </span>
                            </div>
                            <div className="text-white text-sm mb-1"><span className="text-slate-400">Doctor:</span> {appt.doctor_name}</div>
                            <div className="text-white text-sm"><span className="text-slate-400">Reason:</span> {appt.reason || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm italic p-4 bg-slate-800/20 rounded-lg border border-slate-800/50 text-center">No past appointments found.</div>
                    )}
                  </section>

                  {/* Past Prescriptions Section */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Past Prescriptions
                    </h3>
                    {patientHistory.prescriptions?.length > 0 ? (
                      <div className="grid gap-3">
                        {patientHistory.prescriptions.map((rx: any) => (
                          <div key={rx.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-emerald-400 font-bold text-sm">
                                {new Date(rx.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                Issued by {rx.doctor_name}
                              </span>
                            </div>
                            <div className="mb-3">
                              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Diagnosis</div>
                              <div className="text-white text-base">{rx.diagnosis}</div>
                            </div>
                            {rx.medications && rx.medications.length > 0 && (
                              <div className="mb-3">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Medications</div>
                                <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-2">
                                  {rx.medications.map((m: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 text-sm border-b border-slate-800 last:border-0 py-1 px-1">
                                      <span className="text-white font-medium flex-1">{m.name}</span>
                                      <span className="text-slate-400 w-24">{m.dose}</span>
                                      <span className="text-brand-400 w-20 text-right">{m.frequency}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {rx.instructions && (
                              <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Instructions</div>
                                <div className="text-slate-300 text-sm italic">"{rx.instructions}"</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm italic p-4 bg-slate-800/20 rounded-lg border border-slate-800/50 text-center">No past prescriptions found.</div>
                    )}
                  </section>
                </div>
              ) : null}
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50 rounded-b-2xl">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-2 rounded-lg font-bold text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Prescription Modal */}
      {isModalOpen && selectedAppointment && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-500" />
                Issue Prescription
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-slate-400">Patient Details</span>
                <span className="text-lg text-white font-medium">{selectedAppointment.patient_name}</span>
                <span className="text-sm text-slate-400">Reason: {selectedAppointment.reason || 'None provided'}</span>
              </div>

              <form id="rx-form" onSubmit={handleSubmitPrescription} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">Diagnosis</label>
                  <input 
                    type="text" 
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="E.g., Viral Fever"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-300">Medications</label>
                    <button type="button" onClick={handleAddMedication} className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 uppercase">
                      <Plus className="w-3 h-3" /> Add Medication
                    </button>
                  </div>
                  
                  {medications.map((med, index) => (
                    <div key={index} className="flex gap-2 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 relative group">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          placeholder="Medicine Name" 
                          required={index === 0}
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded text-sm px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Dosage (e.g. 500mg)" 
                          value={med.dose}
                          onChange={(e) => handleMedicationChange(index, 'dose', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded text-sm px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Frequency (e.g. 1-0-1)" 
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded text-sm px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      {medications.length > 1 && (
                        <button type="button" onClick={() => handleRemoveMedication(index)} className="p-2 text-rose-500/50 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">Instructions / Advice</label>
                  <textarea 
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="E.g., Drink plenty of water, rest for 2 days"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">Follow-up Date (Optional)</label>
                  <input 
                    type="date" 
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full md:w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="rx-form"
                disabled={submittingRx}
                className="px-6 py-2 rounded-lg font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition shadow-[0_0_15px_rgba(13,148,136,0.4)] flex items-center gap-2"
              >
                {submittingRx ? 'Saving...' : 'Issue Prescription'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
