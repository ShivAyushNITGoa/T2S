import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageToggle: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5 text-xs font-mono ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      <Globe className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1 shrink-0 hidden sm:block" />
      <button
        type="button"
        onClick={() => setLang('hi')}
        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
          lang === 'hi'
            ? 'bg-amber-500 text-black shadow-sm'
            : 'text-zinc-400 hover:text-white'
        }`}
        title="हिंदी भाषा चुनें (Switch to Hindi)"
      >
        हिंदी
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-amber-500 text-black shadow-sm'
            : 'text-zinc-400 hover:text-white'
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
};
