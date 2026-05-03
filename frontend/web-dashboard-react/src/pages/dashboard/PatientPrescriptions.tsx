import React, { useEffect, useState } from 'react';
import { Pill, Calendar, Stethoscope, FileText } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface Medication {
  name?: string;
  dose?: string;
  frequency?: string;
}

interface Prescription {
  id: number;
  diagnosis: string;
  medications: Medication[];
  instructions: string;
  followUpDate?: string | null;
  createdAt?: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate?: string;
}

function formatDate(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// Doctor names sometimes already start with "Dr." — guard duplicate honorific.
function doctorLabel(name?: string): string {
  if (!name) return 'Unknown Doctor';
  const cleaned = name.replace(/^dr\.?\s*/i, '').trim();
  return `Dr. ${cleaned}`;
}

export const PatientPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await apiClient('/prescriptions/my');
        if (cancelled) return;
        if (res.success) {
          setPrescriptions(res.prescriptions || []);
        } else {
          setError(res.message || 'Could not load prescriptions');
        }
      } catch (e) {
        if (!cancelled) setError('Could not load prescriptions');
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-brand-500 animate-pulse">
        Loading prescriptions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-rose-300 border border-rose-500/30">
        {error}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="glass-panel p-12 flex flex-col items-center justify-center gap-3 text-center border-slate-700/40">
        <Pill className="w-10 h-10 text-slate-500" />
        <h3 className="text-lg font-semibold text-white">No prescriptions yet</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Once a doctor issues a prescription during one of your visits, it will
          appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto">
      {prescriptions.map((rx) => (
        <article
          key={rx.id}
          className="glass-panel p-6 border-l-4 border-brand-500 hover:shadow-[0_0_24px_rgba(20,184,166,0.12)] transition-shadow"
        >
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-slate-700/50">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-brand-400" />
                {doctorLabel(rx.doctorName)}
              </h3>
              {rx.specialization && (
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                  {rx.specialization}
                </span>
              )}
            </div>
            <div className="text-right text-xs text-slate-400 leading-tight">
              <div className="flex items-center gap-1 justify-end">
                <Calendar className="w-3.5 h-3.5" />
                <span>Visit: {formatDate(rx.appointmentDate)}</span>
              </div>
              <div className="text-slate-500 mt-1">
                Issued: {formatDate(rx.createdAt)}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          {rx.diagnosis && (
            <div className="mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Diagnosis
              </span>
              <p className="text-white mt-1">{rx.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          {rx.medications && rx.medications.length > 0 && (
            <div className="mt-5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" /> Medications
              </span>
              <ul className="mt-2 flex flex-col gap-2">
                {rx.medications.map((m, idx) => (
                  <li
                    key={idx}
                    className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-3 flex flex-wrap items-baseline gap-x-4"
                  >
                    <span className="text-white font-semibold">
                      {m.name || 'Medication'}
                    </span>
                    {m.dose && (
                      <span className="text-slate-400 text-sm">
                        Dose: {m.dose}
                      </span>
                    )}
                    {m.frequency && (
                      <span className="text-slate-400 text-sm">
                        {m.frequency}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {rx.instructions && (
            <div className="mt-5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Instructions
              </span>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {rx.instructions}
              </p>
            </div>
          )}

          {/* Follow-up */}
          {rx.followUpDate && (
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" /> Follow-up: {formatDate(rx.followUpDate)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default PatientPrescriptions;
