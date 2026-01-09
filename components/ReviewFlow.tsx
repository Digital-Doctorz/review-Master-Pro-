
import React, { useState, useEffect } from 'react';
import { Business, Visibility, ReviewPlatform } from '../types';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  ChevronLeft,
  Quote,
  UtensilsCrossed,
  ArrowUpRight,
  Globe,
  Check,
  Award,
  Loader2,
  Heart,
  AlertTriangle,
  Facebook,
  SmartphoneNfc,
  SearchCode,
  X,
  Instagram,
  MapPin
} from 'lucide-react';

interface ReviewFlowProps {
  business: Business;
  onBack?: () => void;
}

type FlowStep = 'landing' | 'rating' | 'feedback' | 'platform-select' | 'thank-you';

const SESSION_KEY = 'rmp_review_session_';
const SESSION_MAX_AGE = 30 * 60 * 1000; // 30 mins

const ReviewFlow: React.FC<ReviewFlowProps> = ({ business, onBack }) => {
  const [step, setStep] = useState<FlowStep>('landing');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);

  const themePrimary = "text-[#059669]";
  const themeBg = "bg-[#059669]";
  const themeLight = "bg-[#ecfdf5]";

  useEffect(() => {
    const recoverSession = () => {
      const saved = sessionStorage.getItem(`${SESSION_KEY}${business.id}`);
      if (saved) {
        try {
          const session = JSON.parse(saved);
          if (Date.now() - session.timestamp < SESSION_MAX_AGE) {
            if (session.rating) setRating(session.rating);
            if (session.comment) setComment(session.comment);
            if (session.rating > 0 && session.comment.length > 0) {
              setStep('platform-select');
            } else if (session.rating > 0) {
              setStep('feedback');
            }
          } else {
            sessionStorage.removeItem(`${SESSION_KEY}${business.id}`);
          }
        } catch (e) {
          console.error("Session recovery corrupt", e);
        }
      }
    };
    recoverSession();
  }, [business.id]);

  useEffect(() => {
    if (rating > 0 || comment.length > 0) {
      const sessionData = {
        rating,
        comment,
        timestamp: Date.now(),
        businessId: business.id
      };
      sessionStorage.setItem(`${SESSION_KEY}${business.id}`, JSON.stringify(sessionData));
    }
  }, [rating, comment, business.id]);

  const handleRatingSelect = (r: number) => {
    setRating(r);
    setStep('feedback');
  };

  const handleFinalSubmit = async () => {
    if (!selectedPlatform) return;
    setIsSubmitting(true);
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      const isPrivate = selectedPlatform === ReviewPlatform.INTERNAL_ONLY || rating <= 3;
      
      if (!isPrivate) {
        const encodedName = encodeURIComponent(business.name);
        let url = "";
        switch(selectedPlatform) {
          case ReviewPlatform.GOOGLE: url = `https://www.google.com/search?q=${encodedName}+reviews`; break;
          case ReviewPlatform.ZOMATO: url = `https://www.zomato.com/search?q=${encodedName}`; break;
          case ReviewPlatform.FACEBOOK: url = `https://www.facebook.com/search/pages/?q=${encodedName}`; break;
          case ReviewPlatform.JUSTDIAL: url = `https://www.justdial.com/search?q=${encodedName}`; break;
        }
        if (url) window.open(url, '_blank');
      }

      sessionStorage.removeItem(`${SESSION_KEY}${business.id}`);
      setStep('thank-you');
    } catch (error) {
      console.error("Submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 relative overflow-y-auto overflow-x-hidden bg-[#f4fbf8] min-h-screen scroll-smooth">
      <div className="absolute top-[-10%] right-[-5%] w-[120vw] h-[120vw] bg-emerald-100/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-xl animate-enter relative z-10 my-auto">
        <div className="glass-panel rounded-[4rem] md:rounded-[5rem] shadow-[0_60px_120px_-30px_rgba(5,150,105,0.15)] overflow-hidden border border-white/70 flex flex-col bg-white/95 backdrop-blur-3xl min-h-[700px]">
          
          <div className="px-10 pt-10 flex justify-between items-center shrink-0">
            {step !== 'landing' && step !== 'thank-you' ? (
              <button 
                onClick={() => {
                  if (step === 'rating') setStep('landing');
                  if (step === 'feedback') setStep('rating');
                  if (step === 'platform-select') setStep('feedback');
                }} 
                className="size-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all active:scale-90 border border-slate-50"
              >
                <ChevronLeft size={24} />
              </button>
            ) : <div className="size-12" />}

            {step !== 'landing' && step !== 'thank-you' && (
              <div className="flex gap-2">
                {['rating', 'feedback', 'platform-select'].map((s, idx) => (
                  <div 
                    key={s} 
                    className={`h-2 rounded-full transition-all duration-700 ${
                      (step === 'rating' && idx === 0) || 
                      (step === 'feedback' && idx <= 1) || 
                      (step === 'platform-select' && idx <= 2) 
                      ? `w-14 ${themeBg} shadow-glow` : 'w-4 bg-slate-100'
                    }`} 
                  />
                ))}
              </div>
            )}

            <button 
              onClick={() => onBack ? onBack() : window.location.reload()} 
              className="size-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-300 hover:text-red-500 transition-all active:scale-90 border border-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 py-10 md:px-14 flex-1 flex flex-col justify-center">
            {step === 'landing' && (
              <div className="flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="space-y-12">
                  <div className="relative inline-block">
                    <div className={`size-44 md:size-56 ${themeBg} rounded-[4rem] md:rounded-[5rem] flex items-center justify-center mx-auto shadow-2xl transition-transform duration-700 hover:rotate-3`}>
                      <Heart className="text-white" size={80} fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-emerald-50">
                      <Sparkles size={40} className="text-yellow-400" fill="currentColor" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold font-display text-slate-900 tracking-tighter leading-tight">
                      Experience <br/>
                      <span className={themePrimary}>{business.name}</span>
                    </h1>
                    <p className="text-slate-500 font-medium px-4 text-lg md:text-2xl leading-relaxed max-w-sm mx-auto opacity-80">
                      Share your perspective to help us evolve.
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-8 pt-6">
                  <button
                    onClick={() => setStep('rating')}
                    className={`w-full ${themeBg} text-white font-black h-24 md:h-28 rounded-[3rem] shadow-[0_30px_70px_rgba(5,150,105,0.35)] active:scale-95 transition-all flex items-center justify-center gap-6 text-sm uppercase tracking-[0.4em] group`}
                  >
                    Share Voice <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <div className="flex items-center justify-center gap-4 text-slate-300">
                    <ShieldCheck size={20} className="text-emerald-500/40" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em]">Verified Node Security</span>
                  </div>
                </div>
              </div>
            )}

            {step === 'rating' && (
              <div className="space-y-24 text-center animate-in slide-in-from-bottom-12 duration-800">
                <div className="space-y-6">
                   <h2 className="text-4xl md:text-6xl font-bold font-display text-slate-900 tracking-tighter leading-none">Global Rating</h2>
                   <p className="text-slate-500 text-lg md:text-2xl font-medium opacity-80 max-w-xs mx-auto">Select your session satisfaction level.</p>
                </div>

                <div className="flex justify-center items-center gap-2 md:gap-4 py-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingSelect(s)}
                      className="p-1 transition-all active:scale-75 hover:scale-125 touch-none"
                    >
                      <Star 
                        size={rating >= s ? 64 : 60} 
                        className={`transition-all duration-500 ${
                          (hoverRating || rating) >= s 
                          ? "text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" 
                          : "text-slate-100"
                        }`} 
                        fill={(hoverRating || rating) >= s ? "currentColor" : "none"}
                        strokeWidth={rating >= s ? 0.5 : 1}
                      />
                    </button>
                  ))}
                </div>

                <div className="p-10 bg-slate-50/70 rounded-[3rem] border border-slate-100 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[13px] font-black uppercase tracking-[0.5em] text-slate-400 z-10 italic">
                    {hoverRating === 5 ? "Excellence Achieved" : 
                     hoverRating === 4 ? "Above Standard" :
                     hoverRating === 3 ? "System Baseline" :
                     hoverRating === 2 ? "Below Threshold" :
                     hoverRating === 1 ? "Critical Alert" : "Select Sentiment"}
                  </span>
                </div>
              </div>
            )}

            {step === 'feedback' && (
              <div className="space-y-12 animate-in slide-in-from-right-12 duration-700">
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${themePrimary} text-[13px] font-black uppercase tracking-[0.5em]`}>
                    <Award size={28} /> Narrative Capture
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 tracking-tighter leading-none">Share Detail</h2>
                </div>

                <div className="relative group">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={rating <= 3 ? "How can we refine our protocols to better serve you?..." : "What defined this session for you? Narrative counts..."}
                    className="w-full h-80 p-10 rounded-[3.5rem] bg-slate-50 border-none focus:ring-[16px] focus:ring-emerald-500/5 outline-none transition-all resize-none font-medium text-slate-800 text-xl md:text-3xl shadow-inner font-body placeholder:text-slate-300"
                  />
                  <div className="absolute bottom-8 right-10 text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    {comment.length} SHARDS
                  </div>
                </div>

                <button
                  onClick={() => setStep('platform-select')}
                  disabled={comment.trim().length < 2}
                  className={`w-full h-24 md:h-32 ${themeBg} text-white font-black rounded-[3rem] shadow-[0_40px_80px_rgba(5,150,105,0.3)] disabled:opacity-20 transition-all flex items-center justify-center gap-6 text-sm uppercase tracking-[0.4em] active:scale-95 group`}
                >
                  Confirm Ingestion <ArrowUpRight size={28} className="group-hover:-translate-y-1.5 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            )}

            {step === 'platform-select' && (
              <div className="flex flex-col h-full animate-in slide-in-from-bottom-12 duration-800 overflow-hidden">
                <div className="space-y-4 mb-8 shrink-0">
                  <h2 className="text-4xl md:text-6xl font-bold font-display text-slate-900 tracking-tighter leading-none">
                    Sync Node
                  </h2>
                  <p className="text-slate-400 text-lg md:text-2xl font-medium opacity-90 leading-tight">
                    Select your preferred synchronization target.
                  </p>
                </div>

                {rating <= 3 && (
                  <div className="mb-6 p-8 bg-amber-50/80 border border-amber-100 rounded-[3rem] flex items-center gap-6 animate-in slide-in-from-top-6 duration-1000 shadow-sm shrink-0">
                    <div className="size-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                      <AlertTriangle size={28} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[16px] text-amber-900 font-bold leading-tight uppercase tracking-widest">
                        Privacy Shield Active
                      </p>
                      <p className="text-[13px] text-amber-700 font-medium leading-relaxed opacity-95">
                        Private sync is recommended for threshold alerts.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6 overflow-y-auto no-scrollbar py-4 px-1 -mx-4 px-4 pb-32">
                  <PlatformCard 
                    id={ReviewPlatform.INTERNAL_ONLY}
                    icon={<ShieldCheck size={36} />} 
                    title="Private Node" 
                    desc="Manager Only"
                    color="bg-emerald-50 text-emerald-600"
                    selected={selectedPlatform === ReviewPlatform.INTERNAL_ONLY}
                    onClick={() => setSelectedPlatform(ReviewPlatform.INTERNAL_ONLY)}
                  />
                  <PlatformCard 
                    id={ReviewPlatform.GOOGLE}
                    icon={<Globe size={36} />} 
                    title="Google Cloud" 
                    desc="Maps Network"
                    color="bg-red-50 text-red-600"
                    selected={selectedPlatform === ReviewPlatform.GOOGLE}
                    onClick={() => setSelectedPlatform(ReviewPlatform.GOOGLE)}
                  />
                  <PlatformCard 
                    id={ReviewPlatform.ZOMATO}
                    icon={<UtensilsCrossed size={36} />} 
                    title="Zomato Hub" 
                    desc="Hospitality"
                    color="bg-rose-50 text-rose-600"
                    selected={selectedPlatform === ReviewPlatform.ZOMATO}
                    onClick={() => setSelectedPlatform(ReviewPlatform.ZOMATO)}
                  />
                  <PlatformCard 
                    id={ReviewPlatform.JUSTDIAL}
                    icon={<SearchCode size={36} />} 
                    title="JustDial" 
                    desc="Directories"
                    color="bg-indigo-50 text-indigo-600"
                    selected={selectedPlatform === ReviewPlatform.JUSTDIAL}
                    onClick={() => setSelectedPlatform(ReviewPlatform.JUSTDIAL)}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-white via-white/90 to-transparent flex justify-center z-30">
                  <button
                    onClick={handleFinalSubmit}
                    disabled={!selectedPlatform || isSubmitting}
                    className={`w-full h-24 md:h-28 ${themeBg} text-white font-black rounded-[3rem] flex items-center justify-center gap-6 shadow-[0_40px_80px_rgba(5,150,105,0.4)] active:scale-95 transition-all disabled:opacity-20 text-[14px] uppercase tracking-[0.5em]`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={32} /> : <>Commit Shard <ArrowUpRight size={28} /></>}
                  </button>
                </div>
              </div>
            )}

            {step === 'thank-you' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-20 py-12 animate-in zoom-in-95 duration-1000">
                <div className="space-y-16">
                  <div className={`size-56 md:size-72 rounded-full ${themeLight} ${themePrimary} flex items-center justify-center mx-auto shadow-2xl border-[16px] border-white transition-all duration-1000 transform hover:rotate-[360deg] shadow-[0_50px_100px_-20px_rgba(5,150,105,0.4)]`}>
                    <CheckCircle2 size={120} strokeWidth={1} />
                  </div>
                  <div className="space-y-8">
                    <h2 className="text-5xl md:text-8xl font-bold font-display text-slate-900 tracking-tighter leading-none">
                      Success
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed text-xl md:text-3xl opacity-90 max-w-sm mx-auto tracking-tight">
                      Thank you for contributing to the <strong>{business.name}</strong> network.
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-6 pt-10">
                  {(rating <= 3 || selectedPlatform === ReviewPlatform.INTERNAL_ONLY) && (
                    <button 
                      onClick={() => {
                        const msg = `Urgent Interaction Escalation: ${rating}★ at ${business.name}. Feedback: "${comment}"`;
                        window.open(`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(msg)}`);
                      }}
                      className="w-full h-24 md:h-28 bg-slate-900 text-white font-black rounded-[3rem] flex items-center justify-center gap-6 shadow-2xl active:scale-95 text-xs uppercase tracking-[0.5em] transition-transform hover:scale-[1.02]"
                    >
                      <MessageCircle size={32} /> Manager Escalation
                    </button>
                  )}
                  <button 
                    onClick={() => onBack ? onBack() : window.location.reload()} 
                    className="w-full h-18 rounded-[2rem] bg-white border border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-[0.6em] active:scale-95 shadow-sm hover:bg-slate-50 transition-all"
                  >
                    Terminal Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity cursor-default animate-enter pb-10">
         <Sparkles size={20} className="text-emerald-600 animate-pulse" />
         <span className="text-[12px] font-black uppercase tracking-[0.8em] text-slate-900">ReviewMaster Elite Protocol v4.2</span>
      </div>
    </div>
  );
};

const PlatformCard = ({ icon, title, desc, selected, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-10 rounded-[3.5rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 border text-center relative overflow-hidden active:scale-90 group h-full ${
      selected 
      ? 'border-emerald-500 bg-emerald-50/70 shadow-2xl scale-[1.06] z-20' 
      : 'bg-white border-slate-100 hover:border-emerald-200 shadow-xl'
    }`}
  >
    <div className={`size-22 md:size-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-1000 ${selected ? 'scale-110 shadow-glow rotate-6' : 'group-hover:scale-110 group-hover:-rotate-3'} ${color} shadow-sm`}>
      {React.cloneElement(icon as React.ReactElement, { size: 44 })}
    </div>
    <div className="space-y-2">
      <h4 className={`text-xl font-bold ${selected ? 'text-emerald-900' : 'text-slate-900'} leading-none tracking-tight`}>{title}</h4>
      <p className={`text-[12px] font-black leading-tight line-clamp-1 uppercase tracking-widest ${selected ? 'text-emerald-700' : 'text-slate-400'} opacity-70`}>{desc}</p>
    </div>
    {selected && (
      <div className="absolute top-6 right-6 size-8 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white animate-in zoom-in duration-500">
        <Check size={18} strokeWidth={4} />
      </div>
    )}
  </button>
);

export default ReviewFlow;
