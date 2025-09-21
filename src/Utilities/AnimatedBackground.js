import React from 'react';

const AnimatedBackground = ({ className = "", children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating circles */}
          <div
            className="absolute w-96 h-96 bg-gradient-to-r from-[#FFF9EF]/18 to-[#E8D5C4]/18 rounded-full blur-3xl animate-pulse"
            style={{ top: '-20%', left: '-20%', animationDuration: '8s' }}
          />
          <div
            className="absolute w-80 h-80 bg-gradient-to-l from-[#665446]/12 to-[#5A4633]/12 rounded-full blur-3xl animate-pulse"
            style={{ bottom: '-15%', right: '-15%', animationDuration: '10s' }}
          />
          <div
            className="absolute w-64 h-64 bg-gradient-to-t from-[#FFF9EF]/22 to-[#CDC0B6]/22 rounded-full blur-2xl animate-pulse"
            style={{ top: '15%', right: '10%', animationDuration: '9s' }}
          />
          <div
            className="absolute w-72 h-72 bg-gradient-to-b from-[#E8D5C4]/15 to-[#CDC0B6]/15 rounded-full blur-3xl animate-pulse"
            style={{ bottom: '20%', left: '15%', animationDuration: '11s' }}
          />

          {/* Medium floating elements */}
          <div
            className="absolute w-48 h-48 bg-gradient-to-tr from-[#FFF9EF]/25 to-[#665446]/8 rounded-full blur-xl animate-pulse"
            style={{ top: '35%', left: '25%', animationDuration: '7s' }}
          />
          <div
            className="absolute w-56 h-56 bg-gradient-to-bl from-[#CDC0B6]/20 to-[#5A4633]/12 rounded-full blur-xl animate-pulse"
            style={{ top: '55%', right: '20%', animationDuration: '8.5s' }}
          />

          {/* Floating particles */}
          <div
            className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-50 animate-bounce"
            style={{ top: '18%', left: '12%', animationDelay: '0s', animationDuration: '5s' }}
          />
          <div
            className="absolute w-4 h-4 bg-[#665446] rounded-full opacity-40 animate-bounce"
            style={{ top: '28%', right: '14%', animationDelay: '1s', animationDuration: '6s' }}
          />
          <div
            className="absolute w-8 h-8 bg-[#FFF9EF] rounded-full opacity-35 animate-bounce"
            style={{ bottom: '42%', left: '18%', animationDelay: '2s', animationDuration: '5.5s' }}
          />
          <div
            className="absolute w-3 h-3 bg-[#5A4633] rounded-full opacity-60 animate-bounce"
            style={{ top: '72%', left: '35%', animationDelay: '0.5s', animationDuration: '4.5s' }}
          />
          <div
            className="absolute w-5 h-5 bg-[#FFF9EF] rounded-full opacity-45 animate-bounce"
            style={{ bottom: '32%', right: '28%', animationDelay: '1.8s', animationDuration: '6.2s' }}
          />
          <div
            className="absolute w-7 h-7 bg-[#665446] rounded-full opacity-35 animate-bounce"
            style={{ top: '48%', right: '8%', animationDelay: '2.5s', animationDuration: '4.8s' }}
          />
          <div
            className="absolute w-4 h-4 bg-[#E8D5C4] rounded-full opacity-55 animate-bounce"
            style={{ top: '82%', left: '50%', animationDelay: '1.2s', animationDuration: '5.2s' }}
          />
          <div
            className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-40 animate-bounce"
            style={{ bottom: '52%', right: '35%', animationDelay: '0.8s', animationDuration: '6.5s' }}
          />

          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-56 opacity-20">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#FFF9EF">
                <animate
                  attributeName="d"
                  dur="14s"
                  repeatCount="indefinite"
                  values={`M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                          M0,40 C300,100 900,20 1200,40 L1200,120 L0,120 Z;
                          M0,70 C300,140 900,-20 1200,70 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z`}
                />
              </path>
            </svg>
          </div>

          {/* Top wave */}
          <div className="absolute top-0 left-0 w-full h-48 opacity-15 transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="#665446">
                <animate
                  attributeName="d"
                  dur="16s"
                  repeatCount="indefinite"
                  values={`M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z;
                          M0,40 C300,0 900,80 1200,40 L1200,0 L0,0 Z;
                          M0,80 C300,160 900,-40 1200,80 L1200,0 L0,0 Z;
                          M0,50 C300,100 900,10 1200,50 L1200,0 L0,0 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z`}
                />
              </path>
            </svg>
          </div>

          {/* Educational themed floating elements */}
          <div
            className="absolute w-16 h-16 opacity-15 animate-spin"
            style={{ top: '25%', left: '15%', animationDuration: '25s' }}
          >
            <div className="w-full h-full bg-[#FFF9EF] transform rotate-45 rounded-lg" />
          </div>
          <div
            className="absolute w-12 h-12 opacity-12 animate-spin"
            style={{ bottom: '35%', right: '18%', animationDuration: '30s' }}
          >
            <div className="w-full h-full bg-[#665446] rounded-full" />
          </div>
          <div
            className="absolute w-10 h-10 opacity-20 animate-spin"
            style={{ top: '65%', right: '12%', animationDuration: '20s' }}
          >
            <div
              className="w-full h-full bg-[#E8D5C4]"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
          </div>
        </div>
      </div>

      {/* Content with z-index to appear above background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
