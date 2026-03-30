import React, { useEffect, useState } from 'react';
import { LogOut, Activity, LayoutDashboard, CalendarRange, Clock, Search, History, Settings, CheckSquare, Users } from 'lucide-react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

// Import View Components
import { DoctorDashboard } from './dashboard/DoctorDashboard';
import { PatientDashboard } from './dashboard/PatientDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { AdminPendingDoctors } from './dashboard/AdminPendingDoctors';
import { AdminAllUsers } from './dashboard/AdminAllUsers';
import { DoctorSchedule } from './dashboard/DoctorSchedule';
import { PatientFindDoctor } from './dashboard/PatientFindDoctor';
import { PatientHistory } from './dashboard/PatientHistory';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.me();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          authService.logout();
        }
      } catch (e) {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const renderSidebarLinks = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4 block">Administration</span>
          <NavItem id="home" icon={<LayoutDashboard className="w-5 h-5"/>} label="System Metrics" />
          <NavItem id="pending" icon={<CheckSquare className="w-5 h-5"/>} label="Pending Doctors" />
          <NavItem id="users" icon={<Users className="w-5 h-5"/>} label="All Users" />
        </>
      );
    }
    if (user?.role === 'doctor' || user?.role === 'staff') {
      return (
        <>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4 block">Overview</span>
          <NavItem id="home" icon={<Activity className="w-5 h-5"/>} label="Dashboard Status" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-6 block">Management</span>
          <NavItem id="queue" icon={<Users className="w-5 h-5"/>} label="Live Queue" />
          <NavItem id="schedule" icon={<CalendarRange className="w-5 h-5"/>} label="My Schedule" />
        </>
      );
    }
    // Patient
    return (
      <>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-4 block">My Health</span>
        <NavItem id="home" icon={<LayoutDashboard className="w-5 h-5"/>} label="Home Overview" />
        <NavItem id="token" icon={<Clock className="w-5 h-5"/>} label="My Live Token" />
        <NavItem id="schedule" icon={<CalendarRange className="w-5 h-5"/>} label="Appointments" />
        <NavItem id="history" icon={<History className="w-5 h-5"/>} label="Visit History" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-6 block">Services</span>
        <NavItem id="book" icon={<Search className="w-5 h-5"/>} label="Book Clinic" />
        <NavItem id="profile" icon={<Settings className="w-5 h-5"/>} label="Profile Setup" />
      </>
    );
  };

  const NavItem = ({ id, icon, label }: { id: string, icon: React.ReactNode, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium transition-all ${
          isActive 
            ? 'bg-brand-600/20 text-brand-400 shadow-glass-card border border-brand-500/20' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        {icon} {label}
      </button>
    );
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      home: user?.role === 'admin' ? 'Clinic OS Administrator' : 'Live Dashboard Overview',
      queue: 'Queue Control Center',
      schedule: 'Appointment Calendar',
      pending: 'Staff Access Operations',
      users: 'User Records',
      token: 'My Active Token',
      history: 'Historical Health Records',
      book: 'Find Doctor & Book',
      profile: 'Account Settings'
    };
    return titles[activeTab] || 'Dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-brand-500">
           <Activity className="w-12 h-12 animate-pulse" />
           <p className="font-mono tracking-widest uppercase">Connecting to Clinic OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex p-4 gap-6">
      
      {/* Floating Sidebar Container */}
      <aside className="w-64 glass-panel py-6 px-4 flex flex-col shadow-xl border-slate-800 relative z-20">
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight text-white px-2 mb-8">
            WaitZero<span className="text-brand-500 text-3xl leading-none">.</span>
          </h2>
          <nav className="flex flex-col gap-1.5">
            {renderSidebarLinks()}
          </nav>
        </div>
        
        <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-3 py-3 text-rose-400 font-bold bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-colors w-full mt-8">
          <LogOut className="w-5 h-5" /> Terminate Session
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 w-full relative z-10 overflow-y-auto">
        
        {/* Dynamic Nav Header */}
        <header className="glass-panel py-5 px-8 flex justify-between items-center w-full sticky top-0 z-30 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 shadow-sm">
           <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
           </div>
           
           <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
               <span className="text-sm font-bold text-white tracking-wide">{user?.name}</span>
               <span className="text-[10px] text-brand-500 font-bold tracking-widest uppercase bg-brand-500/10 px-2 py-0.5 rounded mt-1 border border-brand-500/20">{user?.role}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow-glass-card shadow-brand-500/10 border border-slate-700 relative text-brand-500 font-bold uppercase ring-2 ring-slate-900">
                {user?.name?.charAt(0) || 'U'}
                <div className="absolute right-0 bottom-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
             </div>
           </div>
        </header>

        {/* Tab Routing Switch Component */}
        <div className="pb-8">
          {user?.role === 'admin' && activeTab === 'home' && <AdminDashboard />}
          {user?.role === 'admin' && activeTab === 'pending' && <AdminPendingDoctors />}
          {user?.role === 'admin' && activeTab === 'users' && <AdminAllUsers />}

          {/* DOCTOR ROUTES */}
          {user?.role === 'doctor' && activeTab === 'home' && <div className="text-brand-400 p-8 text-center text-lg italic glass-panel border-brand-500/20 shadow-glass">Home Overview metrics building in next patch. Navigate to Live Queue.</div>}
          {user?.role === 'doctor' && activeTab === 'queue' && <DoctorDashboard user={user} />}
          {user?.role === 'doctor' && activeTab === 'schedule' && <DoctorSchedule />}

          {/* PATIENT ROUTES */}
          {user?.role === 'patient' && (activeTab === 'home' || activeTab === 'token') && <PatientDashboard setActiveTab={setActiveTab} />}
          {user?.role === 'patient' && activeTab === 'book' && <PatientFindDoctor setActiveTab={setActiveTab} />}
          {user?.role === 'patient' && (activeTab === 'schedule' || activeTab === 'history') && <PatientHistory />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
