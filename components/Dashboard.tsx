
import React, { useState, useEffect } from 'react';
import { Business, Review, Visibility, ReviewPlatform, DashboardTab } from '../types';
import { 
  LayoutDashboard, MessageSquare, BrainCircuit, Radar, Globe, Settings,
  Bell, Diamond, Star, Activity, History, Share2, ArrowUp, ArrowRight, ChevronRight,
  Loader2, Search, ShieldCheck, Zap, Trash2, Archive,
  RefreshCw, Quote, ZapOff, Sparkles,
  MapPin, Smartphone, Mail, CreditCard,
  Network, Cpu, Layers, AlertCircle, RefreshCcw,
  BarChart4, Map as MapIcon, Link2, ChevronLeft, QrCode, Download, Eye, Copy, Check,
  Palette, Maximize, TrendingUp, ArrowUpRight, SearchCode, Compass,
  LayoutGrid, 
  Inbox,
  Link as LinkIcon,
  Unlink,
  Plus,
  UtensilsCrossed,
  X,
  Facebook
} from 'lucide-react';
import { generateAIDraft, getStrategicInsights, getMarketTrends, getLocalInsights } from '../lib/gemini';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    businessId: 'merlin-cambridge-001',
    reviewerName: 'Sarah Jenkins',
    rating: 5,
    text: "Absolutely fantastic experience! The interface is so intuitive and sleek. The team was very helpful.",
    visibility: Visibility.PUBLIC,
    platform: ReviewPlatform.GOOGLE,
    createdAt: new Date().toISOString(),
    resolved: false
  },
  {
    id: 'rev-2',
    businessId: 'merlin-cambridge-001',
    reviewerName: 'John Doe',
    rating: 2,
    text: "Decent place, but the wait time was a bit longer than I anticipated. Hope they fix it.",
    visibility: Visibility.PRIVATE,
    platform: ReviewPlatform.GOOGLE,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolved: false
  },
  {
    id: 'rev-3',
    businessId: 'merlin-cambridge-001',
    reviewerName: 'Michael Chen',
    rating: 4,
    text: "Really liked the vibe. The staff knows what they're doing. Will be back for sure.",
    visibility: Visibility.PUBLIC,
    platform: ReviewPlatform.YELP,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    resolved: true
  }
];

