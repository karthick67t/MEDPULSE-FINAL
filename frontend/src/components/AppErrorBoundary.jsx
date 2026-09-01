import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <section className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600">FollowUpAI</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Let’s reload your workspace</h1>
            <p className="mt-3 text-sm text-slate-600">A saved browser session was incompatible with this version of the app.</p>
            <button onClick={() => window.location.assign('/login')} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">
              Return to sign in
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
