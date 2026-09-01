import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    <p className="text-sm text-slate-500 font-medium">{message}</p>
  </div>
);

export default LoadingState;
