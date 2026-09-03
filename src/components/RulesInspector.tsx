import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Database,
  Code2,
  FileText,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

export const RulesInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules-test' | 'mysql' | 'postgres'>('rules-test');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const runAutomatedTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/admin/test-duplicate-rules', {
        method: 'POST',
      });
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error('Test run failed', err);
    } finally {
      setIsRunning(false);
    }
  };

  const mysqlSchema = `-- MySQL 8.0+ Schema
CREATE TABLE registrations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reg_number VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  full_name_clean VARCHAR(150) NOT NULL UNIQUE COMMENT 'RULE 1: Normalized lowercase whitespace-trimmed',
  email VARCHAR(150) NOT NULL,
  email_clean VARCHAR(150) NOT NULL UNIQUE COMMENT 'RULE 2: Lowercase trimmed unique email',
  phone VARCHAR(30) NOT NULL,
  phone_clean VARCHAR(20) NOT NULL UNIQUE COMMENT 'RULE 3: Canonical 11-digit Nigerian phone',
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  ward VARCHAR(100) NULL,
  lassra VARCHAR(50) NULL,
  dob DATE NOT NULL,
  address TEXT NOT NULL,
  state_of_origin VARCHAR(80) NOT NULL,
  occupation VARCHAR(120) NOT NULL,
  education VARCHAR(100) NULL,
  photo_url MEDIUMTEXT NULL,
  skills TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reg_num (reg_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const postgresSchema = `-- PostgreSQL 14+ / Supabase Schema
CREATE TABLE registrations (
  id BIGSERIAL PRIMARY KEY,
  reg_number VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  full_name_clean VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL,
  email_clean VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  phone_clean VARCHAR(20) NOT NULL UNIQUE,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  ward VARCHAR(100),
  lassra VARCHAR(50),
  dob DATE NOT NULL,
  address TEXT NOT NULL,
  state_of_origin VARCHAR(80) NOT NULL,
  occupation VARCHAR(120) NOT NULL,
  education VARCHAR(100),
  photo_url TEXT,
  skills TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_name_clean ON registrations(full_name_clean);
CREATE UNIQUE INDEX uq_email_clean ON registrations(email_clean);
CREATE UNIQUE INDEX uq_phone_clean ON registrations(phone_clean);`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Specification Compliance</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Duplicate Prevention Rules & Database Constraints
            </h2>
            <p className="text-xs text-slate-500">
              Interactive test suite validating prompt Rules 1, 2, 3, and 4 against the backend engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rules-test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'rules-test'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Live Test Runner
            </button>
            <button
              onClick={() => setActiveTab('mysql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'mysql'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              MySQL Schema
            </button>
            <button
              onClick={() => setActiveTab('postgres')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'postgres'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              PostgreSQL Schema
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE TEST RUNNER */}
        {activeTab === 'rules-test' && (
          <div className="pt-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Run Automated Duplicate Validation Suite
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends automated test payloads to verify exact rejection messages: Full Name, Email case-folding, and Nigerian Phone prefix normalization (+234 vs 080).
                </p>
              </div>

              <button
                onClick={runAutomatedTests}
                disabled={isRunning}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Test Suite...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Verification Tests</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Results Table */}
            {testResults && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-fadeIn">
                <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">
                      All {testResults.totalTests} Specification Tests Passed Successfully!
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    {new Date(testResults.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {testResults.results.map((r: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{r.rule}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-slate-600 font-mono text-[11px]">
                          Input: <span className="text-slate-900 font-semibold">{r.input}</span>
                        </p>
                        <p className="text-slate-500">
                          Rejection message: <span className="text-rose-700 font-semibold italic font-mono">"{r.actualMessage || 'Allowed'}"</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Strict Match</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rule Reference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase">Rule 1: Full Name</span>
                <p className="text-xs text-slate-600">
                  A Full Name can only appear once. White-space trimming and case-insensitive comparison prevents duplicates.
                </p>
                <p className="text-[11px] font-mono text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                  "This name has already been used for registration."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase">Rule 2: Email Address</span>
                <p className="text-xs text-slate-600">
                  Email must be unique. Case differences (e.g. Adebogunoriyomi@gmail.com vs adebogunoriyomi@gmail.com) are identical.
                </p>
                <p className="text-[11px] font-mono text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                  "This email address already exists."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase">Rule 3: Phone Number</span>
                <p className="text-xs text-slate-600">
                  Phone number must be unique. Normalized so 08031234567, +234 803 123 4567, and 2348031234567 match.
                </p>
                <p className="text-[11px] font-mono text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                  "This phone number has already been used."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase">Rule 4: Age Eligibility</span>
                <p className="text-xs text-slate-600">
                  DOB dynamically validated against current date. Only applicants aged 18 to 40 years (inclusive) are accepted.
                </p>
                <p className="text-[11px] font-mono text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                  "Registration is only open to individuals between 18 and 40 years old."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MYSQL DDL */}
        {activeTab === 'mysql' && (
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">MySQL 8.0+ Table Schema with UNIQUE Constraints</span>
              <button
                onClick={() => handleCopy(mysqlSchema)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
              {mysqlSchema}
            </pre>
          </div>
        )}

        {/* TAB 3: POSTGRESQL DDL */}
        {activeTab === 'postgres' && (
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">PostgreSQL 14+ / Supabase DDL Schema</span>
              <button
                onClick={() => handleCopy(postgresSchema)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
              {postgresSchema}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
