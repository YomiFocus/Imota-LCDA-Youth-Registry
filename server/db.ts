import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { normalizeFullName, normalizeEmail, normalizePhoneNumber } from './validation';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'imota_youth.sqlite');

export interface RegistrationRecord {
  id?: number;
  reg_number: string;
  full_name: string;
  full_name_clean: string;
  email: string;
  email_clean: string;
  phone: string;
  phone_clean: string;
  gender: string;
  ward: string;
  lassra: string;
  dob: string;
  address: string;
  state_of_origin: string;
  occupation: string;
  education: string;
  photo_url: string;
  skills: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  genderCounts: Record<string, number>;
  wardCounts: Record<string, number>;
  topSkills: { skill: string; count: number }[];
}

export interface AdminPermissions {
  can_view_records: boolean;
  can_edit_records: boolean;
  can_delete_records: boolean;
  can_export_data: boolean;
  can_view_audit: boolean;
  can_view_emails: boolean;
  can_manage_admins: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, AdminPermissions> = {
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
    can_view_audit: false,
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

export function parseAdminPermissions(role: string, permissionsJson?: string): AdminPermissions {
  const fallback = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.admin;
  if (!permissionsJson) return { ...fallback };
  try {
    const parsed = JSON.parse(permissionsJson);
    return {
      can_view_records: typeof parsed.can_view_records === 'boolean' ? parsed.can_view_records : fallback.can_view_records,
      can_edit_records: typeof parsed.can_edit_records === 'boolean' ? parsed.can_edit_records : fallback.can_edit_records,
      can_delete_records: typeof parsed.can_delete_records === 'boolean' ? parsed.can_delete_records : fallback.can_delete_records,
      can_export_data: typeof parsed.can_export_data === 'boolean' ? parsed.can_export_data : fallback.can_export_data,
      can_view_audit: typeof parsed.can_view_audit === 'boolean' ? parsed.can_view_audit : fallback.can_view_audit,
      can_view_emails: typeof parsed.can_view_emails === 'boolean' ? parsed.can_view_emails : fallback.can_view_emails,
      can_manage_admins: typeof parsed.can_manage_admins === 'boolean' ? parsed.can_manage_admins : fallback.can_manage_admins,
    };
  } catch (e) {
    return { ...fallback };
  }
}

// Persist the database to disk
function persistDatabase() {
  if (!db) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

// Initialize database schema and seeds
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from disk.');
    } catch (e) {
      console.warn('Could not read existing DB file, creating a fresh one.', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Create tables with relational constraints
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_number TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      full_name_clean TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      email_clean TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      phone_clean TEXT NOT NULL UNIQUE,
      gender TEXT NOT NULL,
      ward TEXT,
      lassra TEXT,
      dob TEXT NOT NULL,
      address TEXT NOT NULL,
      state_of_origin TEXT NOT NULL,
      occupation TEXT NOT NULL,
      education TEXT,
      photo_url TEXT,
      skills TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      organization TEXT DEFAULT 'Imota Local Council',
      role TEXT NOT NULL DEFAULT 'admin',
      permissions TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      token_version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT DEFAULT 'system',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS email_dispatches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_id INTEGER,
      reg_number TEXT,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SENT',
      sent_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      admin_id INTEGER,
      admin_email TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Schema migrations for existing databases to guarantee zero disruption to existing data
  const migrations = [
    "ALTER TABLE admin_users ADD COLUMN organization TEXT DEFAULT 'Imota Local Council';",
    "ALTER TABLE admin_users ADD COLUMN permissions TEXT;",
    "ALTER TABLE admin_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';",
    "ALTER TABLE admin_users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1;",
    "ALTER TABLE admin_users ADD COLUMN created_by TEXT DEFAULT 'system';",
    "ALTER TABLE admin_users ADD COLUMN updated_at TEXT;",
    "ALTER TABLE admin_users ADD COLUMN last_login TEXT;",
    "ALTER TABLE audit_logs ADD COLUMN admin_id INTEGER;",
    "ALTER TABLE audit_logs ADD COLUMN admin_email TEXT;",
  ];
  for (const sql of migrations) {
    try {
      db.run(sql);
    } catch (e) {
      // Column may already exist
    }
  }

  // Create indexes for high-speed queries and duplicate checks
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_registrations_name_clean ON registrations(full_name_clean);
    CREATE INDEX IF NOT EXISTS idx_registrations_email_clean ON registrations(email_clean);
    CREATE INDEX IF NOT EXISTS idx_registrations_phone_clean ON registrations(phone_clean);
    CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
  `);

  // Seed default admin accounts
  const defaultPassword = process.env.ADMIN_PASSWORD || 'Imotalcdayouth123';
  const hash = bcrypt.hashSync(defaultPassword, 10);
  const targetAdminEmails = [
    'youthsportsimotalcda@gmail.com',
    process.env.ADMIN_EMAIL || 'admin@imota.gov.ng',
  ];

  const superAdminPermissionsJson = JSON.stringify(DEFAULT_ROLE_PERMISSIONS.super_admin);

  for (const adminEmail of targetAdminEmails) {
    const existing = db.exec(`SELECT COUNT(*) as count FROM admin_users WHERE email = '${adminEmail.toLowerCase()}';`);
    const count = existing[0]?.values[0]?.[0] as number;
    const now = new Date().toISOString();
    if (count === 0) {
      const stmt = db.prepare(
        "INSERT INTO admin_users (email, password_hash, full_name, organization, role, permissions, status, token_version, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', 1, 'system', ?, ?)"
      );
      stmt.run([adminEmail.toLowerCase(), hash, 'Imota LCDA Youth & Sports Admin', 'Imota Local Council', 'super_admin', superAdminPermissionsJson, now, now]);
      stmt.free();
      console.log(`Admin user seeded: ${adminEmail}`);
    } else {
      const stmt = db.prepare(
        "UPDATE admin_users SET password_hash = ?, role = 'super_admin', permissions = ?, status = 'active', token_version = token_version + 1 WHERE email = ?"
      );
      stmt.run([hash, superAdminPermissionsJson, adminEmail.toLowerCase()]);
      stmt.free();
      console.log(`Admin user synchronized: ${adminEmail}`);
    }
  }
  persistDatabase();

  // Seed initial registrations if table is empty (includes Adebogun Oriyomi from prompt specification)
  const regCheck = db.exec("SELECT COUNT(*) as count FROM registrations;");
  const regCount = regCheck[0]?.values[0]?.[0] as number;
  if (regCount === 0) {
    const now = new Date();
    const seeds = [
      {
        reg_number: 'IMT/2026/YTH-00101',
        full_name: 'Adebogun Oriyomi',
        email: 'adebogunoriyomi@gmail.com',
        phone: '08031234567',
        gender: 'Male',
        ward: 'Ward B',
        lassra: 'LA-2024-884910',
        dob: '1998-04-14',
        address: '14 Palace Road, Imota, Ikorodu Division, Lagos State',
        state_of_origin: 'Lagos',
        occupation: 'Software Engineer & Digital Strategist',
        education: "Bachelor's Degree",
        photo_url: '',
        skills: 'Software & IT, Web Development, UI/UX Design',
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        reg_number: 'IMT/2026/YTH-00102',
        full_name: 'Folashade Balogun',
        email: 'folashade.balogun@yahoo.com',
        phone: '08023456789',
        gender: 'Female',
        ward: 'Ward A',
        lassra: 'LA-2023-712390',
        dob: '2001-09-22',
        address: '5 Obun-Ale Street, Imota LCDA, Lagos',
        state_of_origin: 'Lagos',
        occupation: 'Fashion Designer & Textile Specialist',
        education: 'Higher National Diploma (HND)',
        photo_url: '',
        skills: 'Fashion Design, Garment Construction, Beadwork',
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        reg_number: 'IMT/2026/YTH-00103',
        full_name: 'Olatunji Kazeem',
        email: 'kazeem.olatunji@outlook.com',
        phone: '08145678901',
        gender: 'Male',
        ward: 'Ward C',
        lassra: 'LA-2025-104928',
        dob: '1999-11-05',
        address: '8 Agric Road, Odo-Ayandelu Axis, Imota, Lagos',
        state_of_origin: 'Lagos',
        occupation: 'Agri-Tech & Poultry Specialist',
        education: "Bachelor's Degree",
        photo_url: '',
        skills: 'Agriculture & Farming, Solar Energy Installation',
        created_at: now.toISOString(),
      },
    ];

    for (const seed of seeds) {
      const insertStmt = db.prepare(`
        INSERT INTO registrations (
          reg_number, full_name, full_name_clean, email, email_clean,
          phone, phone_clean, gender, ward, lassra, dob, address,
          state_of_origin, occupation, education, photo_url, skills,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run([
        seed.reg_number,
        seed.full_name,
        normalizeFullName(seed.full_name),
        seed.email,
        normalizeEmail(seed.email),
        seed.phone,
        normalizePhoneNumber(seed.phone).normalized,
        seed.gender,
        seed.ward,
        seed.lassra,
        seed.dob,
        seed.address,
        seed.state_of_origin,
        seed.occupation,
        seed.education,
        seed.photo_url,
        seed.skills,
        seed.created_at,
        seed.created_at,
      ]);
      insertStmt.free();
    }
    console.log('Seeded initial registrations.');
  }

  persistDatabase();
  return db;
}

/**
 * RULE 1, 2, 3 Duplicate Checker:
 * The duplicate checks must occur before saving the record into the database.
 * No duplicate record should ever be inserted.
 */
export function checkDuplicates(
  fullName: string,
  email: string,
  phone: string,
  excludeId?: number
): { isDuplicate: boolean; rule: number | null; message: string | null } {
  if (!db) throw new Error('Database not initialized');

  const cleanName = normalizeFullName(fullName);
  const cleanEmail = normalizeEmail(email);
  const phoneResult = normalizePhoneNumber(phone);
  const cleanPhone = phoneResult.normalized;

  // RULE 1: Full Name uniqueness
  // "A Full Name can only appear once. Error Message: This name has already been used for registration."
  let nameQuery = "SELECT id, full_name FROM registrations WHERE full_name_clean = ?";
  let nameParams: (string | number)[] = [cleanName];
  if (excludeId) {
    nameQuery += " AND id != ?";
    nameParams.push(excludeId);
  }
  const nameStmt = db.prepare(nameQuery);
  nameStmt.bind(nameParams);
  if (nameStmt.step()) {
    nameStmt.free();
    return {
      isDuplicate: true,
      rule: 1,
      message: 'This name has already been used for registration.',
    };
  }
  nameStmt.free();

  // RULE 2: Email Address uniqueness
  // "An Email Address must be unique. Error Message: This email address already exists."
  let emailQuery = "SELECT id, email FROM registrations WHERE email_clean = ?";
  let emailParams: (string | number)[] = [cleanEmail];
  if (excludeId) {
    emailQuery += " AND id != ?";
    emailParams.push(excludeId);
  }
  const emailStmt = db.prepare(emailQuery);
  emailStmt.bind(emailParams);
  if (emailStmt.step()) {
    emailStmt.free();
    return {
      isDuplicate: true,
      rule: 2,
      message: 'This email address already exists.',
    };
  }
  emailStmt.free();

  // RULE 3: Phone Number uniqueness
  // "A Phone Number must be unique. Error Message: This phone number has already been used."
  let phoneQuery = "SELECT id, phone FROM registrations WHERE phone_clean = ?";
  let phoneParams: (string | number)[] = [cleanPhone];
  if (excludeId) {
    phoneQuery += " AND id != ?";
    phoneParams.push(excludeId);
  }
  const phoneStmt = db.prepare(phoneQuery);
  phoneStmt.bind(phoneParams);
  if (phoneStmt.step()) {
    phoneStmt.free();
    return {
      isDuplicate: true,
      rule: 3,
      message: 'This phone number has already been used.',
    };
  }
  phoneStmt.free();

  return { isDuplicate: false, rule: null, message: null };
}

// Single field pre-flight validator for live input validation
export function validateSingleField(
  field: 'name' | 'email' | 'phone',
  value: string,
  excludeId?: number
): { available: boolean; message: string | null } {
  if (!db) throw new Error('Database not initialized');
  if (!value || !value.trim()) {
    return { available: true, message: null };
  }

  if (field === 'name') {
    const clean = normalizeFullName(value);
    if (!clean) return { available: true, message: null };
    let q = "SELECT id FROM registrations WHERE full_name_clean = ?";
    let p: (string | number)[] = [clean];
    if (excludeId) {
      q += " AND id != ?";
      p.push(excludeId);
    }
    const stmt = db.prepare(q);
    stmt.bind(p);
    const exists = stmt.step();
    stmt.free();
    return {
      available: !exists,
      message: exists ? 'This name has already been used for registration.' : null,
    };
  }

  if (field === 'email') {
    const clean = normalizeEmail(value);
    if (!clean) return { available: true, message: null };
    let q = "SELECT id FROM registrations WHERE email_clean = ?";
    let p: (string | number)[] = [clean];
    if (excludeId) {
      q += " AND id != ?";
      p.push(excludeId);
    }
    const stmt = db.prepare(q);
    stmt.bind(p);
    const exists = stmt.step();
    stmt.free();
    return {
      available: !exists,
      message: exists ? 'This email address already exists.' : null,
    };
  }

  if (field === 'phone') {
    const { normalized } = normalizePhoneNumber(value);
    if (!normalized) return { available: true, message: null };
    let q = "SELECT id FROM registrations WHERE phone_clean = ?";
    let p: (string | number)[] = [normalized];
    if (excludeId) {
      q += " AND id != ?";
      p.push(excludeId);
    }
    const stmt = db.prepare(q);
    stmt.bind(p);
    const exists = stmt.step();
    stmt.free();
    return {
      available: !exists,
      message: exists ? 'This phone number has already been used.' : null,
    };
  }

  return { available: true, message: null };
}

// Generate unique sequential registration number
export function generateRegNumber(): string {
  if (!db) throw new Error('Database not initialized');
  const res = db.exec("SELECT MAX(id) as max_id FROM registrations;");
  const currentMax = (res[0]?.values[0]?.[0] as number) || 100;
  const nextNumber = currentMax + 1;
  const currentYear = new Date().getFullYear();
  return `IMT/${currentYear}/YTH-${String(nextNumber).padStart(5, '0')}`;
}

// Insert new registration
export function insertRegistration(data: Omit<RegistrationRecord, 'id' | 'created_at' | 'updated_at' | 'reg_number' | 'full_name_clean' | 'email_clean' | 'phone_clean'> & { reg_number?: string }): RegistrationRecord {
  if (!db) throw new Error('Database not initialized');

  // STEP 1: Duplicate checks MUST occur before saving
  const dupCheck = checkDuplicates(data.full_name, data.email, data.phone);
  if (dupCheck.isDuplicate) {
    const err: any = new Error(dupCheck.message || 'Duplicate registration rejected.');
    err.status = 409;
    err.rule = dupCheck.rule;
    throw err;
  }

  const reg_number = data.reg_number || generateRegNumber();
  const now = new Date().toISOString();
  const cleanName = normalizeFullName(data.full_name);
  const cleanEmail = normalizeEmail(data.email);
  const cleanPhone = normalizePhoneNumber(data.phone).normalized;

  const stmt = db.prepare(`
    INSERT INTO registrations (
      reg_number, full_name, full_name_clean, email, email_clean,
      phone, phone_clean, gender, ward, lassra, dob, address,
      state_of_origin, occupation, education, photo_url, skills,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    reg_number,
    data.full_name.trim(),
    cleanName,
    data.email.trim(),
    cleanEmail,
    data.phone.trim(),
    cleanPhone,
    data.gender,
    data.ward || '',
    data.lassra || '',
    data.dob,
    data.address.trim(),
    data.state_of_origin.trim(),
    data.occupation.trim(),
    data.education || '',
    data.photo_url || '',
    data.skills || '',
    now,
    now,
  ]);
  stmt.free();

  const lastIdRes = db.exec("SELECT last_insert_rowid() as id;");
  const insertedId = lastIdRes[0]?.values[0]?.[0] as number;

  persistDatabase();

  const record = getRegistrationById(insertedId);
  if (!record) {
    throw new Error('Registration failed to persist.');
  }

  // Create simulated confirmation email record
  logEmailDispatch(
    insertedId,
    record.reg_number,
    record.email,
    record.full_name,
    `Imota LCDA Youth Registration Confirmation - ${record.reg_number}`,
    `Dear ${record.full_name},\n\n` +
    `Congratulations! Your youth data registration has been received and verified successfully.\n\n` +
    `Registration Number: ${record.reg_number}\n` +
    `Ward: ${record.ward || 'Imota LCDA'}\n` +
    `Date Registered: ${new Date(record.created_at).toLocaleDateString()}\n\n` +
    `Please retain this registration number for all upcoming Imota LCDA Youth Empowerment, skill acquisition programs, and bursary distributions.\n\n` +
    `Imota Local Council Development Area (LCDA)\n` +
    `Ikorodu Division, Lagos State, Nigeria`
  );

  return record;
}

// Get registration by ID
export function getRegistrationById(id: number): RegistrationRecord | null {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare("SELECT * FROM registrations WHERE id = ?");
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as unknown as RegistrationRecord;
  stmt.free();
  return row;
}

// Update registration (with duplicate protection)
export function updateRegistration(id: number, data: Partial<RegistrationRecord>): RegistrationRecord {
  if (!db) throw new Error('Database not initialized');
  const existing = getRegistrationById(id);
  if (!existing) {
    const err: any = new Error('Registration record not found');
    err.status = 404;
    throw err;
  }

  const updatedName = data.full_name !== undefined ? data.full_name : existing.full_name;
  const updatedEmail = data.email !== undefined ? data.email : existing.email;
  const updatedPhone = data.phone !== undefined ? data.phone : existing.phone;

  // Duplicate checks against other records
  const dupCheck = checkDuplicates(updatedName, updatedEmail, updatedPhone, id);
  if (dupCheck.isDuplicate) {
    const err: any = new Error(dupCheck.message || 'Duplicate registration rejected.');
    err.status = 409;
    err.rule = dupCheck.rule;
    throw err;
  }

  const now = new Date().toISOString();
  const cleanName = normalizeFullName(updatedName);
  const cleanEmail = normalizeEmail(updatedEmail);
  const cleanPhone = normalizePhoneNumber(updatedPhone).normalized;

  const stmt = db.prepare(`
    UPDATE registrations SET
      full_name = ?,
      full_name_clean = ?,
      email = ?,
      email_clean = ?,
      phone = ?,
      phone_clean = ?,
      gender = ?,
      ward = ?,
      lassra = ?,
      dob = ?,
      address = ?,
      state_of_origin = ?,
      occupation = ?,
      education = ?,
      photo_url = ?,
      skills = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run([
    updatedName.trim(),
    cleanName,
    updatedEmail.trim(),
    cleanEmail,
    updatedPhone.trim(),
    cleanPhone,
    data.gender !== undefined ? data.gender : existing.gender,
    data.ward !== undefined ? data.ward : existing.ward,
    data.lassra !== undefined ? data.lassra : existing.lassra,
    data.dob !== undefined ? data.dob : existing.dob,
    data.address !== undefined ? data.address.trim() : existing.address,
    data.state_of_origin !== undefined ? data.state_of_origin.trim() : existing.state_of_origin,
    data.occupation !== undefined ? data.occupation.trim() : existing.occupation,
    data.education !== undefined ? data.education : existing.education,
    data.photo_url !== undefined ? data.photo_url : existing.photo_url,
    data.skills !== undefined ? data.skills : existing.skills,
    now,
    id,
  ]);
  stmt.free();

  persistDatabase();
  return getRegistrationById(id)!;
}

// Delete registration
export function deleteRegistration(id: number): boolean {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare("DELETE FROM registrations WHERE id = ?");
  stmt.run([id]);
  stmt.free();
  persistDatabase();
  return true;
}

// Get all registrations with optional query filters
export function getAllRegistrations(options: {
  search?: string;
  startDate?: string;
  endDate?: string;
  ward?: string;
  gender?: string;
}): RegistrationRecord[] {
  if (!db) throw new Error('Database not initialized');

  let query = "SELECT * FROM registrations WHERE 1=1";
  const params: (string | number)[] = [];

  if (options.search && options.search.trim()) {
    const s = `%${options.search.trim().toLowerCase()}%`;
    query += " AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(reg_number) LIKE ?)";
    params.push(s, s, s, s);
  }

  if (options.startDate) {
    query += " AND created_at >= ?";
    params.push(`${options.startDate}T00:00:00.000Z`);
  }

  if (options.endDate) {
    query += " AND created_at <= ?";
    params.push(`${options.endDate}T23:59:59.999Z`);
  }

  if (options.ward && options.ward !== 'All') {
    query += " AND (ward = ? OR ward LIKE ?)";
    params.push(options.ward, `${options.ward}%`);
  }

  if (options.gender && options.gender !== 'All') {
    query += " AND gender = ?";
    params.push(options.gender);
  }

  query += " ORDER BY id DESC";

  const stmt = db.prepare(query);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: RegistrationRecord[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as RegistrationRecord);
  }
  stmt.free();

  return results;
}

// Get Dashboard Statistics
export function getStats(): RegistrationStats {
  if (!db) throw new Error('Database not initialized');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of week (Sunday or Monday)
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekIso = startOfWeek.toISOString();

  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Total
  const totalRes = db.exec("SELECT COUNT(*) as count FROM registrations;");
  const total = (totalRes[0]?.values[0]?.[0] as number) || 0;

  // Today
  const todayRes = db.exec(`SELECT COUNT(*) as count FROM registrations WHERE created_at >= '${todayStr}T00:00:00.000Z';`);
  const today = (todayRes[0]?.values[0]?.[0] as number) || 0;

  // This Week
  const weekRes = db.exec(`SELECT COUNT(*) as count FROM registrations WHERE created_at >= '${weekIso}';`);
  const thisWeek = (weekRes[0]?.values[0]?.[0] as number) || 0;

  // This Month
  const monthRes = db.exec(`SELECT COUNT(*) as count FROM registrations WHERE created_at >= '${startOfMonth}';`);
  const thisMonth = (monthRes[0]?.values[0]?.[0] as number) || 0;

  // Gender counts
  const genderRes = db.exec("SELECT gender, COUNT(*) as count FROM registrations GROUP BY gender;");
  const genderCounts: Record<string, number> = {};
  if (genderRes[0]) {
    for (const row of genderRes[0].values) {
      genderCounts[row[0] as string] = row[1] as number;
    }
  }

  // Ward counts
  const wardRes = db.exec("SELECT ward, COUNT(*) as count FROM registrations WHERE ward != '' GROUP BY ward;");
  const wardCounts: Record<string, number> = {};
  if (wardRes[0]) {
    for (const row of wardRes[0].values) {
      wardCounts[row[0] as string] = row[1] as number;
    }
  }

  // Top skills extraction
  const skillRes = db.exec("SELECT skills FROM registrations WHERE skills != '';");
  const skillMap: Record<string, number> = {};
  if (skillRes[0]) {
    for (const row of skillRes[0].values) {
      const skillsStr = (row[0] as string) || '';
      const parts = skillsStr.split(',').map((s) => s.trim());
      for (const p of parts) {
        if (p) {
          skillMap[p] = (skillMap[p] || 0) + 1;
        }
      }
    }
  }
  const topSkills = Object.entries(skillMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    total,
    today,
    thisWeek,
    thisMonth,
    genderCounts,
    wardCounts,
    topSkills,
  };
}

// Log an email dispatch
export function logEmailDispatch(
  regId: number,
  regNumber: string,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  body: string
) {
  if (!db) return;
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO email_dispatches (
      reg_id, reg_number, recipient_email, recipient_name, subject, body, status, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?)
  `);
  stmt.run([regId, regNumber, recipientEmail, recipientName, subject, body, now]);
  stmt.free();
  persistDatabase();
}

// Get email dispatches
export function getEmailDispatches(limit = 50) {
  if (!db) return [];
  const stmt = db.prepare("SELECT * FROM email_dispatches ORDER BY id DESC LIMIT ?");
  stmt.bind([limit]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Log audit action with administrator identity and IP
export function logAudit(
  action: string,
  targetId: string,
  details: string,
  ip: string,
  adminId?: number,
  adminEmail?: string
) {
  if (!db) return;
  const now = new Date().toISOString();
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, target_id, details, ip_address, created_at, admin_id, admin_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([action, targetId, details, ip, now, adminId || null, adminEmail || null]);
    stmt.free();
  } catch (e) {
    // Fallback if schema not yet updated
    try {
      const stmt = db.prepare(`
        INSERT INTO audit_logs (action, target_id, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run([action, targetId, details, ip, now]);
      stmt.free();
    } catch (innerErr) {}
  }
  persistDatabase();
}

// Get audit logs with administrator tracking
export function getAuditLogs(limit = 100) {
  if (!db) return [];
  const stmt = db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?");
  stmt.bind([limit]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Get single admin by ID
export function getAdminById(id: number) {
  if (!db) return null;
  const stmt = db.prepare("SELECT id, email, full_name, organization, role, permissions, status, token_version, created_by, created_at, updated_at, last_login FROM admin_users WHERE id = ?");
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const user = stmt.getAsObject() as any;
  stmt.free();
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    organization: user.organization || 'Imota Local Council',
    role: user.role,
    status: user.status || 'active',
    token_version: user.token_version || 1,
    permissions: parseAdminPermissions(user.role, user.permissions),
    created_by: user.created_by,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_login: user.last_login,
  };
}

// Get all admin users (for Super Admin management)
export function getAllAdmins() {
  if (!db) return [];
  const stmt = db.prepare("SELECT id, email, full_name, organization, role, permissions, status, token_version, created_by, created_at, updated_at, last_login FROM admin_users ORDER BY id ASC");
  const admins: any[] = [];
  while (stmt.step()) {
    const user = stmt.getAsObject() as any;
    admins.push({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization: user.organization || 'Imota Local Council',
      role: user.role,
      status: user.status || 'active',
      token_version: user.token_version || 1,
      permissions: parseAdminPermissions(user.role, user.permissions),
      created_by: user.created_by,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    });
  }
  stmt.free();
  return admins;
}

// Create a new authorized third-party admin user
export function createAdminUser(data: {
  email: string;
  passwordPlain: string;
  full_name: string;
  organization?: string;
  role: string;
  permissions?: Partial<AdminPermissions>;
  created_by: string;
}) {
  if (!db) throw new Error('Database not initialized');
  const cleanEmail = data.email.trim().toLowerCase();

  const checkStmt = db.prepare("SELECT COUNT(*) as count FROM admin_users WHERE email = ?");
  checkStmt.bind([cleanEmail]);
  checkStmt.step();
  const count = (checkStmt.getAsObject() as any).count;
  checkStmt.free();

  if (count > 0) {
    const err: any = new Error('An administrator account with this email address already exists.');
    err.status = 409;
    throw err;
  }

  const hash = bcrypt.hashSync(data.passwordPlain.trim(), 10);
  const fallback = DEFAULT_ROLE_PERMISSIONS[data.role] || DEFAULT_ROLE_PERMISSIONS.admin;
  const mergedPermissions = {
    ...fallback,
    ...(data.permissions || {}),
  };
  const permissionsJson = JSON.stringify(mergedPermissions);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO admin_users (
      email, password_hash, full_name, organization, role, permissions, status, token_version, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?)
  `);
  stmt.run([
    cleanEmail,
    hash,
    data.full_name.trim(),
    (data.organization || 'External Partner').trim(),
    data.role,
    permissionsJson,
    data.created_by,
    now,
    now,
  ]);
  stmt.free();
  persistDatabase();

  const idRes = db.exec("SELECT last_insert_rowid() as id;");
  const newId = idRes[0]?.values[0]?.[0] as number;
  return getAdminById(newId);
}

// Update administrator status (activate, suspend, reactivate, revoke)
export function updateAdminStatus(
  id: number,
  status: 'active' | 'suspended' | 'revoked',
  actorEmail: string
) {
  if (!db) throw new Error('Database not initialized');
  const existing = getAdminById(id);
  if (!existing) {
    const err: any = new Error('Administrator account not found');
    err.status = 404;
    throw err;
  }

  if (existing.email === 'youthsportsimotalcda@gmail.com' && status !== 'active') {
    const err: any = new Error('The primary council super administrator account cannot be deactivated.');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  // Increment token_version so any issued JWT session immediately becomes invalid!
  const stmt = db.prepare(`
    UPDATE admin_users 
    SET status = ?, token_version = token_version + 1, updated_at = ? 
    WHERE id = ?
  `);
  stmt.run([status, now, id]);
  stmt.free();
  persistDatabase();

  return getAdminById(id);
}

// Update administrator details, role, permissions or password
export function updateAdminUser(
  id: number,
  data: {
    full_name?: string;
    organization?: string;
    role?: string;
    permissions?: Partial<AdminPermissions>;
    passwordPlain?: string;
  },
  actorEmail: string
) {
  if (!db) throw new Error('Database not initialized');
  const existing = getAdminById(id);
  if (!existing) {
    const err: any = new Error('Administrator account not found');
    err.status = 404;
    throw err;
  }

  const now = new Date().toISOString();
  let permissionsJson = undefined;
  if (data.permissions || data.role) {
    const role = data.role || existing.role;
    const fallback = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.admin;
    const merged = {
      ...fallback,
      ...(existing.permissions || {}),
      ...(data.permissions || {}),
    };
    permissionsJson = JSON.stringify(merged);
  }

  let sql = 'UPDATE admin_users SET updated_at = ?';
  const params: any[] = [now];

  if (data.full_name) {
    sql += ', full_name = ?';
    params.push(data.full_name.trim());
  }
  if (data.organization !== undefined) {
    sql += ', organization = ?';
    params.push(data.organization.trim());
  }
  if (data.role) {
    sql += ', role = ?';
    params.push(data.role);
  }
  if (permissionsJson) {
    sql += ', permissions = ?';
    params.push(permissionsJson);
  }
  if (data.passwordPlain && data.passwordPlain.trim().length >= 6) {
    sql += ', password_hash = ?, token_version = token_version + 1';
    params.push(bcrypt.hashSync(data.passwordPlain.trim(), 10));
  }

  sql += ' WHERE id = ?';
  params.push(id);

  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  persistDatabase();

  return getAdminById(id);
}

// Delete administrator user
export function deleteAdminUser(id: number, actorEmail: string) {
  if (!db) throw new Error('Database not initialized');
  const existing = getAdminById(id);
  if (!existing) {
    const err: any = new Error('Administrator account not found');
    err.status = 404;
    throw err;
  }

  if (existing.email === 'youthsportsimotalcda@gmail.com') {
    const err: any = new Error('The primary council super administrator account cannot be deleted.');
    err.status = 400;
    throw err;
  }

  const stmt = db.prepare("DELETE FROM admin_users WHERE id = ?");
  stmt.run([id]);
  stmt.free();
  persistDatabase();

  return true;
}

// Admin login verification with comprehensive status checking and last_login recording
export function verifyAdminLogin(email: string, passwordPlain: string) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare("SELECT * FROM admin_users WHERE email = ?");
  stmt.bind([email.trim().toLowerCase()]);
  if (!stmt.step()) {
    stmt.free();
    return { success: false, reason: 'invalid_credentials', message: 'Invalid administrative credentials' };
  }
  const user = stmt.getAsObject() as any;
  stmt.free();

  const isMatch = bcrypt.compareSync(passwordPlain, user.password_hash);
  if (!isMatch) {
    return { success: false, reason: 'invalid_credentials', message: 'Invalid administrative credentials' };
  }

  // Check account status: immediately blocks suspended, revoked or inactive accounts!
  const status = user.status || 'active';
  if (status === 'suspended') {
    return {
      success: false,
      reason: 'suspended',
      message: 'Your administrator account has been suspended by the Super Administrator. Access denied.',
      admin: { id: user.id, email: user.email, role: user.role }
    };
  }

  if (status === 'revoked') {
    return {
      success: false,
      reason: 'revoked',
      message: 'Your administrator account access has been permanently revoked. Access denied.',
      admin: { id: user.id, email: user.email, role: user.role }
    };
  }

  if (status !== 'active') {
    return {
      success: false,
      reason: 'inactive',
      message: `Account is inactive (${status}). Access denied.`,
      admin: { id: user.id, email: user.email, role: user.role }
    };
  }

  // Record successful login timestamp
  const now = new Date().toISOString();
  try {
    const updateStmt = db.prepare("UPDATE admin_users SET last_login = ? WHERE id = ?");
    updateStmt.run([now, user.id]);
    updateStmt.free();
    persistDatabase();
  } catch (e) {}

  return {
    success: true,
    admin: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization: user.organization || 'Imota Local Council',
      role: user.role,
      status: status,
      token_version: user.token_version || 1,
      permissions: parseAdminPermissions(user.role, user.permissions),
      created_by: user.created_by,
      created_at: user.created_at,
      last_login: now,
    },
  };
}