const Dashboard: React.FC<{ business: Business }> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ReviewPlatform[]>(business.platforms);

  const handleAIDraft = async (review: Review) => {
    setIsGenerating(review.id);
    const draft = await generateAIDraft(review.text, review.rating, business.name);
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, aiDraft: draft } : r));
    setIsGenerating(null);
  };

  const handleTogglePlatform = (platform: ReviewPlatform) => {
    setConnectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const tabs: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Home', icon: <LayoutGrid size={22} /> },
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={22} /> },
    { id: 'qr-generator', label: 'Codes', icon: <QrCode size={22} /> },
    { id: 'market-intel', label: 'Intel', icon: <TrendingUp size={22} /> },
    { id: 'analytics', label: 'Stats', icon: <Radar size={22} /> },
    { id: 'settings', label: 'Admin', icon: <Settings size={22} /> },
  ];

  return (
    <div className="relative h-full w-full flex flex-col bg-[#fcfdfe] overflow-hidden select-none">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-primary/5 rounded-full blur-[140px] animate-pulse opacity-50" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px] animate-pulse opacity-40" style={{ animationDelay: '3.5s' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-6 py-5 md:px-12 md:py-8 glass-panel border-b border-white/50 sticky top-0 z-[60] flex items-center justify-between shrink-0 shadow-sm backdrop-blur-3xl">
          <div className="flex items-center gap-4">
            <div className="size-11 md:size-14 rounded-[1.5rem] bg-gradient-to-br from-primary via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_15px_30px_rgba(13,127,242,0.3)] transform transition-all hover:scale-105 active:scale-95 cursor-pointer">
              <Diamond size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-bold font-display tracking-tighter text-slate-900 leading-none">ReviewMaster</h1>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1.5 opacity-80">Elite Core Node</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="flex size-11 md:size-14 items-center justify-center text-slate-500 hover:text-primary transition-all relative glass-panel rounded-2xl shadow-sm border-white active:scale-90">
              <Bell size={20} />
              <span className="absolute top-3 right-3 size-2.5 bg-red-500 rounded-full border-[3px] border-white shadow-sm animate-pulse"></span>
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{business.ownerName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-70">Node Admin</p>
              </div>
              <div className="size-11 md:size-14 rounded-[1.35rem] p-[2px] bg-gradient-to-tr from-primary via-blue-400 to-purple-400 shadow-xl border-2 border-white overflow-hidden cursor-pointer active:scale-90 transition-transform">
                <img className="size-full object-cover rounded-[1.25rem]" src={business.team[0].avatar} alt="User" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-40">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
            {activeTab === 'overview' && <OverviewView reviews={reviews} business={business} setActiveTab={setActiveTab} />}
            {activeTab === 'inbox' && <InboxView reviews={reviews} onAIDraft={handleAIDraft} isGenerating={isGenerating} />}
            {activeTab === 'qr-generator' && <QRGeneratorView business={business} />}
            {activeTab === 'market-intel' && <MarketIntelligenceView businessName={business.name} />}
            {activeTab === 'analytics' && <AnalyticsView reviews={reviews} businessName={business.name} />}
            {activeTab === 'settings' && (
              <SettingsView 
                business={business} 
                connectedPlatforms={connectedPlatforms} 
                onTogglePlatform={handleTogglePlatform}
              />
            )}
            {activeTab === 'channel-detail' && <ChannelDetailView platform={selectedPlatform || "Google Node"} onBack={() => setActiveTab('overview')} />}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 md:pb-12 z-[100] flex justify-center pointer-events-none">
        <nav className="glass-panel border border-white/80 shadow-[0_30px_70px_-15px_rgba(13,127,242,0.4)] rounded-[3rem] p-2 flex items-center justify-between w-full max-w-xl pointer-events-auto overflow-hidden">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-2 transition-all py-4 rounded-[2.5rem] relative flex-1 touch-manipulation group ${
                activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`transition-all duration-300 transform ${activeTab === tab.id ? 'scale-110 -translate-y-1' : 'scale-100 group-hover:scale-110 group-hover:-translate-y-0.5'}`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-glow" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

/* --- Overview View --- */
const OverviewView = ({ reviews, business, setActiveTab }: { reviews: Review[], business: Business, setActiveTab: (t: DashboardTab) => void }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '?biz=' + business.id)}&bgcolor=ffffff&color=0d7ff2&format=png&margin=2&ecc=H`;

  return (
    <div className="space-y-14 animate-enter">
      <div className="space-y-2">
        <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tighter text-slate-900 leading-tight">Reputation Grid</h2>
        <div className="flex items-center gap-3">
           <div className="size-2.5 bg-emerald-500 rounded-full animate-pulse shadow-glow" />
           <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">Nodes Operational • Real-Time Uplink</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <KPICard label="Collective Score" value="4.8" unit="/5" delta="+0.2" deltaType="positive" icon={<Star size={24} />} theme="yellow" />
        <KPICard label="Traffic Volume" value="1.2k" delta="+84%" deltaType="info" icon={<Eye size={24} />} theme="blue" />
        <KPICard label="Sync Rate" value="14" unit="ms" delta="L-LAT" deltaType="positive" icon={<Activity size={24} />} theme="emerald" />
        <KPICard label="Grid Network" value="24" unit="k" delta="+12%" deltaType="positive" icon={<Share2 size={24} />} theme="purple" />
      </div>

      <div className="glass-panel p-10 md:p-20 rounded-[4rem] md:rounded-[6rem] border-white/60 shadow-2xl group relative overflow-hidden active:scale-[0.99] transition-all">
        <div className="absolute top-[-40%] right-[-15%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[15s]" />
        
        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="bg-white p-8 rounded-[4rem] shadow-2xl border border-slate-50 relative group-hover:scale-105 transition-transform duration-700">
            <div className="w-56 h-56 md:w-72 md:h-72 bg-white flex items-center justify-center rounded-[3rem] overflow-hidden shadow-inner p-2">
              <img src={qrUrl} alt="QR Code" className="size-full object-contain p-2" />
            </div>
            <button 
              onClick={() => setActiveTab('qr-generator')}
              className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-90 transition-transform"
            >
              <Maximize size={28} />
            </button>
          </div>

          <div className="flex-1 space-y-10 text-center md:text-left">
            <div className="space-y-6">
              <div className="flex items-center justify-center md:justify-start gap-3 text-primary font-black text-[12px] uppercase tracking-[0.5em]">
                <Sparkles size={20} fill="currentColor" className="animate-pulse" /> Gateway Interface Active
              </div>
              <h3 className="text-4xl md:text-7xl font-bold font-display text-slate-900 tracking-tighter leading-[0.95]">Your Primary <br className="hidden md:block" /> Ingestion Node</h3>
              <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-lg mx-auto md:mx-0 opacity-90 tracking-tight">
                Capture verified interaction shards directly into your centralized management cloud.
              </p>
            </div>
            
            <button 
              onClick={() => setActiveTab('qr-generator')}
              className="w-full md:w-auto px-16 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_25px_60px_rgba(13,127,242,0.3)] active:scale-95 transition-all hover:bg-primary flex items-center justify-center gap-6 group"
            >
              Deploy Toolkit <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Shared Components --- */
const InputGroup = ({ label, value, icon }: any) => (
  <div className="space-y-4 group">
    <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 opacity-70 flex items-center gap-3 group-focus-within:text-primary transition-colors">
       {icon} {label}
    </label>
    <div className="relative">
      <input 
        readOnly
        value={value} 
        className="w-full h-22 bg-slate-50/70 border-2 border-transparent rounded-[2.5rem] px-12 font-bold text-slate-900 text-lg md:text-2xl focus:border-primary focus:bg-white transition-all outline-none shadow-inner tracking-tighter"
      />
    </div>
  </div>
);

const FilterButton = ({ label, count, active, warning }: { label: string, count: number, active?: boolean, warning?: boolean }) => (
  <button className={`px-10 py-5 rounded-[2rem] flex items-center gap-5 transition-all active:scale-95 shadow-lg border whitespace-nowrap group ${
    active 
    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
    : 'bg-white text-slate-500 border-slate-100 hover:border-primary/40 hover:text-primary hover:shadow-primary/5'
  }`}>
    <span className="text-[12px] font-black uppercase tracking-[0.2em]">{label}</span>
    {count !== undefined && (
      <span className={`px-4 py-1.5 rounded-2xl text-[11px] font-black tabular-nums transition-all ${
        active 
        ? 'bg-white/20 text-white' 
        : warning ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const KPICard = ({ label, value, unit, delta, deltaType, icon, theme }: any) => {
  const themes = {
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-primary border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }[theme as keyof typeof themes] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <div className="glass-panel rounded-[3rem] p-8 md:p-12 shadow-xl border-white/60 active:scale-[0.98] transition-all group cursor-pointer hover:shadow-card-hover relative overflow-hidden flex flex-col justify-between min-h-[160px] md:min-h-[260px]">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-5 rounded-[1.5rem] border group-hover:scale-110 transition-transform shadow-sm ${themes}`}>{icon}</div>
        <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest transition-all ${deltaType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary group-hover:bg-primary/10'}`}>{delta}</span>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-70 leading-none">{label}</p>
        <p className="text-4xl md:text-6xl font-bold text-slate-900 font-display leading-none tracking-tighter">
          {value}<span className="text-sm md:text-lg font-normal text-slate-300 ml-1.5">{unit}</span>
        </p>
      </div>
    </div>
  );
};

/* --- Settings View --- */
const SettingsView = ({ 
  business, 
  connectedPlatforms, 
  onTogglePlatform 
}: { 
  business: Business, 
  connectedPlatforms: ReviewPlatform[],
  onTogglePlatform: (p: ReviewPlatform) => void
}) => {
  const [editingPlatform, setEditingPlatform] = useState<ReviewPlatform | null>(null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-enter pb-20">
      <div className="xl:col-span-2 space-y-16">
        <div className="glass-panel p-10 md:p-20 rounded-[4rem] md:rounded-[5rem] shadow-2xl border-white/60">
          <h3 className="text-2xl md:text-5xl font-bold mb-16 font-display flex items-center gap-8 text-slate-900 tracking-tighter">
            <div className="p-5 bg-blue-50 rounded-[2rem] text-primary shadow-lg"><Settings size={36} /></div>
            Node Parameters
          </h3>
          <div className="space-y-14">
            <InputGroup label="Entity Signature" value={business.name} icon={<Diamond size={28} />} />
            <InputGroup label="Uplink Proxy (WhatsApp)" value={business.whatsappNumber} icon={<Smartphone size={28} />} />
            <InputGroup label="Gateway Admin" value={business.email} icon={<Mail size={28} />} />
            <div className="pt-10">
              <button className="w-full h-24 bg-slate-900 text-white rounded-[3rem] font-black shadow-[0_25px_50px_rgba(0,0,0,0.2)] active:scale-95 transition-all text-sm uppercase tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-primary group">
                Synchronize Node <Check size={24} className="group-hover:scale-125 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-10 md:p-20 rounded-[4rem] md:rounded-[5rem] shadow-2xl border-white/60 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] p-10 opacity-[0.02] pointer-events-none rotate-[25deg]">
            <Globe size={400} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20">
              <div className="space-y-3">
                <h3 className="text-3xl md:text-6xl font-bold font-display text-slate-900 tracking-tighter">Connectivity Hub</h3>
                <p className="text-slate-400 text-base md:text-xl font-medium opacity-80 uppercase tracking-[0.4em]">Interaction Shard Nodes</p>
              </div>
              <button className="h-16 px-10 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-slate-200 transition-all shadow-sm">
                <Plus size={20} /> Request Shard
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: ReviewPlatform.GOOGLE, name: 'Google Cloud Business', color: 'text-red-500', bg: 'bg-red-50', icon: <Globe size={28} />, desc: 'Primary Maps Topology' },
                { id: ReviewPlatform.YELP, name: 'Yelp Protocol v2', color: 'text-red-600', bg: 'bg-red-50', icon: <Star size={28} />, desc: 'Standard Listing Node' },
                { id: ReviewPlatform.FACEBOOK, name: 'Meta Social Graph', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Facebook size={28} />, desc: 'Direct Feedback Stream' },
                { id: ReviewPlatform.ZOMATO, name: 'Zomato Hospitality', color: 'text-rose-500', bg: 'bg-rose-50', icon: <UtensilsCrossed size={28} />, desc: 'Food Enthusiast Relay' },
                { id: ReviewPlatform.TRIPADVISOR, name: 'TripAdvisor Global', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MapPin size={28} />, desc: 'Verified Traveler Sync' },
                { id: ReviewPlatform.JUSTDIAL, name: 'JustDial Directory', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <SearchCode size={28} />, desc: 'Local Presence Node' }
              ].map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                return (
                  <div key={platform.id} className={`p-10 rounded-[3.5rem] border-2 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between h-full min-h-[300px] ${isConnected ? 'bg-white border-primary/20 shadow-2xl scale-[1.02]' : 'bg-slate-50/50 border-slate-100 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-10">
                         <div className={`size-20 rounded-[1.8rem] shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${platform.bg} ${platform.color}`}>
                           {platform.icon}
                         </div>
                         <button 
                          onClick={() => onTogglePlatform(platform.id)}
                          className={`size-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${isConnected ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500 shadow-emerald-500/10' : 'bg-white text-slate-400 border border-slate-100 hover:text-primary hover:border-primary/20'}`}
                         >
                           {isConnected ? <Check size={24} /> : <LinkIcon size={24} />}
                         </button>
                      </div>
                      
                      <div className="space-y-2 mb-10">
                         <h4 className="text-2xl font-bold font-display text-slate-900 tracking-tight leading-none">{platform.name}</h4>
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">{platform.desc}</p>
                      </div>
                    </div>

                    {isConnected ? (
                      <button 
                        onClick={() => setEditingPlatform(platform.id)}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] border border-transparent hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                      >
                         Configure Node <ArrowUpRight size={16} />
                      </button>
                    ) : (
                      <div className="w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Dormant</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="glass-panel p-12 rounded-[4rem] border-white shadow-2xl overflow-hidden group relative min-h-[400px] flex flex-col justify-between">
          <div className="absolute top-[-10%] right-[-10%] size-60 bg-primary/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-[10s]" />
          <div>
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.6em] mb-14 opacity-80">Tier Protocol</h3>
            <div className="bg-slate-50/80 p-10 rounded-[3rem] border border-slate-100 flex items-center justify-between mb-10 relative shadow-inner backdrop-blur-sm">
              <div className="z-10">
                <p className="text-[11px] text-primary font-black uppercase tracking-[0.5em] mb-4">ELITE SHARD</p>
                <p className="text-5xl md:text-7xl font-bold text-slate-900 font-display leading-none tracking-tighter">$299<span className="text-lg font-normal text-slate-300 ml-2 tracking-normal">/mo</span></p>
              </div>
              <div className="size-20 md:size-24 bg-white rounded-[2rem] shadow-2xl border border-blue-50 flex items-center justify-center text-primary group-hover:rotate-12 transition-all duration-700">
                <CreditCard size={44} />
              </div>
            </div>
          </div>
          <button className="w-full h-22 rounded-[2.5rem] bg-slate-900 text-white text-[12px] font-black shadow-[0_30px_60px_rgba(0,0,0,0.3)] active:scale-95 transition-all uppercase tracking-[0.6em] hover:bg-primary">Manage Vault</button>
        </div>
      </div>

      {editingPlatform && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto">
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl" onClick={() => setEditingPlatform(null)} />
           <div className="relative w-full max-w-2xl glass-panel p-12 md:p-20 rounded-[5rem] border-white shadow-[0_80px_160px_-40px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-20 duration-700">
              <button onClick={() => setEditingPlatform(null)} className="absolute top-12 right-12 size-16 bg-white shadow-xl text-slate-400 rounded-[1.5rem] flex items-center justify-center hover:text-red-500 transition-all active:scale-90 border border-slate-50"><X size={32} /></button>
              
              <div className="space-y-16">
                 <div className="space-y-4">
                    <h4 className="text-4xl md:text-6xl font-bold font-display text-slate-900 tracking-tighter leading-none">Node Sync</h4>
                    <p className="text-primary font-black text-[13px] uppercase tracking-[0.6em]">ELITE PROTOCOL: {editingPlatform.toUpperCase()}</p>
                 </div>

                 <div className="space-y-10">
                    <div className="space-y-5">
                       <label className="text-[13px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 opacity-70">Target Redirect Endpoint</label>
                       <div className="relative">
                          <Globe size={28} className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            placeholder="https://maps.google.com/..." 
                            className="w-full h-24 bg-slate-50 border-none rounded-[2.5rem] pl-24 pr-10 text-xl font-bold text-slate-900 focus:ring-[16px] focus:ring-primary/10 transition-all outline-none shadow-inner"
                          />
                       </div>
                    </div>
                    <div className="flex items-start gap-6 p-10 bg-blue-50/50 rounded-[3rem] border border-blue-100 shadow-sm">
                       <div className="size-14 rounded-2xl bg-blue-100 flex items-center justify-center text-primary shrink-0 shadow-sm">
                        <ShieldCheck size={32} />
                       </div>
                       <div className="space-y-2">
                        <p className="text-lg font-bold text-blue-900 leading-tight">Elite Secure Protocol</p>
                        <p className="text-sm font-medium text-blue-800 leading-relaxed opacity-80">This endpoint will strictly manage high-sentiment interaction traffic. Negative shards will be automatically sequestered for management resolution.</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={() => setEditingPlatform(null)}
                  className="w-full h-24 bg-slate-900 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_40px_80px_rgba(0,0,0,0.4)] active:scale-95 transition-all hover:bg-primary"
                 >
                   Confirm Node Uplink
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* --- Remaining Dashboard Views --- */
const InboxView = ({ reviews, onAIDraft, isGenerating }: { reviews: Review[], onAIDraft: (r: Review) => void, isGenerating: string | null }) => (
  <div className="space-y-12 animate-enter">
    <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between px-2">
      <div className="space-y-3">
        <h2 className="text-4xl md:text-7xl font-bold font-display tracking-tighter text-slate-900 leading-none">Inbox</h2>
        <p className="text-slate-400 text-sm md:text-xl font-medium uppercase tracking-[0.5em] flex items-center gap-3">
          <Layers size={22} className="text-primary" /> Signal Processing active
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 md:mx-0 md:px-0">
        <FilterButton label="All Shards" count={reviews.length} active />
        <FilterButton label="Google Node" count={reviews.filter(r => r.platform === ReviewPlatform.GOOGLE).length} />
        <FilterButton label="Private" count={reviews.filter(r => r.visibility === Visibility.PRIVATE).length} warning />
      </div>
    </div>
    
    <div className="space-y-10">
      {reviews.map(review => (
        // Fix: Use 'onAIDraft' instead of 'handleAIDraft' which was not defined in this scope
        <InboxCard key={review.id} review={review} onAIDraft={onAIDraft} isGenerating={isGenerating} />
      ))}
    </div>
  </div>
);

const InboxCard: React.FC<{ 
  review: Review; 
  onAIDraft: (r: Review) => void; 
  isGenerating: string | null; 
}> = ({ review, onAIDraft, isGenerating }) => (
  <div className="glass-panel p-10 md:p-16 rounded-[4rem] md:rounded-[5rem] shadow-xl border-white/60 active:scale-[0.995] transition-all group overflow-hidden relative">
    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-14 relative z-10">
      <div className="flex gap-8 items-center">
        <div className="size-20 md:size-32 rounded-[2.5rem] md:rounded-[3.5rem] bg-white border border-slate-50 flex items-center justify-center text-primary font-bold shadow-2xl text-4xl font-display relative overflow-hidden group-hover:shadow-glow transition-all duration-700">
          <img className="size-full object-cover" src={`https://ui-avatars.com/api/?name=${review.reviewerName}&background=0d7ff2&color=fff&size=256`} alt={review.reviewerName} />
          {review.visibility === Visibility.PRIVATE && (
            <div className="absolute -top-1 -right-1 p-3 bg-amber-500 text-white rounded-bl-[2rem] shadow-2xl border-2 border-white">
              <ShieldCheck size={24} />
            </div>
          )}
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-3xl md:text-5xl font-display tracking-tighter text-slate-900 leading-none">
            {review.reviewerName}
          </h4>
          <div className="flex items-center gap-6">
            <span className="text-yellow-500 text-sm md:text-lg font-black bg-yellow-50 px-5 py-2.5 rounded-2xl border border-yellow-100 flex items-center gap-3 shadow-sm">
              <Star size={20} fill="currentColor" /> {review.rating.toFixed(1)}
            </span>
            <span className="text-[12px] font-black text-slate-300 uppercase tracking-[0.5em]">{review.platform || 'CORE'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 w-full md:w-auto pt-4 md:pt-0">
        <button className="flex-1 md:flex-none h-16 w-full md:w-16 glass-panel rounded-3xl text-slate-400 active:scale-90 transition-all border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-lg"><Archive size={28} /></button>
        <button className="flex-1 md:flex-none h-16 w-full md:w-16 glass-panel rounded-3xl text-slate-400 active:scale-90 transition-all border-slate-100 flex items-center justify-center hover:bg-red-500 hover:text-white shadow-lg"><Trash2 size={28} /></button>
      </div>
    </div>
    
    <div className="mb-14 pl-12 border-l-8 border-slate-100 group-hover:border-primary/20 transition-all duration-700">
      <p className="text-slate-700 text-2xl md:text-4xl italic leading-relaxed opacity-95 font-medium tracking-tight">"{review.text}"</p>
    </div>
    
    {review.aiDraft ? (
      <div className="p-10 md:p-16 bg-slate-900 rounded-[4rem] text-white animate-in slide-in-from-top-10 duration-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12 scale-150"><BrainCircuit size={160} /></div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
             <div className="size-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-glow"><Zap size={28} fill="currentColor" /></div>
             <p className="text-[12px] font-black text-blue-400 uppercase tracking-[0.6em]">Neural Optimization Active</p>
          </div>
          <p className="text-white text-xl md:text-4xl font-bold leading-tight italic opacity-95 tracking-tighter font-display">"{review.aiDraft}"</p>
          <div className="flex flex-wrap gap-6 pt-6">
            <button className="flex-1 md:flex-none px-14 py-6 rounded-[2rem] bg-white text-slate-900 text-xs font-black uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-6 group/sync">
               Sync Response <ArrowUpRight size={24} className="group-hover/sync:scale-125 group-hover/sync:-translate-y-1 transition-transform" />
            </button>
            <button className="flex-1 md:flex-none px-14 py-6 rounded-[2rem] bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-[0.5em] active:scale-95 transition-all hover:bg-white/20">
               Refine Agent
            </button>
          </div>
        </div>
      </div>
    ) : (
      <button 
        onClick={() => onAIDraft(review)} 
        disabled={isGenerating === review.id} 
        className="w-full py-8 rounded-[3rem] bg-white border-2 border-slate-100 text-slate-900 text-xs font-black uppercase tracking-[0.6em] flex items-center justify-center gap-6 active:scale-95 hover:bg-slate-50 transition-all shadow-xl group"
      >
        {isGenerating === review.id ? <><Loader2 className="animate-spin text-primary" size={28} /> Inferring Context...</> : <><BrainCircuit size={28} className="group-hover:animate-pulse" /> Generate Neural Pass</>}
      </button>
    )}
  </div>
);

const MarketIntelligenceView = ({ businessName }: { businessName: string }) => {
  const [niche, setNiche] = useState("Hospitality and Fine Dining");
  const [marketTrends, setMarketTrends] = useState<{ success: boolean; text: string; sources: any[] } | null>(null);
  const [localInsights, setLocalInsights] = useState<{ success: boolean; text: string; sources: any[] } | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const fetchTrends = async (targetNiche = niche) => {
    setLoadingTrends(true);
    const result = await getMarketTrends(targetNiche);
    setMarketTrends(result);
    setLoadingTrends(false);
  };

  const fetchLocal = async () => {
    setLoadingLocal(true);
    let lat, lng;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (e) { lat = 37.422; lng = -122.084; }
    const result = await getLocalInsights(niche, lat, lng);
    setLocalInsights(result);
    setLoadingLocal(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrends();
    fetchLocal();
  };

  useEffect(() => {
    fetchTrends();
    fetchLocal();
  }, []);

  return (
    <div className="space-y-16 animate-enter pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 px-2">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-7xl font-bold font-display tracking-tighter text-slate-900 leading-none">Intelligence</h2>
          <div className="flex items-center gap-4">
            <Sparkles size={24} className="text-primary animate-pulse" />
            <p className="text-slate-400 text-sm md:text-xl font-medium uppercase tracking-[0.5em]">Deep Signal Analysis active</p>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-[500px] group">
          <input 
            type="text" 
            value={niche} 
            onChange={(e) => setNiche(e.target.value)}
            className="w-full bg-white border-none rounded-[3rem] py-8 pl-16 pr-10 text-xl font-bold text-slate-900 shadow-2xl focus:ring-[16px] focus:ring-primary/10 outline-none transition-all tracking-tight"
            placeholder="Define Market Niche..."
          />
          <Search size={28} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 size-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center active:scale-90 transition-all shadow-2xl hover:bg-primary">
            <RefreshCw size={24} />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-20">
        <section className="space-y-8">
          <div className="flex items-center gap-5 px-4">
            <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary shadow-lg"><Globe size={24} /></div>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tighter">Market Vectors</h3>
          </div>
          <IntelligencePanel 
            title="Global Trends" 
            subtitle="Strategic Synthesis" 
            icon={<Cpu size={40} />} 
            data={marketTrends} 
            loading={loadingTrends} 
            onRefresh={() => fetchTrends()} 
            theme="light" 
          />
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-5 px-4">
            <div className="p-4 bg-accent/10 rounded-[1.5rem] text-accent shadow-lg"><MapIcon size={24} /></div>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tighter">Competitive Grid</h3>
          </div>
          <IntelligencePanel 
            title="Spatial Topology" 
            subtitle="Reputation Mapping" 
            icon={<Network size={40} />} 
            data={localInsights} 
            loading={loadingLocal} 
            onRefresh={() => fetchLocal()} 
            theme="dark" 
          />
        </section>
      </div>
    </div>
  );
};

const IntelligencePanel = ({ title, subtitle, icon, data, loading, onRefresh, theme }: any) => {
  const formatNeuralData = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={idx} />;
      const isBold = trimmed.startsWith('**') || trimmed.endsWith(':') || (trimmed.length < 50 && !trimmed.startsWith('-'));
      return (
        <p key={idx} className={`mb-8 text-xl md:text-3xl leading-relaxed ${isBold ? 'font-bold text-slate-900' : 'text-slate-500'} ${theme === 'dark' && isBold ? 'text-white' : theme === 'dark' ? 'text-slate-400' : ''} tracking-tight`}>
          {trimmed.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className={`p-10 md:p-24 rounded-[5rem] md:rounded-[7rem] relative overflow-hidden transition-all shadow-2xl border ${theme === 'dark' ? 'glass-dark text-white border-white/5' : 'glass-panel text-slate-900 border-white/80'}`}>
      <div className="relative z-10 flex flex-col min-h-[500px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-10">
          <div className="flex items-center gap-8">
            <div className={`size-20 md:size-32 rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 border-white/10 text-primary' : 'bg-blue-50 border-blue-100 text-primary'}`}>
              {React.cloneElement(icon, { size: 48 })}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-6xl font-bold font-display leading-tight tracking-tighter">{title}</h3>
              <p className="text-[12px] md:text-[14px] font-black opacity-60 uppercase tracking-[0.6em]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onRefresh} disabled={loading} className={`h-18 w-18 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 shadow-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-50 border border-slate-100 text-slate-400 hover:text-primary shadow-sm'}`}>
            {loading ? <Loader2 size={32} className="animate-spin text-primary" /> : <RefreshCcw size={32} />}
          </button>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-10 opacity-70">
              <Activity size={72} className="animate-pulse text-primary" />
              <p className="font-black text-lg uppercase tracking-[0.8em] animate-pulse">Syncing Shard Network...</p>
            </div>
          ) : data?.success === false ? (
            <div className="py-40 flex flex-col items-center justify-center gap-10 text-center max-w-lg mx-auto">
               <AlertCircle size={72} className="text-red-500 opacity-80" />
               <p className="text-2xl md:text-3xl font-bold opacity-90 leading-tight tracking-tight">{data.text}</p>
            </div>
          ) : data ? (
            <div className={`pl-12 border-l-8 transition-all duration-1000 ${theme === 'dark' ? 'border-white/20' : 'border-primary/20'}`}>
               <div className="mb-20">{formatNeuralData(data.text)}</div>
               {data.sources?.length > 0 && (
                 <div className="pt-14 border-t border-white/5 flex flex-wrap gap-6">
                   {data.sources.slice(0, 3).map((s: any, i: number) => {
                     const link = s.web || s.maps;
                     if (!link) return null;
                     return (
                       <a key={i} href={link.uri} target="_blank" className={`px-10 py-4 rounded-[1.5rem] border-2 flex items-center gap-5 text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/20'}`}>
                         <Link2 size={20} /> {link.title ? link.title.substring(0, 16) : 'Verified Shard'}
                       </a>
                     );
                   })}
                 </div>
               )}
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center opacity-30 gap-10">
               <ZapOff size={96} />
               <p className="font-black text-xl uppercase tracking-[0.8em]">Input node signal required</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = ({ reviews, businessName }: { reviews: Review[], businessName: string }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const text = await getStrategicInsights(reviews, businessName);
    setInsights(text || "Error synthesizing strategic data.");
    setLoading(false);
  };

  return (
    <div className="space-y-16 animate-enter pb-20">
       <div className="space-y-3 px-2">
        <h2 className="text-4xl md:text-7xl font-bold font-display tracking-tighter text-slate-900 leading-none">Metrics</h2>
        <p className="text-slate-400 text-sm md:text-xl font-medium uppercase tracking-[0.6em] opacity-80">Signal Density Analysis active</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-panel p-12 md:p-20 rounded-[4rem] md:rounded-[5rem] shadow-2xl border-white/60">
          <h3 className="text-3xl md:text-5xl font-bold mb-20 font-display flex items-center gap-8 tracking-tighter">
            <BarChart4 className="text-primary" size={40} /> Star Array
          </h3>
          <div className="space-y-14">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center gap-8">
                <span className="text-sm md:text-xl font-black text-slate-400 w-14 text-right tracking-[0.5em]">{stars}★</span>
                <div className="flex-1 h-5 md:h-7 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    stars >= 4 ? 'bg-primary shadow-glow' : stars === 3 ? 'bg-amber-400' : 'bg-red-500'
                  }`} style={{ width: `${stars === 5 ? 72 : stars === 4 ? 14 : stars === 3 ? 8 : 6}%` }} />
                </div>
                <span className="text-sm md:text-xl font-black text-slate-900 w-16 tabular-nums tracking-tighter">
                  {stars === 5 ? '72%' : stars === 4 ? '14%' : '...'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-dark p-16 md:p-24 rounded-[4rem] md:rounded-[5rem] text-white flex flex-col justify-between overflow-hidden relative min-h-[450px]">
          <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[20s]"><BrainCircuit size={300} /></div>
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-5 text-primary">
              <Zap size={32} fill="currentColor" />
              <span className="text-[13px] font-black uppercase tracking-[0.8em] opacity-90">Neural Engine Synced</span>
            </div>
            <h3 className="text-4xl md:text-7xl font-bold font-display tracking-tighter leading-[0.9]">Synthesize <br/> Strategy</h3>
            <p className="text-slate-400 text-lg md:text-3xl leading-relaxed max-w-sm font-medium opacity-80 tracking-tight">Run deep context pass on global interaction shards to generate improvement roadmap.</p>
          </div>
          <button 
            onClick={fetchInsights} 
            disabled={loading} 
            className="w-full h-24 rounded-[3rem] bg-primary text-white font-black shadow-[0_30px_70px_rgba(13,127,242,0.4)] active:scale-95 transition-all flex items-center justify-center gap-6 text-sm uppercase tracking-[0.5em] mt-16 hover:bg-primary-dark"
          >
            {loading ? <Loader2 className="animate-spin" size={32} /> : <><BrainCircuit size={32} /> Initiate Neural Pass</>}
          </button>
        </div>
      </div>

      {insights && (
        <div className="glass-panel p-16 md:p-32 rounded-[6rem] md:rounded-[8rem] shadow-2xl border-white animate-in slide-in-from-bottom-20 duration-1000">
          <div className="flex items-center gap-10 mb-20">
            <div className="size-24 rounded-[3rem] bg-primary/10 text-primary flex items-center justify-center shadow-xl border border-primary/10"><BrainCircuit size={56} /></div>
            <div>
              <h4 className="text-4xl md:text-7xl font-bold font-display text-slate-900 tracking-tighter">Strategic Roadmap</h4>
              <p className="text-sm md:text-xl font-black text-slate-400 uppercase tracking-[0.8em] mt-3">Node: {businessName}</p>
            </div>
          </div>
          <div className="pl-16 border-l-12 border-primary/10 space-y-16">
            {insights.split('\n').filter(l => l.trim()).map((line, i) => (
              <div key={i} className="flex gap-10 animate-in slide-in-from-left-10 duration-700" style={{ animationDelay: `${i * 200}ms` }}>
                 <div className="size-12 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 mt-2 shadow-[0_15px_30px_rgba(0,0,0,0.2)]">{i + 1}</div>
                 <p className="text-slate-700 text-2xl md:text-5xl leading-snug italic font-medium font-display opacity-95 tracking-tighter">
                   {line.replace(/^\d\.\s*/, '').replace(/\*\*/g, '')}
                 </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChannelDetailView = ({ platform, onBack }: { platform: string, onBack: () => void }) => (
  <div className="animate-enter relative glass-panel rounded-[5rem] md:rounded-[7rem] shadow-2xl overflow-hidden border border-white/60 max-w-6xl mx-auto min-h-[85vh] flex flex-col pb-20">
    <header className="flex items-center justify-between px-12 py-14 sticky top-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-white/40 shadow-sm">
      <button onClick={onBack} className="size-18 rounded-[2rem] bg-white shadow-2xl text-slate-700 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center active:scale-90 border border-slate-50"><ChevronLeft size={36} /></button>
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 font-display leading-none">{platform}</h1>
        <div className="flex items-center justify-center gap-4">
           <div className="size-3 bg-emerald-500 rounded-full shadow-glow animate-pulse" />
           <p className="text-[12px] font-black text-emerald-500 tracking-[0.6em] uppercase opacity-90 leading-none">Uplink active</p>
        </div>
      </div>
      <button className="size-18 rounded-[2rem] bg-white shadow-2xl text-slate-400 flex items-center justify-center active:scale-90 border border-slate-50 hover:text-primary"><Settings size={32} /></button>
    </header>

    <div className="px-16 py-24 flex-1 overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center justify-center mb-28">
        <div className="size-64 md:size-96 rounded-full border-[20px] border-slate-50 shadow-inner flex items-center justify-center relative group">
           <div className="absolute inset-0 rounded-full border-[20px] border-primary border-t-transparent group-hover:rotate-[360deg] transition-transform duration-[3s] ease-in-out" />
           <div className="text-center space-y-2">
              <span className="text-8xl md:text-[12rem] font-bold text-slate-900 tracking-tighter font-display leading-none">4.8</span>
              <p className="text-sm md:text-xl font-black text-slate-400 uppercase tracking-[0.8em] opacity-80">Sync health</p>
           </div>
        </div>
      </div>
      
      <div className="glass-panel rounded-[5rem] p-16 md:p-24 border-white/60 shadow-2xl group relative overflow-hidden mb-16">
         <div className="flex justify-between items-center mb-20">
            <div className="space-y-3">
               <h4 className="font-bold text-3xl md:text-5xl font-display tracking-tighter leading-none">Signal Density</h4>
               <p className="text-[12px] md:text-[14px] font-black text-slate-400 uppercase tracking-[0.8em] opacity-70">Interaction uplink pulse</p>
            </div>
            <div className="text-emerald-500 font-black text-sm md:text-lg bg-emerald-50 px-8 py-4 rounded-[2rem] shadow-lg border border-emerald-100 flex items-center gap-4">
               <TrendingUp size={24} /> +14.2% Flow
            </div>
         </div>
         <div className="flex items-end justify-between h-72 md:h-[400px] gap-6 px-4">
            {[40, 70, 55, 90, 65, 80, 45, 95, 30, 85, 60, 75].map((h, i) => (
               <div key={i} className={`flex-1 rounded-t-[2.5rem] transition-all duration-1000 ${i === 7 ? 'bg-primary shadow-[0_0_80px_rgba(13,127,242,0.4)] scale-x-110 scale-y-105' : 'bg-primary/10 hover:bg-primary/30 cursor-pointer'}`} style={{ height: `${h}%` }} />
            ))}
         </div>
      </div>
    </div>

    <div className="px-16 py-12 sticky bottom-0 z-50 flex gap-8 bg-gradient-to-t from-white via-white/95 to-transparent">
      <button className="flex-1 h-24 rounded-[3rem] bg-slate-50 text-red-500 text-xs font-black uppercase tracking-[0.6em] active:scale-95 transition-all shadow-xl border border-slate-100 hover:bg-red-50">De-provision Node</button>
      <button className="flex-[2] h-24 rounded-[3rem] bg-slate-900 text-white text-xs font-black uppercase tracking-[0.6em] shadow-[0_40px_80px_rgba(0,0,0,0.3)] active:scale-95 transition-all hover:bg-primary">Force Re-Handshake</button>
    </div>
  </div>
);

const QRGeneratorView = ({ business }: { business: Business }) => {
  const [primaryColor, setPrimaryColor] = useState('0d7ff2');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getPublicLink = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('biz', business.id);
    return url.toString();
  };

  const publicLink = getPublicLink();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicLink)}&bgcolor=ffffff&color=${primaryColor}&format=png&margin=2&ecc=H`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.name.replace(/\s+/g, '-').toLowerCase()}-gateway-shard.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("QR download failed", e);
    }
    setIsDownloading(false);
  };

  return (
    <div className="space-y-20 animate-enter pb-20">
      <div className="space-y-4 px-2">
        <h2 className="text-4xl md:text-8xl font-bold font-display tracking-tighter text-slate-900 leading-tight">Deployment</h2>
        <p className="text-slate-400 text-sm md:text-xl font-black uppercase tracking-[0.8em] opacity-80">Verified Reputation Uplink Capture</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3">
          <div className="glass-panel p-16 md:p-32 rounded-[6rem] md:rounded-[8rem] border-white shadow-2xl flex flex-col items-center justify-center text-center relative group">
            <div className="w-full max-w-lg bg-white p-16 md:p-24 rounded-[5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.2)] border border-slate-50 relative z-10 flex flex-col items-center gap-16 group-hover:scale-[1.02] transition-transform duration-1000 ease-out">
              <div className="space-y-5">
                <h4 className="text-4xl font-bold font-display text-slate-900 leading-none tracking-tighter">{business.name}</h4>
                <div className="flex items-center justify-center gap-2">
                   {[1,2,3,4,5].map(s => <Star key={s} size={24} className="text-yellow-400 fill-current shadow-glow" />)}
                </div>
              </div>
              
              <div className="size-72 md:size-[450px] shadow-inner rounded-[4rem] overflow-hidden p-8 bg-slate-50/50 flex items-center justify-center border-2 border-slate-100/50">
                <img src={qrUrl} alt="Deployment QR" className="size-full object-contain drop-shadow-2xl scale-110" />
              </div>

              <div className="space-y-5">
                 <p className="text-slate-900 font-black text-sm md:text-lg uppercase tracking-[0.6em] leading-none">Scan to review</p>
                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none opacity-60">Shard: {business.id.split('-').pop()}</p>
              </div>
            </div>
            
            <div className="mt-24 space-y-6 max-w-md">
               <h3 className="text-3xl md:text-5xl font-bold font-display tracking-tighter leading-none">Active Entry Node</h3>
               <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed opacity-90 tracking-tight">Deploy this gateway shard to captured verified interaction narratives.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="glass-panel p-16 rounded-[4rem] border-white shadow-2xl space-y-20 flex flex-col h-full justify-center">
            <div className="space-y-12">
               <label className="text-[14px] font-black text-slate-400 uppercase tracking-[0.8em] ml-4 opacity-70 flex items-center gap-5">
                 <Palette size={24} /> Neural Chroma
               </label>
               <div className="flex flex-wrap gap-8 px-2">
                  {[
                    { hex: '0d7ff2', label: 'Flow' },
                    { hex: '7c4dff', label: 'Pulse' },
                    { hex: '0f172a', label: 'Void' },
                    { hex: 'ef4444', label: 'Alert' },
                    { hex: '10b981', label: 'Growth' }
                  ].map(color => (
                    <button 
                      key={color.hex}
                      onClick={() => setPrimaryColor(color.hex)}
                      className={`size-16 md:size-20 rounded-[2rem] border-[6px] transition-all active:scale-90 ${primaryColor === color.hex ? 'border-primary ring-[16px] ring-primary/10 scale-110 shadow-2xl' : 'border-white shadow-lg hover:border-slate-100'}`}
                      style={{ backgroundColor: `#${color.hex}` }}
                    />
                  ))}
               </div>
            </div>

            <div className="space-y-8 pt-10">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full h-24 md:h-28 bg-slate-900 text-white rounded-[3rem] font-black shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex items-center justify-center gap-8 text-[14px] uppercase tracking-[0.5em] active:scale-95 transition-all hover:bg-primary group"
              >
                {isDownloading ? <Loader2 className="animate-spin" size={32} /> : <><Download size={32} className="group-hover:translate-y-1 transition-transform" /> Export PNG Kit</>}
              </button>
              <button 
                onClick={handleCopy}
                className="w-full h-24 md:h-28 bg-white border-2 border-slate-100 text-slate-600 rounded-[3rem] font-black shadow-xl flex items-center justify-center gap-8 text-[14px] uppercase tracking-[0.5em] active:scale-95 transition-all hover:bg-slate-50"
              >
                {isCopied ? <Check size={32} className="text-emerald-500" /> : <Link2 size={32} />}
                {isCopied ? "Link Secured" : "Copy Gateway Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
