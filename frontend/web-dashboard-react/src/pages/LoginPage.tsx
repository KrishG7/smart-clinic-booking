import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { AuthResponse } from '../services/authService';
import { ArrowRight, Activity, ShieldCheck, Mail, Lock, Phone, User as UserIcon, MapPin, Award, Stethoscope } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [regSpecialization, setRegSpecialization] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regClinicAddress, setRegClinicAddress] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  const navigate = useNavigate();

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setRegClinicAddress(data.display_name);
          } else {
            setRegClinicAddress(`${latitude}, ${longitude}`);
          }
        } catch (_err) {
          setError("Failed to geocode location.");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setError("Unable to retrieve your location");
        setDetectingLocation(false);
      }
    );
  };

  const handleAuthRedirect = (res: AuthResponse) => {
    if (res.success && res.token && res.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/dashboard');
    } else {
      setError(res.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(phone, password);
      handleAuthRedirect(res);
    } catch (_err) {
      setError('Connection refused. Is WaitZero API running?');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: regName,
        phone,
        password,
        role: regRole,
        ...(regRole === 'doctor' && {
          specialization: regSpecialization || 'General Medicine',
          qualification: regQualification,
          clinicAddress: regClinicAddress,
        })
      };
      const res = await authService.register(payload);
      if (res.success) {
        if (regRole === 'doctor') {
          setRegSuccessMessage('Application received. You can login after you are verified by Admin.');
          setLoading(false);
        } else {
          // Patient auto-logs in
          handleAuthRedirect(res);
        }
      } else {
        setError(res.message || 'Registration failed.');
        setLoading(false);
      }
    } catch (_err) {
      setError('Connection refused.');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!otpSent) {
        const res = await authService.sendOtp(phone);
        if (res.success) {
          setOtpSent(true);
          setError(null);
        } else {
          setError(res.message || 'Failed to send OTP.');
        }
        setLoading(false);
      } else {
        const res = await authService.verifyOtp(phone, otp);
        handleAuthRedirect(res);
      }
    } catch (_err) {
      setError('Connection Error.');
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'doctor' | 'patient' | 'admin') => {
    const phones = { doctor: '9876543211', patient: '9876543210', admin: '9876543212' };
    const p = phones[role];
    setPhone(p);
    setPassword('test123'); // Exact password mapped in WaitZero MySQL seed
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(p, 'test123');
      handleAuthRedirect(res);
    } catch (_err) {
      setError('Demo failed.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950">
      
      {/* Left Marketing Panel */}
      <div className="md:w-5/12 hidden md:flex flex-col justify-between p-12 bg-brand-950 border-r border-brand-900/50 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <Activity className="w-8 h-8 text-brand-500" />
            <span className="text-2xl font-bold tracking-tight text-white">WaitZero<span className="text-brand-500">.</span></span>
          </div>

          <h1 className="text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            Clinic OS <br/>
            <span className="text-brand-400">Security Gate.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-md">
            The world's fastest way to eliminate hospital queues entirely using predictive mathematical modeling.
          </p>
        </div>

        <div className="relative z-10 glass-card p-6 border-brand-900/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-900 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-white font-semibold">End-to-End Encrypted</p>
            <p className="text-sm text-slate-400">HIPAA compliant architecture.</p>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 relative z-10 py-8">
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">{isRegisterMode ? "Create an Account" : "Welcome Back"}</h2>
            <p className="text-slate-400">{isRegisterMode ? "Sign up to access WaitZero Clinic OS" : "Sign in to your WaitZero dashboard"}</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          {!isRegisterMode && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => demoLogin('doctor')} className="py-2.5 px-4 rounded-xl border border-brand-900/50 bg-brand-950/30 hover:bg-brand-900/50 transition-colors text-slate-300 text-sm font-medium text-center shadow-lg">Doctor</button>
                <button onClick={() => demoLogin('patient')} className="py-2.5 px-4 rounded-xl border border-brand-900/50 bg-brand-950/30 hover:bg-brand-900/50 transition-colors text-slate-300 text-sm font-medium text-center shadow-lg">Patient</button>
                <button onClick={() => demoLogin('admin')} className="py-2.5 px-4 rounded-xl border border-brand-900/50 bg-brand-950/30 hover:bg-brand-900/50 transition-colors text-slate-300 text-sm font-medium text-center shadow-lg">Admin</button>
              </div>

              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Or use credentials</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </>
          )}

          {isRegisterMode ? (
            regSuccessMessage ? (
              <div className="text-center space-y-4 py-8 animate-fadeIn">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                   <ShieldCheck className="w-8 h-8 text-emerald-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Application Received</h3>
                 <p className="text-slate-400">{regSuccessMessage}</p>
                 <button onClick={() => { setIsRegisterMode(false); setRegSuccessMessage(null); }} className="mt-8 py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors shadow-lg">
                   Return to Login
                 </button>
              </div>
            ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" className="peer sr-only" name="role" value="patient" checked={regRole === 'patient'} onChange={() => setRegRole('patient')} />
                  <div className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-center text-slate-400 peer-checked:border-brand-500 peer-checked:text-brand-400 peer-checked:bg-brand-500/10 transition-colors font-medium">Patient</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" className="peer sr-only" name="role" value="doctor" checked={regRole === 'doctor'} onChange={() => setRegRole('doctor')} />
                  <div className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-center text-slate-400 peer-checked:border-brand-500 peer-checked:text-brand-400 peer-checked:bg-brand-500/10 transition-colors font-medium">Doctor</div>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Sanjay Mehta" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="9876543210" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                </div>
              </div>

              {regRole === 'doctor' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300 block">Specialization</label>
                    <div className="relative">
                      <Stethoscope className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" value={regSpecialization} onChange={e => setRegSpecialization(e.target.value)} required placeholder="e.g. Cardiology" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300 block">Qualification</label>
                    <div className="relative">
                      <Award className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" value={regQualification} onChange={e => setRegQualification(e.target.value)} required placeholder="e.g. MBBS, MD" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-sm font-medium text-slate-300 block">Clinic Address</label>
                      <button type="button" onClick={handleAutoDetectLocation} disabled={detectingLocation} className="text-xs text-brand-400 hover:text-brand-300 disabled:opacity-50 flex items-center gap-1 font-semibold transition-colors">
                        <MapPin className="w-3 h-3" />
                        {detectingLocation ? 'Detecting...' : 'Auto Detect'}
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                      <textarea value={regClinicAddress} onChange={e => setRegClinicAddress(e.target.value)} required placeholder="123 Health Ave, Medical District" rows={2} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium resize-none" />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="w-full mt-4 py-3.5 glass-button shadow-brand-500/20 shadow-lg text-white font-bold rounded-xl flex justify-center items-center gap-2">
                {loading ? 'Creating Account...' : 'Sign Up Securely'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            )

          ) : !isOtpMode ? (
            
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="9876543210" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 glass-button shadow-brand-500/20 shadow-lg text-white font-bold rounded-xl flex justify-center items-center gap-2">
                {loading ? 'Authenticating...' : 'Sign In Securely'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required disabled={otpSent} placeholder="9876543210" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono disabled:opacity-50" />
                </div>
              </div>
              
              {otpSent && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-sm font-medium text-brand-400 block">Enter 6-digit OTP Code</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-brand-500/50 rounded-xl text-brand-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono tracking-widest text-center text-xl" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className={`w-full py-3.5 shadow-lg text-white font-bold rounded-xl flex justify-center items-center gap-2 ${otpSent ? 'glass-button shadow-brand-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}>
                {loading ? 'Processing...' : (otpSent ? 'Verify OTP' : 'Send Authentication Code')}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3 text-center mt-6">
            {!isRegisterMode && (
              <button onClick={() => { setIsOtpMode(!isOtpMode); setOtpSent(false); }} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                {isOtpMode ? 'Use Password Login instead' : 'Switch to SMS OTP Login'}
              </button>
            )}
            
            <button onClick={() => { setIsRegisterMode(!isRegisterMode); setIsOtpMode(false); }} className="text-brand-400 hover:text-brand-300 text-sm font-bold transition-colors">
              {isRegisterMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
