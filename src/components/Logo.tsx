import React from 'react';

const Logo: React.FC<{ className?: string, src?: string }> = ({ className = "w-10 h-10", src = "/logo.png" }) => {
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative flex items-center justify-center ${className} group cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95 bg-white/5 rounded-full overflow-hidden border border-white/5`}>
      {!error ? (
        <img 
          src={src} 
          alt="Talk2Society Logo" 
          className="w-full h-full object-contain" 
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[10px] font-black text-white/40 tracking-tighter leading-none">
          <span>T2S</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
