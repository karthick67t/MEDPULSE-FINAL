import React from 'react';
import { Info, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import TopBar from '../components/TopBar';

const About = () => {
  return (
    <div>
      <TopBar title="System & governance" subtitle="Decision-support operations, safeguards, and model transparency" />
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">Care operations</h2>
          <p className="text-slate-600 leading-relaxed">
            Hospitals lose track of patients who need follow-up visits. A missed follow-up is not just an empty appointment slot. It may represent treatment left incomplete, monitoring delayed, and a patient whose condition may worsen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">How FollowUpAI supports teams</h2>
          <p className="text-slate-600 leading-relaxed">
            FollowUpAI is an ML-powered care-operations platform that:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 ml-2">
            <li>Predicts which patients are most likely to miss their next follow-up appointment.</li>
            <li>Calculates a risk score and ranks patients.</li>
            <li><strong>Clearly explains WHY each patient received that risk score.</strong></li>
            <li>Recommends appropriate non-clinical interventions.</li>
            <li>Allows hospital staff to track intervention outcomes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
            <Cpu className="text-indigo-500" size={20} /> How the ML Model Works
          </h2>
          <p className="text-slate-600 leading-relaxed">
            The core predictive engine uses a Logistic Regression model trained on synthetic historical attendance data. We chose Logistic Regression specifically for its interpretability. 
            The system calculates feature contributions (using the model's coefficients) for every prediction. This means every risk score is accompanied by faithful explanations of which patient factors (e.g., previous missed appointments, distance, treatment duration) drove the prediction.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} /> Intervention Engine
          </h2>
          <p className="text-slate-600 leading-relaxed">
            The ML model strictly predicts risk. A separate, transparent, rule-based intervention engine recommends administrative and support actions based on the specific risk factors identified (e.g., suggesting transportation support if distance is the primary risk driver).
          </p>
        </section>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-amber-600" /> Safety & Ethical Design
        </h2>
        <div className="space-y-4 text-amber-800">
          <p className="font-semibold">
            Risk scores represent model-estimated likelihood of a missed follow-up and are not clinical diagnoses or certainties. Predictions support, but never replace, professional staff judgment.
          </p>
          <p>
            This development workspace uses synthetic records only. A production deployment requires privacy controls, security review, clinical governance, validation, fairness evaluation, and regulatory assessment before use with patient information.
          </p>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-white">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">
          Product roadmap
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> SMS & WhatsApp Reminders</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> Appointment Calendar Integration</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> Transportation Support Integration</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> Model Drift Monitoring</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> Continuous Fairness Monitoring</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-500"/> Real Hospital Validation</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default About;
