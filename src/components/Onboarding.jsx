import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FiArrowRight, FiArrowLeft, FiCheck, FiPlus, FiUser, FiGlobe, FiHeart, FiSettings, FiZap } from 'react-icons/fi';
import Logo from './Logo';
import { INTEREST_CATEGORIES, PREFERENCE_OPTIONS, COUNTRIES } from '../utils/interests';

export default function Onboarding({ initialUser, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialUser?.name || '');
  const [country, setCountry] = useState(initialUser?.country || '');
  const [interests, setInterests] = useState(initialUser?.interests || []);
  const [prefs, setPrefs] = useState(initialUser?.prefs || []);
  const [customInterest, setCustomInterest] = useState('');
  const [activeCat, setActiveCat] = useState(INTEREST_CATEGORIES[0].cat);
  const totalSteps = 4;

  useEffect(() => {
    if (step === 4) {
      // Fire confetti!
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#e50914', '#ff3d4f', '#ffffff', '#ff6b6b'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();

      // Big burst
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors,
      });
    }
  }, [step]);

  const toggleInterest = (item) => {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const addCustom = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };
  const togglePref = (id) => {
    setPrefs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const next = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && interests.length < 3) return;
    if (step < totalSteps) setStep(step + 1);
    else onComplete({ name: name.trim(), country: country || 'US', interests, prefs });
  };

  const stepInfo = [
    { icon: FiUser, title: 'Welcome to VidFlow', subtitle: "Let's create your personalized streaming journey" },
    { icon: FiHeart, title: 'What captivates you?', subtitle: `Choose interests to tailor your feed • ${interests.length} selected` },
    { icon: FiSettings, title: 'Content Preferences', subtitle: 'Pick the content styles you enjoy most' },
    { icon: FiZap, title: "You're All Set!", subtitle: 'Your personalized VidFlow experience awaits' },
  ];
  const current = stepInfo[step - 1];

  return (
    <div className="fixed inset-0 z-[9000]">
      {/* Animated background */}
      <div className="absolute inset-0 gr-mesh" />
      <div className="absolute inset-0 opacity-40" style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(229,9,20,0.3), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,61,79,0.2), transparent 50%)',
      }} />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-vf-red/10 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />

      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-3xl bg-vf-dark/80 backdrop-blur-xl rounded-[2rem] border border-vf-border shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header with logo */}
            <div className="relative p-6 sm:p-8 pb-4 border-b border-vf-border/50 overflow-hidden">
              <div className="absolute inset-0 gr-red opacity-5" />
              <div className="relative flex flex-col items-center">
                <div className="mb-4">
                  <Logo size="lg" />
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mb-5">
                  <div className="flex justify-between text-[10px] text-vf-gray mb-2 uppercase tracking-widest font-semibold">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round((step / totalSteps) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-vf-border rounded-full overflow-hidden">
                    <div className="h-full gr-red rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl gr-red flex items-center justify-center mb-3 shadow-lg shadow-red-900/40">
                  <current.icon size={22} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-center font-display">{current.title}</h2>
                <p className="text-vf-gray text-center text-sm mt-1.5">{current.subtitle}</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              {step === 1 && (
                <div className="space-y-5 animate-slideUp">
                  <div>
                    <label className="block text-xs font-bold text-vf-light mb-2 uppercase tracking-wider">Your Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-vf-gray" size={16} />
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="What should we call you?"
                        className="w-full bg-vf-card border border-vf-border rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-vf-gray focus:border-vf-red transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-vf-light mb-2 uppercase tracking-wider">Country</label>
                    <div className="relative">
                      <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-vf-gray z-10" size={16} />
                      <select value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full bg-vf-card border border-vf-border rounded-2xl pl-11 pr-4 py-3.5 text-white focus:border-vf-red transition-colors appearance-none cursor-pointer">
                        <option value="">Select your country</option>
                        {COUNTRIES.map(c => {
                          const [code, cName] = c.split(':');
                          return <option key={code} value={code}>{cName}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-vf-red/5 border border-vf-red/20 rounded-2xl flex gap-3">
                    <div className="w-10 h-10 rounded-xl gr-red flex items-center justify-center flex-shrink-0">
                      <FiHeart size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Personalized just for you</p>
                      <p className="text-xs text-vf-gray mt-0.5">We'll curate content based on your interests and region</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-slideUp">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <FiPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-vf-gray" size={14} />
                      <input type="text" value={customInterest} onChange={e => setCustomInterest(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        placeholder="Add your own interest..."
                        className="w-full bg-vf-card border border-vf-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:border-vf-red transition-colors" />
                    </div>
                    <button onClick={addCustom} className="px-4 py-2.5 gr-red rounded-xl text-sm font-bold hover:opacity-90">Add</button>
                  </div>

                  {/* Category tabs */}
                  <div className="hscroll flex gap-1.5 mb-4 pb-1">
                    {INTEREST_CATEGORIES.map(cat => (
                      <button key={cat.cat} onClick={() => setActiveCat(cat.cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          activeCat === cat.cat ? 'gr-red text-white' : 'bg-vf-card text-vf-gray hover:bg-vf-card2'
                        }`}>
                        {cat.icon} {cat.cat}
                      </button>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="max-h-[35vh] overflow-y-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_CATEGORIES.find(c => c.cat === activeCat)?.items.map(item => (
                        <button key={item}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            interests.includes(item)
                              ? 'gr-red border-transparent text-white shadow-lg shadow-red-900/30'
                              : 'bg-vf-card border-vf-border text-vf-light hover:border-vf-red'
                          }`}
                          onClick={() => toggleInterest(item)}>
                          {interests.includes(item) && <FiCheck className="inline mr-1" size={10} />}
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {interests.length > 0 && (
                    <div className="mt-4 p-3 bg-vf-card/50 border border-vf-border rounded-xl">
                      <p className="text-xs text-vf-gray mb-2">Your picks:</p>
                      <div className="flex flex-wrap gap-1">
                        {interests.slice(0, 10).map(i => (
                          <span key={i} className="px-2 py-0.5 gr-red rounded-full text-[10px] font-semibold">{i}</span>
                        ))}
                        {interests.length > 10 && <span className="text-[10px] text-vf-gray">+{interests.length - 10}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-3 animate-slideUp">
                  {PREFERENCE_OPTIONS.map(p => (
                    <button key={p.id}
                      className={`relative rounded-2xl p-4 border text-left transition-all ${
                        prefs.includes(p.id)
                          ? 'border-vf-red bg-vf-red/10 shadow-lg shadow-red-900/20'
                          : 'border-vf-border bg-vf-card hover:border-vf-red/50'
                      }`}
                      onClick={() => togglePref(p.id)}>
                      {prefs.includes(p.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 gr-red rounded-full flex items-center justify-center">
                          <FiCheck size={12} />
                        </div>
                      )}
                      <p className="text-sm font-bold">{p.label}</p>
                      <p className="text-[11px] text-vf-gray mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-4 animate-scaleIn">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full gr-red flex items-center justify-center mx-auto shadow-2xl shadow-red-900/50" style={{ animation: 'float 3s ease-in-out infinite' }}>
                      <FiCheck size={44} strokeWidth={3} />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-vf-red animate-ping opacity-30" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 font-display">Hey <span className="text-gradient">{name}</span>! 🎉</h3>
                  <p className="text-vf-gray text-sm mb-5 max-w-md mx-auto">
                    We've crafted a personalized experience with {interests.length} interests and {prefs.length} preferences. Get ready to explore!
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                    {interests.slice(0, 10).map(i => (
                      <span key={i} className="px-3 py-1 bg-vf-card border border-vf-border rounded-full text-xs font-medium">{i}</span>
                    ))}
                    {interests.length > 10 && <span className="px-3 py-1 bg-vf-card border border-vf-border rounded-full text-xs text-vf-gray">+{interests.length - 10}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-vf-border/50 flex justify-between gap-3">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl border border-vf-border text-vf-gray hover:text-white hover:border-vf-red transition-colors text-sm font-medium flex items-center gap-1.5">
                  <FiArrowLeft size={14} /> Back
                </button>
              ) : <div />}
              <button onClick={next}
                className={`px-7 py-2.5 rounded-xl gr-red text-white font-bold text-sm hover:opacity-90 transition-opacity ml-auto flex items-center gap-1.5 shadow-lg shadow-red-900/30 ${
                  (step === 1 && !name.trim()) || (step === 2 && interests.length < 3) ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                {step === totalSteps ? <>🚀 Start Exploring</> : <>Continue <FiArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}