
import React, { useState, useEffect } from 'react';
import { AppView, Business, ReviewPlatform } from './types';
import Dashboard from './components/Dashboard';
import ReviewFlow from './components/ReviewFlow';
import { LayoutDashboard, MessageSquare, Loader2, AlertCircle, RefreshCcw, Smartphone } from 'lucide-react';

// Mock database for multi-tenancy simulation
const BUSINESS_REGISTRY: Record<string, Business> = {
  'merlin-cambridge-001': {
    id: 'merlin-cambridge-001',
    name: 'Merlin Cambridge',
    ownerName: 'Alex Johnson',
    email: 'admin@merlin-hospitality.com',
    whatsappNumber: '919876543210',
    plan: 'pro',
    platforms: [ReviewPlatform.GOOGLE, ReviewPlatform.FACEBOOK, ReviewPlatform.ZOMATO, ReviewPlatform.SWIGGY, ReviewPlatform.JUSTDIAL],
    team: [
      { id: '1', name: 'Sarah', role: 'editor', status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { id: '2', name: 'Mike', role: 'viewer', status: 'online', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' }
    ]
  },
  'crystal-lounge-002': {
    id: 'crystal-lounge-002',
    name: 'Crystal Lounge',
    ownerName: 'Elena Ross',
    email: 'hello@crystallounge.res',
    whatsappNumber: '447890123456',
    plan: 'pro',
    platforms: [ReviewPlatform.GOOGLE, ReviewPlatform.YELP, ReviewPlatform.TRIPADVISOR, ReviewPlatform.FACEBOOK],
    team: [
      { id: '1', name: 'James', role: 'admin', status: 'online', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
    ]
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView | 'error'>('dashboard');
  const [activeBusiness, setActiveBusiness] = useState<Business>(BUSINESS_REGISTRY['merlin-cambridge-001']);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigation = () => {
      setIsLoading(true);
      setErrorMsg(null);
      const params = new URLSearchParams(window.location.search);
      const bizId = params.get('biz') || params.get('loc') || params.get('id');
      
      if (bizId) {
        const cleanId = bizId.replace(/[^a-zA-Z0-9-_]/g, '');
        if (BUSINESS_REGISTRY[cleanId]) {
          setActiveBusiness(BUSINESS_REGISTRY[cleanId]);
          setView('client-flow');
        } else {
          setErrorMsg(`Business Node [${cleanId}] not found in the registry.`);
          setView('error');
        }
      } else {
        setView('dashboard');
      }
      
      // Artificial delay for high-fidelity "Sync" feeling
      setTimeout(() => setIsLoading(false), 800);
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-primary" size={48} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Synchronizing Grid...</p>
        </div>
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full glass-panel p-10 rounded-[3rem] border-white shadow-2xl text-center space-y-8 animate-enter">
          <div className="size-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Access Failure</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {errorMsg || "The requested reputation node could not be reached."}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = window.location.origin + window.location.pathname}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl"
          >
            <RefreshCcw size={18} /> Restart Handshake
          </button>
        </div>
      </div>
    );
  }

  const simulateClientAccess = () => {
    // Avoid pushState security errors in sandboxed origins
    setIsLoading(true);
    setView('client-flow');
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="h-full bg-slate-100 relative overflow-hidden font-sans selection:bg-primary/10 selection:text-primary">
      {/* Visual Ambience */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 h-full flex flex-col">
        {view === 'client-flow' ? (
          <ReviewFlow business={activeBusiness} onBack={() => setView('dashboard')} />
        ) : (
          <Dashboard business={activeBusiness} />
        )}
      </div>

      {view === 'dashboard' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-xs flex justify-center">
           <button 
            onClick={simulateClientAccess}
            className="glass-panel px-6 py-4 rounded-full text-slate-500 hover:text-primary transition-all text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl border-white/60 active:scale-95 group"
          >
            <Smartphone size={16} className="group-hover:animate-bounce" /> Simulate Review Link
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
