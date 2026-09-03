import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { RegistrationForm } from './components/RegistrationForm';
import { ConfirmationCard } from './components/ConfirmationCard';
import { AdminDashboard } from './components/AdminDashboard';
import { RulesInspector } from './components/RulesInspector';
import { DocsViewer } from './components/DocsViewer';
import { RegistrationRecord, AdminUser } from './types';
import { ImotaLogo } from './components/ImotaLogo';
import { Shield, Building, MapPin, Mail, Phone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'admin' | 'tests' | 'docs'>('register');
  const [submittedRegistration, setSubmittedRegistration] = useState<RegistrationRecord | null>(null);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('imota_admin_token') || null;
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('imota_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (token: string, admin: AdminUser) => {
    setAdminToken(token);
    setAdminUser(admin);
    localStorage.setItem('imota_admin_token', token);
    localStorage.setItem('imota_admin_user', JSON.stringify(admin));
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('imota_admin_token');
    localStorage.removeItem('imota_admin_user');
  };

  const handleRegistrationSuccess = (reg: RegistrationRecord) => {
    setSubmittedRegistration(reg);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleRegisterAnother = () => {
    setSubmittedRegistration(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Council Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'register' && submittedRegistration) {
            // Keep confirmation view if user just registered
          }
        }}
        isAdminLoggedIn={!!adminToken}
        onLogoutAdmin={handleLogout}
      />

      {/* Hero section (always visible on register & landing view) */}
      {activeTab === 'register' && !submittedRegistration && (
        <HeroSection
          onStartRegistration={() => {
            const el = document.getElementById('reg-fullname');
            if (el) el.focus();
            window.scrollTo({ top: 460, behavior: 'smooth' });
          }}
          onOpenTestRules={() => setActiveTab('tests')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'register' && (
          submittedRegistration ? (
            <ConfirmationCard
              registration={submittedRegistration}
              onRegisterAnother={handleRegisterAnother}
            />
          ) : (
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          )
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            token={adminToken}
            adminUser={adminUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'tests' && (
          <RulesInspector />
        )}

        {activeTab === 'docs' && (
          <DocsViewer />
        )}
      </main>

      {/* Council Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800 print:hidden mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shrink-0 flex items-center justify-center">
                  <ImotaLogo
                    alt="Imota LCDA Seal"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    Imota Local Council Development Area
                  </h4>
                  <p className="text-[11px] text-emerald-400">Lagos State Government</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official Youth Demographic & Vocational Enrollment Portal. Committed to youth empowerment, skills training, and socioeconomic advancement across all council wards.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Council Secretariat & Support
              </h4>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Imota LCDA Council Secretariat, Palace Road, Imota, Lagos</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href="mailto:youthsportsimotalcda@gmail.com"
                  className="hover:text-emerald-400 hover:underline transition-colors"
                >
                  youthsportsimotalcda@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <a href="tel:+2348028514026" className="hover:text-emerald-400 hover:underline transition-colors">+234 (0) 8028514026</a>,{' '}
                  <a href="tel:+2348020992646" className="hover:text-emerald-400 hover:underline transition-colors">8020992646</a>
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Integrity & Duplicate Prevention
              </h4>
              <p className="text-xs leading-relaxed">
                This registry actively enforces database-level UNIQUE constraints preventing duplicate names, email addresses, and phone numbers before database insertion.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Encrypted & Relational SQL Protected</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <p>© 2026 Imota Local Council Development Area (LCDA). All rights reserved.</p>
            <p>Designed for Youth Development & Council Administration</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
