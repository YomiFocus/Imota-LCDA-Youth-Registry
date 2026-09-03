/**
 * Input sanitization, normalization, and validation rules for Imota LCDA Youth Registration
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Clean and normalize full name
export function normalizeFullName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Clean and normalize email address (case-insensitive)
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Normalize Nigerian phone numbers to canonical 11-digit local format: e.g. 08031234567
export function normalizePhoneNumber(phone: string): { normalized: string; valid: boolean } {
  if (!phone) return { normalized: '', valid: false };

  // Remove whitespace, hyphens, brackets, dots
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle +234 or 234 prefix
  if (cleaned.startsWith('+234')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('234') && cleaned.length === 13) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Nigerian phone numbers should be 11 digits starting with 0
  const nigerianPhoneRegex = /^0(70|80|81|90|91|71|82)\d{8}$/;
  // Also allow standard 11 digit 0XXXXXXXXXX for flexibility across all Nigerian telecom networks
  const genericNigerianRegex = /^0\d{10}$/;

  const isValid = genericNigerianRegex.test(cleaned);

  return {
    normalized: cleaned,
    valid: isValid,
  };
}

// Validate standard email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

// Calculate chronological age from date of birth string (YYYY-MM-DD)
export function calculateAge(dob: string, referenceDate: Date = new Date()): number | null {
  if (!dob || typeof dob !== 'string') return null;
  const parts = dob.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    let fallbackAge = referenceDate.getFullYear() - d.getFullYear();
    const m = referenceDate.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < d.getDate())) {
      fallbackAge--;
    }
    return fallbackAge >= 0 ? fallbackAge : null;
  }

  const [year, month, day] = parts;
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  let age = referenceDate.getFullYear() - year;
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }
  return age >= 0 ? age : null;
}

// Validate date of birth - Only applicants between 18 and 40 years old (inclusive)
export const MIN_ELIGIBLE_AGE = 18;
export const MAX_ELIGIBLE_AGE = 40;
export const AGE_ELIGIBILITY_ERROR_MESSAGE =
  'Registration is only open to individuals between 18 and 40 years old.';

export function isValidDOB(
  dob: string,
  referenceDate: Date = new Date()
): { valid: boolean; age: number | null; error?: string } {
  if (!dob || !dob.trim()) {
    return { valid: false, age: null, error: 'Date of Birth is required.' };
  }

  const age = calculateAge(dob, referenceDate);
  if (age === null || isNaN(age)) {
    return { valid: false, age: null, error: 'Please enter a valid date of birth.' };
  }

  if (age < MIN_ELIGIBLE_AGE || age > MAX_ELIGIBLE_AGE) {
    return {
      valid: false,
      age,
      error: AGE_ELIGIBILITY_ERROR_MESSAGE,
    };
  }

  return { valid: true, age };
}

// Sanitize string against XSS injection
export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[<>]/g, '') // strip potential HTML tags
    .slice(0, 500); // enforce maximum length
}
