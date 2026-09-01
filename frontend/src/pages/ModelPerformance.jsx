import React, { useEffect, useState } from 'react';
import { fetchModelMetrics, fetchFairnessMetrics } from '../services/api';
import TopBar from '../components/TopBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ShieldCheck, Database, Target, AlertCircle } from 'lucide-react';

const ModelPerformance = () => {
  const [metrics, setMetrics] = useState(null);
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, f] = await Promise.all([fetchModelMetrics(), fetchFairnessMetrics()]);
      setMetrics(m);
      setFairness(f);
    } catch (err) {
      setError('Failed to load model metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState message="Loading model metrics..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!metrics) return null;

  return (
    <div>
      <TopBar title="Model governance" subtitle="Validation, data provenance, and fairness screening" />
      <div className="px-6 py-6 space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Database className="text-blue-500" /> Training Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Model Algorithm</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{metrics.model_algorithm || 'Logistic Regression'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Target Variable</p>
            <p className="text-lg font-bold text-slate-800 mt-1">Missed next follow-up</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Training Records</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{metrics.training_records.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Test Records</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{metrics.test_records.toLocaleString()}</p>
          </div>
        </div>
        {metrics.dataset_source && (
          <div className="mt-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-950">
            <p className="font-bold">Data provenance: {metrics.dataset_source}</p>
            <p className="mt-1 text-indigo-800">{metrics.dataset_type}. {metrics.training_note}</p>
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-900 text-sm">
          <strong>Why Logistic Regression?</strong> We selected an interpretable model so hospital staff can understand exactly which patient factors contribute to prioritization. Black-box models may achieve slightly higher accuracy but fail to provide the trusted, faithful explanations required for clinical decision support.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Target className="text-indigo-500" /> Evaluation Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Accuracy', value: metrics.accuracy },
            { label: 'Precision', value: metrics.precision },
            { label: 'Recall', value: metrics.recall, highlight: true },
            { label: 'F1 Score', value: metrics.f1 },
            { label: 'ROC-AUC', value: metrics.roc_auc },
            { label: 'PR-AUC', value: metrics.pr_auc }
          ].map(m => (
            <div key={m.label} className={`p-4 rounded-lg text-center ${m.highlight ? 'bg-indigo-50 border-2 border-indigo-200 shadow-sm' : 'bg-white border border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.label}</p>
              <p className={`text-2xl font-black mt-2 ${m.highlight ? 'text-indigo-700' : 'text-slate-800'}`}>
                {(m.value * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-4 text-center">
          * Recall is highlighted because the primary goal of this tool is to identify as many at-risk patients as possible for proactive outreach.
        </p>
      </div>

      {fairness && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-green-500" /> Fairness Analysis (Age Subgroups)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                  <th className="py-3 px-4 font-semibold">Subgroup</th>
                  <th className="py-3 px-4 font-semibold">Sample Size</th>
                  <th className="py-3 px-4 font-semibold">Recall</th>
                  <th className="py-3 px-4 font-semibold">Precision</th>
                  <th className="py-3 px-4 font-semibold">False Positive Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {Object.entries(fairness).map(([group, fm]) => (
                  <tr key={group}>
                    <td className="py-3 px-4 font-medium text-slate-900">{group} years</td>
                    <td className="py-3 px-4 text-slate-600">{fm.sample_size.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">{(fm.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-slate-600">{(fm.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-slate-600">{(fm.fpr * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
            <AlertCircle className="flex-shrink-0" size={20} />
            <p>
              <strong>Disclaimer:</strong> Subgroup analysis is an initial screening step. Production deployment requires more extensive fairness evaluation across multiple protected characteristics using representative real-world data.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ModelPerformance;
