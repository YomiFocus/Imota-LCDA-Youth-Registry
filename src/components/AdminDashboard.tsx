import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Search,
  Download,
  Printer,
  Trash2,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  LogOut,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
  PieChart,
  Layers,
} from 'lucide-react';
import { RegistrationRecord, RegistrationStats, AdminUser } from '../types';
import { ImotaLogo } from './ImotaLogo';
import { calculateAge } from '../utils/ageValidation';

interface AdminDashboardProps {
  token: string | null;
  adminUser: AdminUser | null;
  onLoginSuccess: (token: string, admin: AdminUser) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('youthsportsimotalcda@gmail.com');
  const [loginPassword, setLoginPassword] = useState('Admin@Imota2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard data state
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');

  // Selected registration for modal view or edit
  const [viewingRecord, setViewingRecord] = useState<RegistrationRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<RegistrationRecord | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Active view tab in admin: records, stats, emails
  const [adminTab, setAdminTab] = useState<'records' | 'analytics' | 'emails'>('records');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Fetch stats and registrations
  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Registrations
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedWard !== 'All') params.append('ward', selectedWard);
      if (selectedGender !== 'All') params.append('gender', selectedGender);

      const regRes = await fetch(`/api/admin/registrations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData.records);
      }

      // 3. Fetch Dispatched Emails
      const emailRes = await fetch('/api/admin/emails', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (emailRes.ok) {
        const emailData = await emailRes.json();
        setEmailLogs(emailData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, searchQuery, startDate, endDate, selectedWard, selectedGender]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed. Invalid email or password.');
        setIsLoggingIn(false);
        return;
      }

      onLoginSuccess(data.token, data.admin);
      setIsLoggingIn(false);
    } catch (err) {
      setLoginError('Server unreachable. Please check backend connection.');
      setIsLoggingIn(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the registration for ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete record.');
      }
    } catch (err) {
      alert('Error deleting registration record.');
    }
  };

  // Handle Update Record
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsUpdating(true);
    setEditFormError(null);

    try {
      const res = await fetch(`/api/admin/registrations/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingRecord),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditFormError(data.error || 'Failed to update record.');
        setIsUpdating(false);
        return;
      }

      setIsUpdating(false);
      setEditingRecord(null);
      loadDashboardData();
    } catch (err) {
      setIsUpdating(false);
      setEditFormError('Server error while updating record.');
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/export/excel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Imota_LCDA_Youth_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to export Excel file.');
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/export/csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Imota_LCDA_Youth_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to export CSV file.');
    }
  };

  // Print records table / PDF
  const handlePrintRecords = () => {
    window.print();
  };

  // IF NOT LOGGED IN: Show Secure Login Screen
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-emerald-800 text-white p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full p-1 mx-auto mb-3 shadow-md flex items-center justify-center overflow-hidden">
              <ImotaLogo
                alt="Imota LCDA Seal"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h2 className="text-xl font-bold">Administrative Portal Login</h2>
            <p className="text-xs text-emerald-200 mt-1">
              Imota LCDA Youth Registration Portal Directorate
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border-l-4 border-rose-600 rounded text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>

            <div className="pt-3 border-t border-slate-100 text-center space-y-1">
              <p className="text-xs text-slate-500 font-medium">
                Default credentials for evaluation:
              </p>
              <p className="text-xs font-mono text-emerald-800 mt-0.5">
                youthsportsimotalcda@gmail.com / Admin@Imota2026!
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Portal Support: <a href="tel:+2348028514026" className="hover:text-emerald-700 hover:underline">+234 (0) 8028514026</a>, <a href="tel:+2348020992646" className="hover:text-emerald-700 hover:underline">8020992646</a> • <a href="mailto:youthsportsimotalcda@gmail.com" className="hover:text-emerald-700 hover:underline">youthsportsimotalcda@gmail.com</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN DASHBOARD VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            IL
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Imota LCDA Administrative Oversight
            </h2>
            <p className="text-xs text-slate-500">
              Logged in as: <span className="font-semibold text-emerald-800">{adminUser?.email}</span> ({adminUser?.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('records')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              adminTab === 'records' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Registrations ({registrations.length})
          </button>

          <button
            onClick={() => setAdminTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              adminTab === 'analytics' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Analytics & Wards
          </button>

          <button
            onClick={() => setAdminTab('emails')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              adminTab === 'emails' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Email Outbox ({emailLogs.length})
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STATISTICS CARDS (Prompt Required: Total, Today, This Week, This Month) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Registrations
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.total ?? 0}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Enrolled youths in database</span>
          </div>
        </div>

        {/* Registrations Today */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registrations Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">
              {stats?.today ?? 0}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Recorded since midnight</span>
          </div>
        </div>

        {/* Registrations This Week */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registrations This Week
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.thisWeek ?? 0}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Current weekly cycle</span>
          </div>
        </div>

        {/* Registrations This Month */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registrations This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.thisMonth ?? 0}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Current calendar month</span>
          </div>
        </div>
      </div>

      {/* TAB 1: REGISTRATIONS TABLE & ACTIONS */}
      {adminTab === 'records' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Action Bar & Search / Filter Controls */}
          <div className="p-5 border-b border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Youth Database</h3>
                <p className="text-xs text-slate-500">
                  Search, filter, edit, or export records. All entries are protected by relational UNIQUE constraints.
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Export to formatted Microsoft Excel sheet"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Export to Excel</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Export to standard CSV"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Export to CSV</span>
                </button>

                <button
                  onClick={handlePrintRecords}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Table / PDF</span>
                </button>

                <button
                  onClick={loadDashboardData}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {/* Search by Name, Email, Phone */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Name, Email, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Filter by Date: Start */}
              <div>
                <input
                  type="date"
                  placeholder="From Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Filter by Date: End */}
              <div>
                <input
                  type="date"
                  placeholder="To Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Filter by Ward */}
              <div>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="All">All Wards</option>
                  <option value="Ward A">Ward A</option>
                  <option value="Ward B">Ward B</option>
                  <option value="Ward C">Ward C</option>
                  <option value="Ward D">Ward D</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Registrations */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Ward</th>
                  <th className="py-3 px-4">Occupation / Skill</th>
                  <th className="py-3 px-4">Date Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No youth registrations match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {reg.reg_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {reg.full_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 break-all">
                        {reg.email}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {reg.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          reg.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {reg.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {reg.ward ? reg.ward.split('-')[0].trim() : 'General'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {reg.occupation} {reg.skills ? `• ${reg.skills}` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRecord(reg)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded transition-colors"
                            title="View Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingRecord(reg)}
                            className="p-1.5 hover:bg-blue-50 text-blue-700 rounded transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(reg.id, reg.full_name)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & WARDS */}
      {adminTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ward Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-700" />
              <span>Registrations by Electoral Ward</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.wardCounts).length === 0 ? (
                <p className="text-xs text-slate-400">No ward data recorded yet.</p>
              ) : (
                Object.entries(stats.wardCounts).map(([ward, count]) => {
                  const numericCount = Number(count);
                  const pct = Math.round((numericCount / (stats.total || 1)) * 100);
                  return (
                    <div key={ward} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{ward}</span>
                        <span className="text-slate-900 font-bold">{numericCount} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Registered Skills & Vocations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Top Youth Skills & Trades</span>
            </h3>
            <div className="space-y-3">
              {stats.topSkills.length === 0 ? (
                <p className="text-xs text-slate-400">No skills data logged yet.</p>
              ) : (
                stats.topSkills.map(({ skill, count }) => (
                  <div key={skill} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-xs font-semibold text-slate-800">{skill}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {count} youths
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCHED EMAIL OUTBOX LOGS */}
      {adminTab === 'emails' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden p-6">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-700" />
            <span>Automated Confirmation Email Dispatches</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Audited log of confirmation emails dispatched to newly registered youths.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Slip ID</th>
                  <th className="py-2.5 px-3">Recipient Name</th>
                  <th className="py-2.5 px-3">Recipient Email</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dispatch Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{log.reg_number}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.recipient_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.recipient_email}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.subject}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900">
                Edit Youth Record: {editingRecord.reg_number}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-600 text-rose-800 text-xs rounded">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.full_name}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingRecord.email}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.phone}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editingRecord.occupation}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, occupation: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editingRecord.address}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SLIP MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900">
                Registrant Details: {viewingRecord.reg_number}
              </h3>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-24 h-28 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden shrink-0">
                {viewingRecord.photo_url ? (
                  <img
                    src={viewingRecord.photo_url}
                    alt={viewingRecord.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Users className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="text-base font-bold text-slate-900">{viewingRecord.full_name}</h4>
                <p className="text-emerald-800 font-mono font-bold">{viewingRecord.reg_number}</p>
                <p className="text-slate-600">{viewingRecord.email} • {viewingRecord.phone}</p>
                <p className="text-slate-600">
                  {viewingRecord.gender} • Born {viewingRecord.dob}{' '}
                  <span className="font-semibold text-emerald-800">
                    ({calculateAge(viewingRecord.dob)} years old)
                  </span>
                </p>
                <p className="text-slate-600">Ward: {viewingRecord.ward || 'Imota'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700 mb-4">
              <div><strong>Address:</strong> {viewingRecord.address}</div>
              <div><strong>State of Origin:</strong> {viewingRecord.state_of_origin} State</div>
              <div><strong>Occupation:</strong> {viewingRecord.occupation}</div>
              <div><strong>Education:</strong> {viewingRecord.education || 'N/A'}</div>
              <div><strong>Skills:</strong> {viewingRecord.skills || 'None specified'}</div>
              <div><strong>LASSRA ID:</strong> {viewingRecord.lassra || 'N/A'}</div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
