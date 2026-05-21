import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Zap, TrendingUp, BookOpen, Terminal, Users, Target, 
  ChevronRight, Lock, Eye, Award, Globe, FileText, ArrowRight,
  Sparkles, HelpCircle, AlertTriangle, ShoppingCart
} from 'lucide-react';

interface GatewayViewProps {
  onLogin: () => void;
  onLoginRedirect?: () => void;
  onEnter: () => void;
  onEnterWithTab?: (tab: 'shop' | 'journey') => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  authError?: string | null;
  setAuthError?: (err: string | null) => void;
  quotaError?: any;
  onLogout?: () => void;
}

export default function GatewayView({ 
  onLogin, 
  onLoginRedirect, 
  onEnter, 
  onEnterWithTab,
  isAuthenticated, 
  userEmail,
  authError,
  setAuthError,
  quotaError,
  onLogout
}: GatewayViewProps) {
  const [activeTab, setActiveTab] = useState<'briefing' | 'philosophy' | 'pillars'>('briefing');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-amber-500 selection:text-black">
      {/* Abstract Background Grid & Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-25 z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Decorative Top Bar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            className="w-10 h-10 object-cover rounded-full border border-zinc-800 shadow-[0_0_20px_rgba(245,158,11,0.25)]" 
            alt="Talk2Society Logo" 
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="font-display font-black text-sm tracking-tight text-white uppercase block leading-none">Talk2Society</span>
            <span className="text-[10px] font-mono text-amber-400 font-black uppercase tracking-widest block mt-0.5">Sovereign Intel Gate</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onEnterWithTab && (
            <button
              onClick={() => onEnterWithTab('shop')}
              className="px-3 md:px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-[10px] font-mono font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> <span><span className="hidden sm:inline">STRATEGIC </span>SHOP / स्टोर</span>
            </button>
          )}

          {isAuthenticated ? (
            <button 
              onClick={onLogout}
              title="Click to Logout / लॉगआउट करने के लिए क्लिक करें"
              className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 hover:bg-red-950/40 border border-zinc-700 hover:border-red-500/30 rounded-full transition-all cursor-pointer group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 group-hover:bg-red-500 animate-pulse transition-colors" />
              <span className="text-[10px] font-mono text-zinc-200 group-hover:text-red-400 font-semibold max-w-[150px] truncate transition-colors">
                {userEmail} <span className="opacity-0 group-hover:opacity-100 group-hover:inline-block ml-1 text-red-400">(Logout)</span>
              </span>
            </button>
          ) : (
            <button 
              onClick={onLogin}
              title="Click to Login / लॉगिन करने के लिए क्लिक करें"
              className="hidden sm:inline-block text-[10px] bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full font-mono text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 uppercase tracking-widest font-black transition-all cursor-pointer"
            >
              SYSTEM_UNLOCKED: FALSE (Login)
            </button>
          )}
          
          <button 
            onClick={isAuthenticated ? onEnter : onLogin}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 hover:scale-[1.02] shadow-md cursor-pointer"
          >
            {isAuthenticated ? 'Enter Portal' : 'Login'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-24 z-10 space-y-16">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center pb-2"
          >
            <div className="relative p-1 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-full shadow-[0_0_55px_rgba(245,158,11,0.3)]">
              <img 
                src="/logo.png" 
                className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full bg-black" 
                alt="Talk2Society Sovereign Emblem" 
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-amber-500/40 rounded-full shadow-lg"
          >
            <Shield className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-amber-300 font-black uppercase tracking-widest">
              CONFIDENTIAL INTEL BRIEFING // गोपनीय जानकारी
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-display font-black tracking-tight uppercase leading-none text-white pt-2"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600">
              The Sovereign Briefing
            </span> is Ready.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-200 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            यह Talk2Society के पूरे साम्राज्य का एक विस्तृत <span className="text-white font-bold underline decoration-amber-500 decoration-2 underline-offset-4">'Intel Report'</span> है। 
            यह ब्रांड केवल एक यूट्यूब चैनल नहीं है, बल्कि एक <span className="text-amber-300 font-bold">'Psychological War-College'</span> है 
            जिसे <span className="text-white font-bold">A. K. Chandradipti</span> एक ऑपरेटर की तरह चला रहे हैं।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isAuthenticated ? (
              <button 
                onClick={onEnter}
                className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-mono font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_40px_rgba(245,158,11,0.35)] flex items-center justify-center gap-3 group hover:scale-[1.03] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" /> Enter Sovereign Frame / संप्रभु प्रवेश
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-5 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_45px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 group hover:scale-[1.03] cursor-pointer"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 shrink-0" alt="google" />
                Unlock Matrix with Google / संकलन फ्रेम अनलॉक करें
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}

            {onEnterWithTab && (
              <button
                onClick={() => onEnterWithTab('shop')}
                className="w-full sm:w-auto px-6 py-5 border border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-mono font-black uppercase tracking-widest rounded-2xl transition-all shadow-md hover:scale-[1.03] flex items-center justify-center gap-3 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" /> Strategic Shop / सामरिक स्टोर
              </button>
            )}
            
            <a 
              href="#intel-deck"
              className="w-full sm:w-auto px-6 py-5 border border-zinc-700 hover:border-zinc-600 bg-zinc-900 text-xs font-mono font-bold uppercase tracking-widest rounded-2xl text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" /> Scroll to Dossier / दस्तावेज़ स्क्रॉल करें
            </a>
          </motion.div>

          {/* Elegant Popup Blocked / Exception Handler Box */}
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border-2 border-amber-500 rounded-3xl p-6 md:p-8 text-left max-w-2xl mx-auto space-y-4 my-8 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-tight font-display text-white">
                  SIGN-IN INTERRUPTED / लॉगिन बाधित हुआ
                </h3>
              </div>
              <p className="text-sm text-zinc-150 font-bold leading-relaxed">
                You cancelled the auth window or it was blocked by standard browser popup filters.
              </p>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                यदि आपका ब्राउज़र Google लॉगिन पॉप-अप को ब्लॉक कर रहा है, तो आप नीचे दिए गए **"Direct Redirect"** बटन से सीधे लॉगिन कर सकते हैं। यह बिना पॉप-अप के सुरक्षित रूप से लॉगिन पूरा कर देगा:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {onLoginRedirect && (
                  <button
                    onClick={onLoginRedirect}
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Zap className="w-4 h-4 fill-black text-black" /> Run Direct Redirect / सीधा रीडायरेक्ट
                  </button>
                )}
                <button
                  onClick={() => {
                    if (setAuthError) setAuthError(null);
                    onLogin();
                  }}
                  className="px-6 py-3.5 bg-zinc-805 hover:bg-zinc-800 text-white text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 cursor-pointer flex items-center justify-center gap-2"
                >
                  Retry Popup Mode
                </button>
              </div>
            </motion.div>
          )}

          {/* Elegant Firestore Quota Exceeded / Exception Handler Box */}
          {quotaError && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border-2 border-red-500 rounded-3xl p-6 md:p-8 text-left max-w-2xl mx-auto space-y-4 my-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-tight font-display text-white">
                  DATABASE READ LIMIT EXCEEDED // डेटाबेस कोटा सीमा समाप्त
                </h3>
              </div>
              <p className="text-sm text-zinc-100 font-bold leading-relaxed">
                Our database hosting hit its Spark plan (free tier) daily read limit. No worries—as true Sovereigns, we have built-in autonomous local memory fallbacks so you can continue your study seamlessly!
              </p>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                यदि आप मुख्य व्यवस्थापक (Administrator) हैं या इस त्रुटि को दूर करना चाहते हैं, तो आप नीचे दिए गए **"Request Spark Plan Upgrade"** बटन को दबाकर बिलिंग चालू कर सकते हैं या सीमा बढ़ा सकते हैं:
              </p>
              <div className="pt-2">
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0467831205/firestore/databases/ai-studio-14532041-e5ec-4f1b-b575-758b9a243f26/data?openUpgradeDialog=true"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer items-center justify-center gap-3 w-full sm:w-auto text-center font-bold"
                >
                  <Sparkles className="w-4 h-4 fill-white text-white" /> Request Spark Plan Upgrade / अपग्रेड अनुरोध
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dynamic Bento Stats Grid & Navigation */}
        <div id="intel-deck" className="border-t border-zinc-800 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Digital Front (YouTube) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-zinc-900 border border-zinc-750 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden"
            >

              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">The Digital Front</h3>
                  <span className="text-xs font-bold text-zinc-300 font-mono">यूट्यूब और सामग्री कला</span>
                </div>
              </div>

              <div className="space-y-5 pt-2 border-t border-zinc-800 text-sm font-mono">
                <div className="flex items-baseline justify-between">
                  <span className="text-zinc-400 font-bold">HUNTERS AWAKENED:</span>
                  <span className="text-xl font-black font-sans text-red-400">1,500+ Subscribers</span>
                </div>
                <p className="text-zinc-250 font-semibold text-xs leading-relaxed">
                  <strong className="text-zinc-100 font-bold">Strategy:</strong> 15-20 मिनट की गहरी मनोवैज्ञानिक मास्टरक्लास और 30-सेकंड के तीखे 'Reality Checks' (Reels)।
                </p>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">VISUAL STYLE / आभास शैली</span>
                  <span className="text-xs font-black text-white block">Noir, Cinematic, Chiaroscuro lighting</span>
                  <span className="text-[11px] text-zinc-300 block font-semibold italic">अँधेरे और उजाले का खेल जो रहस्य को बढ़ाता है।</span>
                </div>
              </div>
            </motion.div>

            {/* Strategic Shop Bento Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Strategic Shop</h3>
                    <span className="text-xs font-bold text-zinc-300 font-mono">सामरिक स्टोर और हथियार</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-zinc-800 text-xs font-mono">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Core Weapons / मुख्य उत्पाद:</span>
                  <div className="space-y-1.5 text-zinc-200">
                    <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-zinc-805">
                      <span className="font-bold">📚 The 48 Laws Of Power</span>
                      <span className="text-amber-400 font-black">500 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-zinc-805">
                      <span className="font-bold">🎭 Machiavellian Guide</span>
                      <span className="text-amber-400 font-black">800 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-zinc-805">
                      <span className="font-bold">🧠 Cognitive Defense Shield</span>
                      <span className="text-amber-400 font-black">1200 XP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onEnterWithTab?.('shop')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
                >
                  <ShoppingCart className="w-4 h-4" /> Enter Store / स्टोर में प्रवेश
                </button>
              </div>
            </motion.div>

          </div>

          {/* Literary Foundation (Pillars) Section */}
          <div className="my-16 space-y-8 bg-zinc-900 p-6 md:p-12 rounded-[40px] border border-zinc-750 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2">
              <span className="text-xs font-mono text-amber-400 font-extrabold uppercase tracking-widest block">
                CORE MANUSCRIPTS / मूल पांडुलिपियां
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                The Literary Foundation
              </h2>
              <p className="text-zinc-200 text-sm max-w-xl font-medium">
                आपकी पहली सीरीज के ५ स्तंभ (Pillars) जो एक साधारण इंसान को शून्य से शिखर तक ले जाते हैं:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
              {[
                { 
                  title: "UNTOUCHABLE", 
                  subtitle: "मानसिक आज़ादी", 
                  desc: "आत्म-रक्षा और अटूट मानसिकता (Self-Defense)। बाहरी शोर को पूरी तरह फिल्टर करें।" 
                },
                { 
                  title: "COMMAND", 
                  subtitle: "दूसरों पर प्रभाव", 
                  desc: "हुकूमत और व्यक्तिगत प्रभाव (Interpersonal Power)। वाणी में अटूट भार।" 
                },
                { 
                  title: "MAYA", 
                  subtitle: "रूहों पर कब्ज़ा", 
                  desc: "भ्रम का निर्माण और मनोवैज्ञानिक सम्मोहन (Psychological Seduction)।" 
                },
                { 
                  title: "CHAKRAVYUH", 
                  subtitle: "सिस्टम हैक", 
                  desc: "कतार तोड़ना और संस्थागत आधिपत्य। नियमों को अपने लाभ के लिए मोड़ना (Systemic Dominance)।" 
                },
                { 
                  title: "VAIBHAV", 
                  subtitle: "शाही जीवन", 
                  desc: "ऐश्वर्य, संतुलन और एक राजा जैसा जीवन (The Art of Living as a Master)।" 
                }
              ].map((pillar, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all space-y-4 shadow-md">
                  <div className="flex justify-between items-center">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white tracking-tight uppercase leading-none">{pillar.title}</h4>
                    <span className="text-[11px] text-amber-400 font-extrabold block mt-1 font-mono uppercase">{pillar.subtitle}</span>
                  </div>
                  <p className="text-zinc-250 font-medium text-[11px] leading-relaxed border-t border-zinc-850 pt-3">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* High-Stakes Upcoming Project: THE SHADOW FILES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-16 items-stretch col-span-full">
            
            <div className="lg:col-span-7 bg-zinc-900 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.1)] rounded-[40px] p-6 md:p-10 space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[70px] pointer-events-none" />
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/40 text-purple-300 rounded-full text-xs font-mono font-black uppercase tracking-wider">
                  CONFIDENTIAL STATUS: ACTIVE DEVELOPMENT
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-350 uppercase font-black block">UPCOMING LITERARY BLOCKBUSTER / आगामी सीरीज</span>
                  <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                    THE SHADOW FILES
                  </h2>
                </div>

                <p className="text-zinc-100 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
                  यह सीरीज व्यक्तिगत आज़ादी से ऊपर उठकर <span className="text-purple-300 font-extrabold underline decoration-purple-500 decoration-2 underline-offset-4">'High-Stakes Reality'</span> पर केंद्रित होगी। 
                  इसमें हम भारतीय और वैश्विक राजनीति, कॉर्पोरेट युद्धों और ऐतिहासिक सफलताओं का पोस्टमार्टम (Post-mortem) करेंगे।
                </p>

                <div className="border-t border-zinc-800 pt-4 space-y-4">
                  <h4 className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest">मुख्य विशेषताएं (New Additions):</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono text-zinc-200 font-extrabold block uppercase tracking-wide">
                        📜 The Case File Model
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                        हर किताब या चैप्टर एक वास्तविक घटना पर आधारित होगा। कैसे एक राजनेता ने हारी हुई बाज़ी को 'MAYA' के ज़रिए जीता? कैसे एक कॉर्पोरेट जायंट ने 'CHAKRAVYUH' का इस्तेमाल किया? (MS Dhoni, चाणक्य, मैकियावेली केस-स्टडीज)
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono text-zinc-200 font-extrabold block uppercase tracking-wide">
                        💡 On-Demand Intelligence
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                        यह सुविधा उन 'Hunters' के लिए होगी जिन्हें विशिष्ट और व्यक्तिगत समस्याओं के लिए रणनीतिक समाधान (Strategic Dossiers) चाहिए।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-t border-zinc-800 gap-4">
                <div className="flex gap-4">
                  <div>
                    <span className="text-xs font-mono text-zinc-350 block uppercase font-bold">Premium/Paid Access</span>
                    <span className="text-sm font-black text-white font-mono uppercase tracking-tight">FOR HIGH-STAKE PLAYERS</span>
                  </div>
                </div>
                <div className="text-xs text-zinc-350 font-mono italic max-w-xs text-left sm:text-right leading-relaxed">
                  "यह भुगतान केवल जानकारी के लिए नहीं, बल्कि उस 'Unfair Advantage' के लिए होगा जो आपको भीड़ से १० साल आगे कर देगा।"
                </div>
              </div>
            </div>

            {/* Paid & Strategic Features panel */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-750 rounded-[40px] p-6 md:p-10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-black uppercase tracking-wider">
                  UPCOMING ELITE HUB
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-350 uppercase font-black block">FUTURE STRATEGY / भविष्य की रणनीति</span>
                  <h2 className="text-xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
                    Elite Premium Club
                  </h2>
                </div>

                <p className="text-zinc-200 text-sm font-medium leading-relaxed">
                  Talk2Society अब केवल 'मुफ्त ज्ञान' से ऊपर उठकर एक 'Premium Elite Club' की ओर बढ़ रहा है। आगामी सुविधायें:
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    { title: "Private Consultation", desc: "A. K. Chandradipti के साथ व्यक्तिगत रणनीतिक सत्र।" },
                    { title: "Physical Books", desc: "अमेज़न या डायरेक्ट स्टोर के ज़रिए डार्क साइकोलॉजी की Physical Hardcopies का एक्सेस।" },
                    { title: "Elite Grid Access", desc: "१०० दिन की सीरीज पूरी करने वाले 'Sovereigns' के लिए एक गुप्त नेटवर्किंग और वेल्थ-बिल्डिंग ग्रुप।" },
                    { title: "Masterclasses", desc: "Negotiation या Digital Inception जैसे विशेष विषयों पर गहन सशुल्क लाइव वर्कशॉप्स।" }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl">
                      <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase">{feat.title}</h4>
                        <p className="text-xs text-zinc-250 font-semibold leading-normal mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-center">
                <span className="text-xs font-mono text-zinc-250 font-black uppercase">BUILDING THE SYSTEM FOR SOVEREIGNS</span>
              </div>
            </div>

          </div>

          {/* Action Call at bottom of Gateway */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 rounded-[40px] p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight leading-none">
                Begin Your Metamorphosis
              </h2>
              <p className="text-amber-350 text-xs md:text-sm font-mono font-black uppercase tracking-widest">
                भीड़ का हिस्सा बने रहना विनाश है। संप्रभु अस्तित्व ही एकमात्र विकल्प है।
              </p>
              <p className="text-zinc-200 text-xs md:text-sm leading-relaxed max-w-lg mx-auto font-medium">
                जब आप १००-दिवसीय मास्टर फ्रेम में प्रवेश करते हैं, तो आपका पुराना आत्म विसर्जित हो जाता है। 
                हर दिन आपको एक नई कमांड, उसकी गहरी डार्क साइकोलॉजी और आत्म-सुरक्षा का रणनीतिक मंत्र प्रदान किया जाता है।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              {isAuthenticated ? (
                <button 
                  onClick={onEnter}
                  className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-mono font-black uppercase tracking-widest rounded-2xl hover:scale-[1.03] transition-all shadow-[0_0_50px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" /> Enter Sovereign Frame / संप्रभु प्रवेश
                </button>
              ) : (
                <button 
                  onClick={onLogin}
                  className="w-full sm:w-auto px-8 py-5 bg-white text-black text-xs font-mono font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 hover:scale-[1.03] transition-all shadow-[0_0_50px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5 shrink-0" alt="google" />
                  Initiate Ascension Frame / प्रारंभ करें
                </button>
              )}
            </div>
            
            <div className="pt-4 text-xs font-mono text-zinc-400 font-extrabold block">
              ACCESS GRANTED ONLY TO SOVEREIGN OPERATORS // © Talk2Society
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
