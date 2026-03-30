import React from 'react';
import HeroCard from '../components/HeroCard';
import { landingStats } from '../data/mockData';
import { ArrowRight, Activity } from 'lucide-react';

interface LandingPageProps {
  readonly className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen relative overflow-hidden bg-slate-950 ${className}`}>
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-brand-500" />
          <span className="text-2xl font-bold tracking-tight text-white">WaitZero<span className="text-brand-500 text-3xl leading-none">.</span></span>
        </div>
        <div className="flex gap-4">
          <button className="text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors">Patients</button>
          <button className="text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors">Clinics</button>
          <a href="/login" className="glass-button px-6 py-2 flex items-center gap-2">
            Login <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-8 mt-12">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Clinic OS 2.0 is Live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-8 leading-tight max-w-4xl">
          Eliminate Waiting <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Forever.</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mb-12">
          The elite dynamic queue and schedule management system orchestrating clinics intelligently. 
          Stop guessing. Start knowing.
        </p>

        <a href="/login" className="glass-button px-8 py-4 text-lg font-semibold flex items-center gap-2 mb-20 shadow-brand-500/20 shadow-xl">
          Enter Clinic OS <ArrowRight className="w-5 h-5" />
        </a>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          {landingStats.map(stat => (
            <HeroCard key={stat.id} title={stat.label} value={stat.value.toString()} trend={stat.trend} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
