import React from 'react';
import { ShieldAlert, CheckCircle, Award, Sparkles, Building2, Users } from 'lucide-react';
import { ImotaLogo } from './ImotaLogo';

interface HeroSectionProps {
  onStartRegistration: () => void;
  onOpenTestRules: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartRegistration,
  onOpenTestRules,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/50">
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Dedicated 4x4-inch official logo display area */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative group">
              {/* Outer decorative ring reflecting Lagos State / Imota colors */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-300 rounded-2xl opacity-75 blur-xs group-hover:opacity-100 transition duration-300" />
              
              {/* Dedicated 4 x 4 inch framed box (approx 160px x 160px) */}
              <div 
                id="imota-official-logo-container"
                className="relative w-38 h-38 sm:w-42 sm:h-42 bg-white rounded-2xl p-2.5 shadow-2xl flex items-center justify-center border-2 border-amber-400/40"
                style={{ minWidth: '150px', minHeight: '150px' }}
              >
                <ImotaLogo
                  id="hero-official-council-seal"
                  alt="Official Imota LCDA Crest and Seal"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
            <span className="mt-2.5 text-[11px] font-semibold tracking-wider uppercase text-emerald-200/90 text-center">
              Official Council Seal
            </span>
            <span className="text-[10px] text-emerald-300/70">
              4 × 4 Inch Heraldic Area
            </span>
          </div>

          {/* Headline & Mission copy */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Government Youth Registry 2026</span>
            </div>

            {/* Prominently & boldly displayed mandatory headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Welcome to the Imota LCDA Youth Data Registration Portal
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
              Empowering the next generation across Imota Local Council Development Area. This centralized portal securely captures youth demographics, vocational expertise, and educational qualifications while enforcing automated, real-time duplicate rejection.
            </p>

            {/* Quick action buttons & status */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="hero-start-reg-btn"
                onClick={onStartRegistration}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base flex items-center gap-2"
              >
                <span>Complete Registration Now</span>
                <span className="text-slate-800">→</span>
              </button>

              <button
                id="hero-test-rules-btn"
                onClick={onOpenTestRules}
                className="px-5 py-3 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold rounded-xl border border-emerald-600/60 transition-colors text-sm sm:text-base flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>Verify Duplicate Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Highlight badges */}
        <div className="mt-10 pt-8 border-t border-emerald-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Automated Duplicate Check</p>
              <p className="text-[11px] text-emerald-200">Name, Email & Phone locked</p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">All Imota LCDA Wards</p>
              <p className="text-[11px] text-emerald-200">Ward A, B, C, & D</p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Official Council Slip</p>
              <p className="text-[11px] text-emerald-200">Instant slip & email receipt</p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Youth Empowerment</p>
              <p className="text-[11px] text-emerald-200">Priority for skills & grants</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
