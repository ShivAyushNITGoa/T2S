import React from 'react';

interface LogoProps {
  className?: string;
  src?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-8 h-8',
  src = '/Logo-real.png',
}) => {
  return (
    <div
      className={`${className} flex items-center justify-center overflow-hidden rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] select-none bg-black shrink-0`}
    >
      <img
        src={src}
        alt="Talk2Society Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
