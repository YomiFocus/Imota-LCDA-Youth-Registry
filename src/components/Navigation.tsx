import React from 'react';
import { ShieldCheck, UserCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { ImotaLogo } from './ImotaLogo';

interface NavigationProps {
  activeTab: 'register' | 'admin' | 'tests' | 'docs';
  setActiveTab: (tab: 'register' | 'admin' | 'tests' | 'docs') => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onLogoutAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-xs">
      {/* Top emergency & council information banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Lagos State Government • Ikorodu Division</span>
            <span className="text-emerald-300">|</span>
            <span>Imota Local Council Development Area</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <span className="hidden md:inline">
              Enquiries:{' '}
              <a
                href="mailto:youthsportsimotalcda@gmail.com"
                className="hover:underline hover:text-white transition-colors font-medium"
              >
                youthsportsimotalcda@gmail.com
              </a>
            </span>
            <span className="flex items-center gap-1">
              <span>Youth Secretariat:</span>
              <a href="tel:+2348028514026" className="hover:underline hover:text-white transition-colors">+234 (0) 8028514026</a>,
              <a href="tel:+2348020992646" className="hover:underline hover:text-white transition-colors">8020992646</a>
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Council Title */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer"
            onClick={() => setActiveTab('register')}
          >
            <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-emerald-600 to-emerald-700 shadow-sm shrink-0">
              <ImotaLogo
                alt="Imota LCDA Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Lagos State
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Official Registry
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Imota LCDA Youth Registration Portal
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Directorate of Youth Development & Empowerment
              </p>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="nav-register-btn"
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Registration Form</span>
            </button>

            <button
              id="nav-tests-btn"
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hidden md:flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Duplicate Rules</span>
            </button>

            <button
              id="nav-docs-btn"
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hidden lg:flex items-center gap-1.5 ${
                activeTab === 'docs'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>SQL & Docs</span>
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
