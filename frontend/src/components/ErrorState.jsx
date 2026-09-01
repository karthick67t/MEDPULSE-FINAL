import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
      <AlertCircle className="text-red-500" size={28} />
    </div>
    <div>
      <p className="font-semibold text-slate-800 text-lg">{message}</p>
      <p className="text-sm text-slate-500 mt-1">Make sure the backend server is running on port 8000.</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <RefreshCw size={16} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;
