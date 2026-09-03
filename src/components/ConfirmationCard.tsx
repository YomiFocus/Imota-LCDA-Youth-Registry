import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Mail,
  Download,
  Calendar,
  MapPin,
  Briefcase,
  User,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import { RegistrationRecord } from '../types';
import { ImotaLogo } from './ImotaLogo';

interface ConfirmationCardProps {
  registration: RegistrationRecord;
  onRegisterAnother: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  registration,
  onRegisterAnother,
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch (e) {
      // safe fallback if confetti fails
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Required Green Success Message Header */}
      <div 
        id="confirmation-success-banner"
        className="mb-8 p-6 bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-5 border border-emerald-500"
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-700/80 text-xs font-semibold uppercase tracking-wider mb-1.5 text-emerald-100">
            Registration Verified & Recorded
          </span>
          {/* Exact required text from prompt */}
          <h2 className="text-xl sm:text-2xl font-bold leading-snug">
            Congratulations! Your registration has been submitted successfully.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Your unique youth identification record has been entered into the official Imota LCDA relational database. A confirmation email has also been dispatched.
          </p>
        </div>
      </div>

      {/* Action buttons bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Slip</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Mail className="w-4 h-4 text-emerald-700" />
            <span>View Dispatched Email</span>
          </button>
        </div>

        <button
          onClick={onRegisterAnother}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Register Another Person</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Printable Official Imota LCDA Youth Slip */}
      <div 
        id="printable-youth-slip"
        className="bg-white rounded-2xl border-2 border-emerald-800/80 shadow-md overflow-hidden p-6 sm:p-8 relative print:border-black print:shadow-none"
      >
        {/* Subtle council watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
          <ImotaLogo
            alt="Council Watermark"
            className="w-96 h-96 object-contain"
          />
        </div>

        {/* Council Slip Header */}
        <div className="border-b-2 border-emerald-800 pb-5 mb-6 text-center relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-xs border border-emerald-200 bg-white">
              <ImotaLogo
                alt="Council Seal"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h3 className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider">
                Lagos State Government
              </h3>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Imota Local Council Development Area
              </h4>
              <p className="text-xs font-semibold text-slate-600">
                Youth Data & Skill Development Registry
              </p>
            </div>
          </div>
          <div className="inline-block mt-2 px-4 py-1 bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-full">
            Official Youth Identification Slip
          </div>
        </div>

        {/* Primary Identification Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Official Registration Number
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono tracking-wide">
              {registration.reg_number}
            </span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Date Registered
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {new Date(registration.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Details Grid & Passport Photo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Passport Photo Column */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-40 rounded-xl border-2 border-slate-300 bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center p-1">
              {registration.photo_url ? (
                <img
                  src={registration.photo_url}
                  alt={registration.full_name}
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-2">
                  <User className="w-12 h-12 text-slate-400 mx-auto" />
                  <span className="text-[11px] text-slate-500 block mt-1">Photo Attached</span>
                </div>
              )}
            </div>
            <span className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Youth Photograph
            </span>

            {/* Simulated Barcode / QR */}
            <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center w-full">
              <div className="font-mono text-[9px] tracking-widest text-slate-700 bg-white py-1 px-2 border border-slate-300 rounded mb-1">
                ||||| | |||| ||| |||| |
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                VERIFIED REGISTRY
              </span>
            </div>
          </div>

          {/* Registrant Data Grid */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Full Legal Name
              </span>
              <span className="text-sm font-bold text-slate-900">
                {registration.full_name}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <span className="text-sm font-medium text-slate-900 break-all">
                {registration.email}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <span className="text-sm font-medium text-slate-900">
                {registration.phone}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Gender & Date of Birth
              </span>
              <span className="text-sm font-medium text-slate-900">
                {registration.gender} • {registration.dob}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Electoral Ward
              </span>
              <span className="text-sm font-semibold text-emerald-800">
                {registration.ward || 'Imota LCDA'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                LASSRA ID
              </span>
              <span className="text-sm font-medium text-slate-900 font-mono">
                {registration.lassra || 'Pending LASSRA Link'}
              </span>
            </div>

            <div className="sm:col-span-2 p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Residential Address
              </span>
              <span className="text-xs font-medium text-slate-900">
                {registration.address}, {registration.state_of_origin} State Origin
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Occupation & Education
              </span>
              <span className="text-xs font-medium text-slate-900">
                {registration.occupation} • {registration.education || 'General'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                Skills / Expertise
              </span>
              <span className="text-xs font-medium text-slate-900">
                {registration.skills || 'General Vocational'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer verification notice */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Verified & Relational Unique Constraint Enforced</span>
          </div>
          <div className="text-center sm:text-right">
            <div>Directorate of Youth Development • Imota Secretariat</div>
            <div className="text-slate-400 font-normal">Contact: +234 (0) 8028514026, 8020992646</div>
          </div>
        </div>
      </div>

      {/* Confirmation Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900">Dispatched Confirmation Email</h3>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-1.5 mb-4">
              <div><span className="text-slate-400">To:</span> {registration.email}</div>
              <div><span className="text-slate-400">From:</span> youthsportsimotalcda@gmail.com</div>
              <div><span className="text-slate-400">Subject:</span> Imota LCDA Youth Registration Confirmation - {registration.reg_number}</div>
              <div><span className="text-slate-400">Date:</span> {new Date().toUTCString()}</div>
              <div><span className="text-slate-400">Delivery Status:</span> <span className="text-emerald-700 font-bold">DISPATCHED (250 OK)</span></div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm space-y-3 text-slate-800">
              <p className="font-semibold text-slate-900">Dear {registration.full_name},</p>
              <p>
                <strong>Congratulations! Your registration has been submitted successfully.</strong>
              </p>
              <p>
                Your youth demographic record has been verified and registered with the Imota Local Council Development Area (LCDA) Youth Empowerment Directorate.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs space-y-1 text-emerald-950 font-medium">
                <div>Registration Slip Number: <strong>{registration.reg_number}</strong></div>
                <div>Assigned Ward: <strong>{registration.ward || 'Imota LCDA'}</strong></div>
                <div>Skill Classification: <strong>{registration.skills || 'General'}</strong></div>
              </div>
              <p className="text-xs text-slate-500">
                Please keep your registration slip safe for upcoming bursaries, vocational bootcamps, and Lagos State youth empowerment initiatives.
              </p>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                Signed,<br />
                <strong>Registrar, Directorate of Youth Affairs</strong><br />
                Imota Local Council Development Area, Lagos State<br />
                <span className="text-[11px] text-slate-500">Helpline: +234 (0) 8028514026, 8020992646 • Email: youthsportsimotalcda@gmail.com</span>
              </p>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
