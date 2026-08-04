import React, { useState } from 'react';
import { 
  Brain, Zap, Sparkles, Shield, Send, CheckCircle2, 
  HelpCircle, AlertTriangle, ArrowRight, RefreshCw, Trophy, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface AIScenarioSimulatorProps {
  onXpEarned?: (amount: number, reason: string) => Promise<void>;
}

interface DynamicScenario {
  title: string;
  hindiTitle: string;
  situation: string;
  hindiSituation: string;
  options: {
    text: string;
    hindiText: string;
    isSovereign: boolean;
    feedback: string;
    hindiFeedback: string;
    principle: string;
  }[];
}

export default function AIScenarioSimulator({ onXpEarned }: AIScenarioSimulatorProps) {
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<DynamicScenario | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample quick scenarios
  const QUICK_PROMPTS = [
    "High-Pressure Salary Negotiation with an Aggressive HR",
    "Dealing with a Toxic Friend spreading rumors",
    "Overcoming Procrastination on a critical career exam",
    "Maintaining composure when accused falsely in public"
  ];

  const generateScenarioWithAI = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg('');
    setActiveScenario(null);
    setSelectedOption(null);
    setXpClaimed(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an elite Stoic Mindset Coach & Sovereign Strategist. Generate a realistic high-stakes psychological scenario based on this user prompt: "${promptText}".
Return JSON strictly in this schema:
{
  "title": "Short Title in English",
  "hindiTitle": "Short Title in Hindi",
  "situation": "Detailed realistic high-stakes situation in English",
  "hindiSituation": "Detailed situation in Hindi",
  "options": [
    {
      "text": "Reactive/Emotional response option",
      "hindiText": "Option text in Hindi",
      "isSovereign": false,
      "feedback": "Why this choice fails stoic self-mastery",
      "hindiFeedback": "Feedback in Hindi",
      "principle": "Reaction Trap"
    },
    {
      "text": "Sovereign/Stoic composed response option",
      "hindiText": "Option text in Hindi",
      "isSovereign": true,
      "feedback": "Why this represents supreme emotional poise and strategic brilliance",
      "hindiFeedback": "Feedback in Hindi",
      "principle": "Dichotomy of Control"
    },
    {
      "text": "Passive/Submissive response option",
      "hindiText": "Option text in Hindi",
      "isSovereign": false,
      "feedback": "Why submission invites repeated exploitation",
      "hindiFeedback": "Feedback in Hindi",
      "principle": "Passive Submission"
    }
  ]
}`,
          config: { responseMimeType: 'application/json' }
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text) as DynamicScenario;
          setActiveScenario(parsed);
          setIsGenerating(false);
          return;
        }
      }
      throw new Error("API Key or response unavailable");
    } catch (err) {
      console.warn("AI generation fallback activated:", err);
      // Fallback offline dynamic scenario
      setActiveScenario({
        title: `Strategic Conflict: ${promptText.slice(0, 30)}`,
        hindiTitle: `रणनीतिक चुनौती: ${promptText.slice(0, 30)}`,
        situation: `You are faced with a high-stakes challenge regarding: "${promptText}". Tensions are high and people are watching your emotional response closely.`,
        hindiSituation: `आप इस चुनौती का सामना कर रहे हैं: "${promptText}"। स्थितियाँ संवेदनशील हैं और आपकी हर प्रतिक्रिया देखी जा रही है।`,
        options: [
          {
            text: "React with immediate emotional irritation and demand respect.",
            hindiText: "गुस्से में तुरंत तीखी प्रतिक्रिया देना और अपना सम्मान माँगना।",
            isSovereign: false,
            feedback: "Impulsive anger surrenders your psychological leverage to the opponent.",
            hindiFeedback: "आवेगपूर्ण गुस्सा आपके मानसिक नियंत्रण को कमजोर बनाता है।",
            principle: "Emotional Impulse Trap"
          },
          {
            text: "Apply Sovereign Frame: Pause 3 seconds, respond with calm clarity, separating facts from emotions.",
            hindiText: "संप्रभु ढाँचा: 3 सेकंड रुकें, बिना उत्तेजित हुए स्पष्ट व तार्किक तथ्य रखें।",
            isSovereign: true,
            feedback: "Supreme self-command. By controlling your pulse and voice tone, you dominate the frame.",
            hindiFeedback: "सर्वोच्च आत्म-नियंत्रण। शांत रहकर आपने पूरी स्थिति को अपने पक्ष में कर लिया।",
            principle: "Stoic Emotional Mastery"
          },
          {
            text: "Remain completely silent and accept whatever outcome happens passively.",
            hindiText: "चुपचाप दबाव स्वीकार कर लेना और कोई कदम न उठाना।",
            isSovereign: false,
            feedback: "Passive submission signals vulnerability and encourages further encroachment.",
            hindiFeedback: "निष्क्रिय समर्पण कमजोरी का प्रतीक है।",
            principle: "Passive Compliance"
          }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = async (index: number) => {
    setSelectedOption(index);
    if (!xpClaimed && activeScenario?.options[index]?.isSovereign && onXpEarned) {
      setXpClaimed(true);
      await onXpEarned(50, "AI Scenario Mastery / परिदृश्य विजय");
    }
  };

  return (
    <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 block">
            Mind Lab / मानसिक प्रयोगशाला
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight">
            AI Scenario <span className="text-amber-500">Simulator</span>
          </h2>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Simulate custom real-world psychological dilemmas. Enter any situation below to test your emotional composure with Gemini AI analysis.
      </p>

      {/* Input Box */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type any situation (e.g. Boss taking credit, Public speaking anxiety)..."
            className="w-full bg-black/50 border border-white/10 rounded-2xl pl-4 pr-32 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && generateScenarioWithAI(customInput)}
          />
          <button
            onClick={() => generateScenarioWithAI(customInput)}
            disabled={!customInput.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setCustomInput(prompt);
                generateScenarioWithAI(prompt);
              }}
              className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-amber-500/30 rounded-xl text-[10px] text-gray-400 hover:text-amber-400 transition-all font-mono"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario Display */}
      {activeScenario && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-amber-500/20 rounded-2xl p-5 space-y-4"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">
              {activeScenario.hindiTitle}
            </span>
            <h3 className="text-base font-bold text-white">
              {activeScenario.title}
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              {activeScenario.situation}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {activeScenario.options.map((option, idx) => {
              const isSelected = selectedOption === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? option.isSovereign
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-300'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div className="font-bold mb-1">{option.text}</div>
                  <div className="text-[10px] opacity-75 font-mono">{option.hindiText}</div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/10 space-y-1"
                    >
                      <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[10px]">
                        {option.isSovereign ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Sovereign Choice (+50 XP)</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Sub-Optimal Response</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-300">{option.feedback}</p>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
