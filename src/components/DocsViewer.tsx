import React, { useState } from 'react';
import { BookOpen, FileCode, Server, ShieldCheck, Terminal } from 'lucide-react';

export const DocsViewer: React.FC = () => {
  const [docTab, setDocTab] = useState<'api' | 'deployment' | 'testing'>('api');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>System Manual</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Technical Documentation & Architecture
            </h2>
            <p className="text-xs text-slate-500">
              API Endpoints, Production Deployment Guide, and Verification Test Procedures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDocTab('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                docTab === 'api' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              API Reference
            </button>
            <button
              onClick={() => setDocTab('deployment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                docTab === 'deployment' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Deployment Guide
            </button>
            <button
              onClick={() => setDocTab('testing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                docTab === 'testing' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Testing Procedures
            </button>
          </div>
        </div>

        {/* API Reference */}
        {docTab === 'api' && (
          <div className="pt-5 space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-800 font-bold">POST /api/register</span>
              <p className="text-slate-600">
                Primary registration endpoint. Performs input sanitization, Nigerian phone normalization (+234 / 080), and enforces duplicate rejection Rules 1, 2, 3, and 4 before saving.
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px]">
                {`// Rejection 409 Conflict:
{
  "error": "This name has already been used for registration.",
  "rule": 1
}`}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-800 font-bold">GET /api/validate-field</span>
              <p className="text-slate-600">
                Pre-submission single-field checker (name, email, phone) providing instant inline validation on blur or typing.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-800 font-bold">POST /api/admin/login</span>
              <p className="text-slate-600">
                JWT administrator authentication endpoint. Returns bearer token with 24-hour expiration.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-mono text-emerald-800 font-bold">GET /api/admin/export/excel & /csv</span>
              <p className="text-slate-600">
                Exports filtered records to binary Microsoft Excel (.xlsx) or CSV with UTF-8 BOM encoding.
              </p>
            </div>
          </div>
        )}

        {/* Deployment Guide */}
        {docTab === 'deployment' && (
          <div className="pt-5 space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Production Setup on Linux / Docker / Cloud Run</h4>
              <p>
                The backend is built with Express + TypeScript + Vite, using an embedded relational SQLite database with disk persistence, and includes full MySQL and PostgreSQL DDL schemas in <code className="bg-slate-200 px-1 rounded">docs/DATABASE_SCHEMA.sql</code>.
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] space-y-1">
                <div># Build both client and server bundle:</div>
                <div className="text-emerald-400">npm run build</div>
                <div className="pt-1"># Start production standalone server:</div>
                <div className="text-emerald-400">node dist/server.cjs</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Security & Rate Limiting</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>HTTPS enforcement via reverse proxy headers</li>
                <li>In-memory sliding window IP rate limiting on public registration and admin login</li>
                <li>XSS sanitization stripping HTML tags from string inputs</li>
                <li>Parameterized SQL queries preventing SQL injection</li>
                <li>Database UNIQUE constraints on lowercase normalized columns</li>
              </ul>
            </div>
          </div>
        )}

        {/* Testing Procedures */}
        {docTab === 'testing' && (
          <div className="pt-5 space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Duplicate Test Scenarios (Prompt Rules)</h4>
              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <p className="font-semibold text-slate-900">Rule 1 Test: Adebogun Oriyomi</p>
                  <p className="text-slate-600">Register with "Adebogun Oriyomi" → Rejection: "This name has already been used for registration."</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <p className="font-semibold text-slate-900">Rule 2 Test: Adebogunoriyomi@gmail.com</p>
                  <p className="text-slate-600">Register with uppercase/lowercase email → Rejection: "This email address already exists."</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <p className="font-semibold text-slate-900">Rule 3 Test: 08031234567</p>
                  <p className="text-slate-600">Register with "+234 803 123 4567" → Rejection: "This phone number has already been used."</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
