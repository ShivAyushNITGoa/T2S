import React from 'react';

const Logo: React.FC<{ className?: string, src?: string }> = ({ className = "w-10 h-10", src = "/logo.png" }) => {
  const [error, setError] = React.useState(false);

  // If the src is empty string, trigger error immediately
  React.useEffect(() => {
    if (!src) {
      setError(true);
    } else {
      setError(false);
    }
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center ${className} group cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(245,158,11,0.05)]`}>
      {!error ? (
        <img 
          src={src || undefined} 
          alt="Talk2Society Logo" 
          className="w-full h-full object-cover" 
          onError={() => setError(true)}
        />
      ) : (
        // Premium crafted vector fallback SVG
        <svg 
          viewBox="0 0 100 100" 
          className="w-[85%] h-[85%] animate-pulse-slow"
          style={{ animationDuration: '4s' }}
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Subtle background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#glowGrad)" />
          
          {/* Sleek outer hexagon */}
          <polygon 
            points="50,12 83,31 83,69 50,88 17,69 17,31" 
            fill="none" 
            stroke="url(#logoGrad)" 
            strokeWidth="3.5"
            strokeLinejoin="round" 
          />
          
          {/* Nested inner mini geometric diamond */}
          <polygon 
            points="50,22 74,36 74,64 50,78 26,64 26,36" 
            fill="none" 
            stroke="white" 
            strokeOpacity="0.12"
            strokeWidth="1.5"
            strokeLinejoin="round" 
          />

          {/* Elegant Display Monogram */}
          <text 
            x="50%" 
            y="54%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="18" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.05em"
            className="select-none"
          >
            T2S
          </text>

          {/* Golden accent dots */}
          <circle cx="50" cy="12" r="2" fill="white" />
          <circle cx="50" cy="88" r="2" fill="white" />
        </svg>
      )}
    </div>
  );
};

export default Logo;
