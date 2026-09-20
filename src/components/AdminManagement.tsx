import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Lock,
  Mail,
  Building,
  User,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Clock,
  Key,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  Slash,
  Eye,
  EyeOff,
  Activity,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { AdminUser, AdminPermissions, AuditLog } from '../types';

interface AdminManagementProps {
  token: string;
  currentUser: AdminUser;
  onSessionInvalidated?: () => void;
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, AdminPermissions> = {
  super_admin: {
    can_view_records: true,
    can_edit_records: true,
    can_delete_records: true,
    can_export_data: true,
    can_view_audit: true,
    can_view_emails: true,
    can_manage_admins: true,
  },
  admin: {
    can_view_records: true,
    can_edit_records: true,
    can_delete_records: false,
    can_export_data: true,
    can_view_audit: true,
    can_view_emails: true,
    can_manage_admins: false,
  },
  data_officer: {
    can_view_records: true,
    can_edit_records: true,
    can_delete_records: false,
    can_export_data: false,
    can_view_audit: false,
    can_view_emails: false,
    can_manage_admins: false,
  },
  auditor: {
    can_view_records: true,
    can_edit_records: false,
    can_delete_records: false,
    can_export_data: false,
    can_view_audit: true,
    can_view_emails: true,
    can_manage_admins: false,
  },
};

export const AdminManagement: React.FC<AdminManagementProps> = ({
  token,
  currentUser,
  onSessionInvalidated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'audit'>('admins');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Admin Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'data_officer' | 'auditor' | 'super_admin'>('admin');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPermissions, setNewPermissions] = useState<AdminPermissions>(
    DEFAULT_ROLE_PERMISSIONS.admin
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Newly Created Admin Hand-off Modal
  const [createdAdminCredentials, setCreatedAdminCredentials] = useState<{
    email: string;
    password: string;
    fullName: string;
    role: string;
    org: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit Admin State
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<AdminPermissions | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Audit Filter
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Fetch all admins
  const fetchAdmins = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        if (data?.code === 'ACCOUNT_SUSPENDED' || data?.code === 'ACCOUNT_REVOKED') {
          onSessionInvalidated?.();
          return;
        }
      }
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load administrator accounts');
      }
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchAuditLogs();
  }, [token]);

  // When role changes in create form, load default role permissions
  const handleRoleChange = (role: 'admin' | 'data_officer' | 'auditor' | 'super_admin') => {
    setNewRole(role);
    setNewPermissions(DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.admin);
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  // Handle Create Admin Submission
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFullName) {
      setActionError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
          organization: newOrg || 'External Authorized Partner',
          role: newRole,
          permissions: newPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create administrator account.');
      }

      setCreatedAdminCredentials({
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
        role: newRole,
        org: newOrg || 'External Authorized Partner',
      });

      // Reset form
      setNewEmail('');
      setNewFullName('');
      setNewOrg('');
      setNewPassword('');
      setIsCreateModalOpen(false);

      fetchAdmins();
      fetchAuditLogs();
      setActionSuccess(`Authorized administrator account for ${data.admin?.full_name} created successfully.`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Update (Activate, Suspend, Revoke)
  const handleUpdateStatus = async (adminId: number, targetStatus: 'active' | 'suspended' | 'revoked', targetName: string) => {
    const actionVerb = targetStatus === 'active' ? 'reactivate' : targetStatus;
    const confirmMessage = `Are you sure you want to ${actionVerb} access for ${targetName}? ${
      targetStatus !== 'active'
        ? 'This will immediately terminate any active sessions and prevent further access.'
        : 'This will restore their administrator privileges.'
    }`;

    if (!window.confirm(confirmMessage)) return;

    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to update status to ${targetStatus}`);
      }

      setActionSuccess(`Administrator access ${targetStatus === 'active' ? 'reactivated' : targetStatus}. Active sessions immediately revoked.`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchAdmins();
      fetchAuditLogs();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Handle Save Edit Permissions / Password
  const handleSaveAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsSavingEdit(true);
    setActionError(null);

    try {
      const payload: any = {
        full_name: editingAdmin.full_name,
        organization: editingAdmin.organization,
        role: editingAdmin.role,
        permissions: editPermissions,
      };

      if (editPassword && editPassword.trim().length >= 6) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/admin/users/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update administrator.');
      }

      setActionSuccess(`Administrator settings updated successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setEditingAdmin(null);
      setEditPermissions(null);
      setEditPassword('');
      fetchAdmins();
      fetchAuditLogs();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async (adminId: number, targetName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the administrator account for ${targetName}? This action cannot be undone.`)) {
      return;
    }

    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete administrator account.');
      }

      setActionSuccess(`Administrator account deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchAdmins();
      fetchAuditLogs();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Copy credentials helper
  const handleCopyCredentials = () => {
    if (!createdAdminCredentials) return;
    const text = `IMOTA LCDA YOUTH REGISTRATION PORTAL - AUTHORIZED ADMINISTRATOR CREDENTIALS\n\nFull Name: ${createdAdminCredentials.fullName}\nOrganization: ${createdAdminCredentials.org}\nRole: ${createdAdminCredentials.role.toUpperCase()}\nPortal URL: ${window.location.origin}\nLogin Email: ${createdAdminCredentials.email}\nPassword: ${createdAdminCredentials.password}\n\nPlease keep these credentials secure. All activities are recorded in the security audit trail.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesFilter =
      auditFilter === 'ALL' ||
      (auditFilter === 'LOGIN' && log.action.includes('LOGIN')) ||
      (auditFilter === 'ADMIN' && log.action.includes('ADMIN')) ||
      (auditFilter === 'EXPORT' && log.action.includes('EXPORT')) ||
      (auditFilter === 'REG' && log.action.includes('REGISTRATION'));

    const searchLower = auditSearch.toLowerCase();
    const matchesSearch =
      !auditSearch ||
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.details && log.details.toLowerCase().includes(searchLower)) ||
      (log.admin_email && log.admin_email.toLowerCase().includes(searchLower)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Authorized Third-Party Administrators & RBAC Governance
              </h2>
              <p className="text-xs text-slate-500">
                Grant, restrict, suspend, or revoke separate administrator credentials for external partners, auditors, and state ministries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('admins')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'admins'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Administrators ({admins.length})
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'audit'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={() => {
              fetchAdmins();
              fetchAuditLogs();
            }}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => {
                setNewRole('admin');
                setNewPermissions(DEFAULT_ROLE_PERMISSIONS.admin);
                setIsCreateModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Authorized Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-medium">{actionError}</div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{actionSuccess}</div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: ADMINISTRATORS DIRECTORY */}
      {activeSubTab === 'admins' && (
        <div className="space-y-4">
          {/* Security Notice Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Zero-Shared Credential Architecture & Instant Session Invalidation:</span>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Authorized third parties (such as state representatives, field coordinators, and independent auditors) receive their own distinct login identities. The primary Super Admin password is never shared. Whenever an account is suspended, reactivated, or permissions are modified, the server instantly invalidates all active session tokens.
              </p>
            </div>
          </div>

          {/* Table of Administrators */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Administrator / Entity</th>
                    <th className="py-3 px-4">Organization / Ministry</th>
                    <th className="py-3 px-4">Role & Status</th>
                    <th className="py-3 px-4">Active Permissions</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        {isLoading ? 'Loading administrators...' : 'No administrators found.'}
                      </td>
                    </tr>
                  ) : (
                    admins.map((adm) => {
                      const isSuperAdmin = adm.role === 'super_admin' && adm.email === 'youthsportsimotalcda@gmail.com';
                      const isSelf = adm.id === currentUser.id;
                      const permissions: AdminPermissions = adm.permissions || DEFAULT_ROLE_PERMISSIONS.admin;

                      return (
                        <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                adm.role === 'super_admin'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : adm.role === 'auditor'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                {adm.full_name ? adm.full_name.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{adm.full_name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                      (You)
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 font-mono text-[11px]">{adm.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Organization */}
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium">{adm.organization || 'Imota LCDA'}</span>
                            <div className="text-[10px] text-slate-400">
                              Created by: {adm.created_by || 'system'}
                            </div>
                          </td>

                          {/* Role & Status Badge */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                adm.role === 'super_admin'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : adm.role === 'auditor'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : adm.role === 'data_officer'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {adm.role.replace('_', ' ')}
                              </span>

                              {/* Status Badge */}
                              <div>
                                {adm.status === 'active' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </span>
                                )}
                                {adm.status === 'suspended' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    Suspended
                                  </span>
                                )}
                                {adm.status === 'revoked' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    <Slash className="w-3 h-3 text-rose-600" />
                                    Revoked
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Permissions summary chips */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {permissions.can_view_records && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]" title="View Registrations">
                                  View
                                </span>
                              )}
                              {permissions.can_edit_records && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]" title="Edit Registrations">
                                  Edit
                                </span>
                              )}
                              {permissions.can_delete_records && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px]" title="Delete Registrations">
                                  Delete
                                </span>
                              )}
                              {permissions.can_export_data && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px]" title="Export to Excel & CSV">
                                  Export
                                </span>
                              )}
                              {permissions.can_view_audit && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px]" title="View Security Audit">
                                  Audit
                                </span>
                              )}
                              {permissions.can_manage_admins && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px]" title="Manage Admins">
                                  Manage Admins
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {adm.last_login ? new Date(adm.last_login).toLocaleString() : 'Never logged in'}
                          </td>

                          {/* Action Controls */}
                          <td className="py-3.5 px-4 text-right">
                            {isSuperAdmin ? (
                              <span className="text-[11px] text-slate-400 italic">Primary Super Admin</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Status toggles */}
                                {adm.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(adm.id, 'suspended', adm.full_name)}
                                      disabled={isSelf}
                                      className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                      title="Suspend access immediately"
                                    >
                                      Suspend
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(adm.id, 'revoked', adm.full_name)}
                                      disabled={isSelf}
                                      className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                      title="Revoke access permanently"
                                    >
                                      Revoke
                                    </button>
                                  </>
                                )}

                                {adm.status === 'suspended' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(adm.id, 'active', adm.full_name)}
                                      className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                                      title="Reactivate administrator account"
                                    >
                                      Reactivate
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(adm.id, 'revoked', adm.full_name)}
                                      className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                                      title="Revoke access permanently"
                                    >
                                      Revoke
                                    </button>
                                  </>
                                )}

                                {adm.status === 'revoked' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(adm.id, 'active', adm.full_name)}
                                      className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                                      title="Reactivate administrator account"
                                    >
                                      Reactivate
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAdmin(adm.id, adm.full_name)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                      title="Delete permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {/* Edit permissions button */}
                                <button
                                  onClick={() => {
                                    setEditingAdmin(adm);
                                    setEditPermissions(adm.permissions || DEFAULT_ROLE_PERMISSIONS.admin);
                                    setEditPassword('');
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                  title="Edit permissions & settings"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600">Filter Event:</span>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Logins & Auth</option>
                <option value="ADMIN">Admin Account Changes</option>
                <option value="EXPORT">Data Exports (Excel/CSV)</option>
                <option value="REG">Registration Edits & Deletions</option>
              </select>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search audit trail by actor, IP, details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor (Administrator)</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No audit events match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const isAuth = log.action.includes('LOGIN');
                      const isDanger = log.action.includes('DELETE') || log.action.includes('SUSPEND') || log.action.includes('REVOKE') || log.action.includes('BLOCKED');
                      const isExport = log.action.includes('EXPORT');

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">
                              {log.admin_email || 'Super Admin / System'}
                            </div>
                            {log.admin_id && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Admin ID: #{log.admin_id}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isDanger
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isExport
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : isAuth
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-md">
                            {log.details}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {log.ip_address || 'unknown'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE AUTHORIZED ADMIN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Provision Authorized Administrator Account
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Representative Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Tayo Olubunmi"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Organization / Ministry */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Authorized Agency / Organization / Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos State Ministry of Wealth Creation & Employment"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Email Address (Unique Identity) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. partner.auditor@lagosstate.gov.ng"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
                <span className="text-[11px] text-slate-500">
                  This unique email will be used to track all actions and audit events to this individual.
                </span>
              </div>

              {/* Role Preset */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Administrative Role <span className="text-rose-600">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="admin">Operational Administrator (Full access without delete/manage admins)</option>
                  <option value="data_officer">Data Verification Officer (View & Edit records only)</option>
                  <option value="auditor">Compliance / External Auditor (Read-only view + Audit logs)</option>
                  <option value="super_admin">Super Administrator (Full Master Control)</option>
                </select>
              </div>

              {/* Password Creation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Administrator Initial Password <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 border rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Granular Permission Boundaries (RBAC)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_view_records}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_view_records: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>View Youth Records</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_edit_records}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_edit_records: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Edit Registrations</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_delete_records}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_delete_records: e.target.checked })
                      }
                      className="rounded text-rose-600"
                    />
                    <span className="text-rose-700">Delete Records (Sensitive)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_export_data}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_export_data: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Export Excel & CSV</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_view_audit}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_view_audit: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Inspect Audit Trail</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.can_view_emails}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, can_view_emails: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>View Email Outbox</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREDENTIAL HAND-OFF CONFIRMATION */}
      {createdAdminCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-800 mb-3">
              <span className="p-2 rounded-full bg-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Authorized Administrator Created
                </h3>
                <p className="text-xs text-slate-500">
                  Provide these distinct login credentials to the authorized third party.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 font-mono my-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Full Name:</span>
                <span className="font-bold text-slate-900">{createdAdminCredentials.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Organization:</span>
                <span className="text-slate-800">{createdAdminCredentials.org}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Role:</span>
                <span className="text-emerald-800 font-bold uppercase">{createdAdminCredentials.role}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Login Email:</span>
                <span className="font-bold text-slate-900 select-all">{createdAdminCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Initial Password:</span>
                <span className="font-bold text-emerald-700 text-sm select-all">{createdAdminCredentials.password}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-900 mb-4">
              The primary Super Admin password (Imotalcdayouth123) has <strong>not</strong> been shared. The third party has their own independent login identity and their activities will be logged separately.
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 text-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedAdminCredentials(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PERMISSIONS / RESET PASSWORD */}
      {editingAdmin && editPermissions && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-800">
                  <Edit2 className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Update Administrator: {editingAdmin.full_name}
                </h3>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.full_name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={editingAdmin.organization || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, organization: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={editingAdmin.role}
                  onChange={(e) => {
                    const newRoleVal = e.target.value;
                    setEditingAdmin({ ...editingAdmin, role: newRoleVal });
                    if (DEFAULT_ROLE_PERMISSIONS[newRoleVal]) {
                      setEditPermissions(DEFAULT_ROLE_PERMISSIONS[newRoleVal]);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="admin">Operational Administrator</option>
                  <option value="data_officer">Data Verification Officer</option>
                  <option value="auditor">Compliance / External Auditor</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reset Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password if resetting"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Granular Permissions (RBAC)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_view_records}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_view_records: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>View Youth Records</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_edit_records}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_edit_records: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Edit Registrations</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_delete_records}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_delete_records: e.target.checked })
                      }
                      className="rounded text-rose-600"
                    />
                    <span className="text-rose-700">Delete Records (Sensitive)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_export_data}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_export_data: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Export Excel & CSV</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_view_audit}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_view_audit: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Inspect Audit Trail</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.can_view_emails}
                      onChange={(e) =>
                        setEditPermissions({ ...editPermissions, can_view_emails: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>View Email Outbox</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
