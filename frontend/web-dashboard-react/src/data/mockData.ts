export interface Statistic {
  id: string;
  label: string;
  value: string | number;
  trend?: string;
}

export interface QueueItem {
  id: string;
  patientName: string;
  status: 'Waiting' | 'In Consultation' | 'Completed';
  estimatedWaitTime: number;
}

export const landingStats: Statistic[] = [
  { id: '1', label: 'Average Wait Time', value: '12m', trend: '-5m' },
  { id: '2', label: 'Patient Satisfaction', value: '4.9/5' },
  { id: '3', label: 'Clinics Onboarded', value: '150+' },
];

export const liveQueue: QueueItem[] = [
  { id: 'Q-001', patientName: 'Krish G.', status: 'In Consultation', estimatedWaitTime: 0 },
  { id: 'Q-002', patientName: 'John Doe', status: 'Waiting', estimatedWaitTime: 15 },
  { id: 'Q-003', patientName: 'Jane Smith', status: 'Waiting', estimatedWaitTime: 25 },
];
