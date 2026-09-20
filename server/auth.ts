import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAdminById, AdminPermissions } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'imota_youth_portal_jwt_secret_key_2026_super_secure';

export interface AdminPayload {
  id: number;
  email: string;
  full_name: string;
  role: string;
  token_version?: number;
}

export interface AuthRequest extends Request {
  adminUser?: {
    id: number;
    email: string;
    full_name: string;
    organization: string;
    role: string;
    status: 'active' | 'suspended' | 'revoked';
    token_version: number;
    permissions: AdminPermissions;
    created_by?: string;
    created_at?: string;
    last_login?: string | null;
  };
}

export function generateToken(payload: { id: number; email: string; full_name: string; role: string; token_version?: number }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;

    // Live database lookup to guarantee instantaneous revocation/suspension enforcement
    const admin = getAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        error: 'Administrator account no longer exists in the system.',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    // Check account status
    if (admin.status === 'suspended') {
      return res.status(403).json({
        error: 'Account Suspended: Your administrator access has been temporarily suspended by the Super Administrator.',
        status: 'suspended',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    if (admin.status === 'revoked') {
      return res.status(403).json({
        error: 'Account Revoked: Your administrator account access has been permanently revoked.',
        status: 'revoked',
        code: 'ACCOUNT_REVOKED',
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        error: `Account Inactive: Your administrator account is currently ${admin.status}.`,
        status: admin.status,
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Check token version to invalidate active sessions when credentials or permissions are updated
    if (decoded.token_version !== undefined && decoded.token_version !== admin.token_version) {
      return res.status(401).json({
        error: 'Session invalidated: Administrator credentials or access status were changed. Please log in again.',
        code: 'SESSION_INVALIDATED',
      });
    }

    req.adminUser = admin as any;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.', code: 'INVALID_TOKEN' });
  }
}

// Granular RBAC permission enforcement middleware
export function requirePermission(permissionKey: keyof AdminPermissions) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const admin = req.adminUser;
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Super Admin has master access to all operations
    if (admin.role === 'super_admin') {
      return next();
    }

    // Check specific permission flag
    if (admin.permissions && admin.permissions[permissionKey] === true) {
      return next();
    }

    return res.status(403).json({
      error: `Access Denied: Your assigned role (${admin.role}) does not have permission to perform this action (${permissionKey}).`,
      requiredPermission: permissionKey,
      code: 'PERMISSION_DENIED',
    });
  };
}
