import React, { useState } from 'react';
import { Activity, ArrowRight, ShieldCheck, Mail, LockKeyhole, UserRound, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const PasswordInput = ({ value, onChange, placeholder = 'Enter password', label }) => {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative mt-1.5">
        <LockKeyhole size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="password" 
          value={value} 
          onChange={(event) => onChange(event.target.value)} 
          placeholder={placeholder} 
          className="soft-input w-full pl-10 pr-4 py-3 text-sm" 
        />
      </div>
    </label>
  );
};

const AuthBrand = () => (
  <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
          <Activity size={22} strokeWidth={2.5} className="text-white" />
        </span>
        <span className="text-xl font-bold tracking-tight">FollowUpAI</span>
      </div>
    </div>

    <div className="relative z-10 max-w-lg mt-20 mb-auto">
      <h1 className="text-4xl xl:text-5xl leading-[1.1] font-bold tracking-tight text-white mb-6">
        Predict Early. Explain Clearly. Intervene Sooner.
      </h1>
      <p className="text-primary-100 leading-relaxed text-lg mb-10">
        An intelligent patient follow-up command center that helps hospital staff identify patients at risk of missing their next appointment, understand why, and prioritize intervention.
      </p>
      
      <div className="space-y-6">
        {[
          { title: 'Predict', desc: 'Identify high-risk patients before they miss an appointment.' },
          { title: 'Explain', desc: 'Understand the driving factors behind every risk score.' },
          { title: 'Act', desc: 'Proactively intervene to protect continuity of care.' }
        ].map((feature, i) => (
          <div key={i} className="flex gap-4">
            <div className="mt-1">
              <ShieldCheck size={20} className="text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{feature.title}</h3>
              <p className="text-primary-200 text-sm mt-1">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 text-xs font-medium text-primary-300 mt-10">
      Secure Healthcare Intelligence Platform
    </div>
  </div>
);

const Login = () => {
  const { login, signup } = useAuth();
  const [screen, setScreen] = useState('signin');
  const [form, setForm] = useState({ name: '', organization: 'MEDPULSE', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  
  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault(); setError('');
    if (!form.email.includes('@')) return setError('Enter a valid work email address.');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (screen === 'signup') {
      if (typeof form.name !== 'string' || !form.name.trim()) {
        return setError('Enter your full name.');
      }
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
      signup(form); return;
    }
    login(form);
  };

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary-100 selection:text-primary-900">
      <AuthBrand />
      
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <span className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
              <Activity size={20} className="text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">FollowUpAI</span>
          </div>

          <div>
            <div key={screen}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  {screen === 'signin' ? 'Sign in to FollowUpAI' : 'Create your account'}
                </h2>
                <p className="text-slate-500 mt-2 text-sm">
                  {screen === 'signin' 
                    ? 'Enter your credentials to access the command center.' 
                    : 'Start your intelligent follow-up workspace.'}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                {screen === 'signup' && (
                  <>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700">Full Name</span>
                      <div className="relative mt-1.5">
                        <UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={form.name} onChange={(event) => setField('name')(event.target.value)} placeholder="Dr. Sarah Chen" className="soft-input w-full pl-10 py-3 text-sm" />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700">Organization</span>
                      <div className="relative mt-1.5">
                        <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={form.organization} onChange={(event) => setField('organization')(event.target.value)} placeholder="Hospital Name" className="soft-input w-full pl-10 py-3 text-sm" />
                      </div>
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Work Email</span>
                  <div className="relative mt-1.5">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={form.email} onChange={(event) => setField('email')(event.target.value)} placeholder="name@hospital.org" className="soft-input w-full pl-10 py-3 text-sm" />
                  </div>
                </label>

                <PasswordInput label="Password" value={form.password} onChange={setField('password')} placeholder="••••••••" />
                
                {screen === 'signup' && (
                  <PasswordInput label="Confirm Password" value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="••••••••" />
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full mt-2">
                  {screen === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-600">
                {screen === 'signin' ? (
                  <>Don't have an account? <button onClick={() => {setScreen('signup'); setError('');}} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Sign up</button></>
                ) : (
                  <>Already have an account? <button onClick={() => {setScreen('signin'); setError('');}} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Sign in</button></>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
