import React, { useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, Building2, CircleCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordInput = ({ value, onChange, placeholder = 'Enter password', label }) => {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <div className="relative mt-2">
        <LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type={visible ? 'text' : 'password'} 
          value={value} 
          onChange={(event) => onChange(event.target.value)} 
          placeholder={placeholder} 
          className="soft-input w-full pl-10 pr-12 py-3.5 text-sm" 
        />
        <button 
          type="button" 
          onClick={() => setVisible(!visible)} 
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-neon-cyan transition-colors"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
};

const AuthBrand = () => (
  <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative overflow-hidden p-14 xl:p-20 flex-col justify-between product-hero border-none rounded-none">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative flex items-center gap-3"
    >
      <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-600 text-white flex items-center justify-center shadow-neon-cyan">
        <Activity size={24} strokeWidth={2.5} />
      </span>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-white">FollowUp<span className="text-neon-cyan">AI</span></p>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neon-purple">Care intelligence</p>
      </div>
    </motion.div>

    <div className="relative max-w-lg z-10">
      <motion.p 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-neon-cyan mb-4"
      >
        Next-Generation Healthcare
      </motion.p>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-5xl xl:text-6xl leading-[1.1] tracking-[-0.04em] font-extrabold text-white"
      >
        Every follow-up deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">next step.</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-6 text-slate-300 leading-relaxed text-lg"
      >
        The care-operations workspace powered by generative AI. See risk early, act with context, and protect continuity of care.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-10 space-y-5"
      >
        {[
          'Explainable patient prioritization', 
          'AI-Generated follow-up messaging', 
          'Real-time WebSocket alerts & tracking'
        ].map((item, i) => (
          <motion.div 
            key={item} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + (i * 0.2) }}
            className="flex items-center gap-4 text-sm font-medium text-slate-200"
          >
            <span className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Check size={16} />
            </span>
            {item}
          </motion.div>
        ))}
      </motion.div>
    </div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 2 }}
      className="relative flex items-center gap-3 text-xs font-medium text-slate-400 mt-10"
    >
      <ShieldCheck size={16} className="text-neon-purple" />
      Development workspace · Synthetic records only · No PHI
    </motion.div>
  </div>
);

const Login = () => {
  const { login, signup } = useAuth();
  const [screen, setScreen] = useState('signin');
  const [form, setForm] = useState({ name: '', organization: 'MEDPULSE', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));
  const passwordScore = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;

  const submit = (event) => {
    event.preventDefault(); setError(''); setNotice('');
    if (!form.email.includes('@')) return setError('Enter a valid work email address.');
    if (screen === 'forgot') { setNotice('If an account exists for this address, password reset instructions have been simulated. No email was sent.'); return; }
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (screen === 'signup') {
      if (!form.name.trim()) return setError('Enter your full name.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
      signup(form); return;
    }
    login(form);
  };

  const title = { signin: 'Welcome back', signup: 'Create your workspace', forgot: 'Reset your password' }[screen];
  const subtitle = { signin: 'Sign in to continue to your care-operations workspace.', signup: 'Start a secure workspace for your care team.', forgot: 'Enter your work email and we’ll help you regain access.' }[screen];
  
  return (
    <div className="min-h-screen bg-hollywood-dark flex selection:bg-neon-cyan/30 selection:text-white">
      <AuthBrand />
      
      <main className="flex-1 flex items-center justify-center p-5 sm:p-10 relative overflow-hidden">
        {/* Animated background glows for right side */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="w-full max-w-[440px] z-10">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-500 text-white flex items-center justify-center shadow-neon-cyan">
              <Activity size={20} />
            </span>
            <p className="text-xl font-extrabold text-white">FollowUp<span className="text-neon-cyan">AI</span></p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={screen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {screen !== 'signin' && (
                <button 
                  onClick={() => { setScreen('signin'); setError(''); setNotice(''); }} 
                  className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-neon-cyan transition-colors"
                >
                  <ArrowLeft size={16} />Back to sign in
                </button>
              )}

              <div className="premium-card p-7 sm:p-9">
                <div className="flex items-start justify-between gap-5 relative z-10">
                  <div>
                    <p className="eyebrow">MEDPULSE secure access</p>
                    <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-white mt-2">{title}</h2>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{subtitle}</p>
                  </div>
                  <span className="p-3 rounded-2xl bg-white/5 border border-white/10 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                    {screen === 'forgot' ? <LockKeyhole size={20} /> : <Sparkles size={20} />}
                  </span>
                </div>

                <form onSubmit={submit} className="mt-8 space-y-5 relative z-10">
                  {screen === 'signup' && (
                    <>
                      <label className="block">
                        <span className="text-sm font-bold text-slate-300">Full name</span>
                        <div className="relative mt-2">
                          <UserRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input value={form.name} onChange={(event) => setField('name')(event.target.value)} placeholder="Dr. Jordan Lee" className="soft-input w-full pl-10 py-3.5 text-sm" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-slate-300">Organization</span>
                        <div className="relative mt-2">
                          <Building2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input value={form.organization} onChange={(event) => setField('organization')(event.target.value)} placeholder="MEDPULSE" className="soft-input w-full pl-10 py-3.5 text-sm" />
                        </div>
                      </label>
                    </>
                  )}

                  <label className="block">
                    <span className="text-sm font-bold text-slate-300">Work email</span>
                    <div className="relative mt-2">
                      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" value={form.email} onChange={(event) => setField('email')(event.target.value)} placeholder="you@organization.com" className="soft-input w-full pl-10 py-3.5 text-sm" />
                    </div>
                  </label>

                  {screen !== 'forgot' && (
                    <>
                      <PasswordInput label="Password" value={form.password} onChange={setField('password')} placeholder="At least 8 characters" />
                      {screen === 'signup' && (
                        <>
                          <div className="flex gap-1.5 -mt-2">
                            {[1, 2, 3, 4].map((step) => (
                              <span 
                                key={step} 
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                  step <= passwordScore 
                                    ? (passwordScore >= 3 ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]') 
                                    : 'bg-white/10'
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 -mt-3">Use 8+ characters with uppercase, number, and symbol.</p>
                          <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="Repeat your password" />
                        </>
                      )}
                    </>
                  )}

                  {screen === 'signin' && (
                    <div className="flex justify-end -mt-1">
                      <button type="button" onClick={() => { setScreen('forgot'); setError(''); }} className="text-xs font-bold text-neon-cyan hover:text-white transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm font-medium text-rose-400">
                      {error}
                    </motion.p>
                  )}
                  {notice && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm leading-relaxed text-emerald-400">
                      {notice}
                    </motion.p>
                  )}

                  <button className="btn-primary w-full mt-2 group">
                    {screen === 'signin' ? 'Sign in securely' : screen === 'signup' ? 'Create secure workspace' : 'Send reset instructions'}
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="relative z-10">
                  {screen === 'signin' && <p className="text-center text-sm text-slate-400 mt-7">New to MEDPULSE? <button onClick={() => setScreen('signup')} className="font-bold text-neon-cyan hover:text-white transition-colors">Create an account</button></p>}
                  {screen === 'signup' && <p className="text-center text-sm text-slate-400 mt-7">Already have an account? <button onClick={() => setScreen('signin')} className="font-bold text-neon-cyan hover:text-white transition-colors">Sign in</button></p>}
                </div>
                
                <div className="relative z-10 mt-7 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <CircleCheck size={13} className="text-neon-cyan" />
                  Local prototype — credentials are simulated
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Login;
