/**
 * Age calculation & eligibility validation utilities for Imota LCDA Youth Registration Portal.
 * Enforces requirement: Only applicants between 18 and 40 years old (inclusive) are eligible.
 * Dynamically calculates age against the current date so eligibility remains accurate over time.
 */

export const MIN_ELIGIBLE_AGE = 18;
export const MAX_ELIGIBLE_AGE = 40;
export const AGE_ELIGIBILITY_ERROR_MESSAGE =
  'Registration is only open to individuals between 18 and 40 years old.';

export interface AgeValidationResult {
  age: number | null;
  isValid: boolean;
  message?: string;
}

/**
 * Calculates exact chronological age from a YYYY-MM-DD date of birth string
 * relative to the current date (or an optional reference date).
 */
export function calculateAge(dobString: string, referenceDate: Date = new Date()): number | null {
  if (!dobString || typeof dobString !== 'string') return null;

  const parts = dobString.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date(dobString);
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
  const currentMonth = referenceDate.getMonth() + 1; // 1 to 12
  const currentDay = referenceDate.getDate(); // 1 to 31

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Validates whether an applicant is between 18 and 40 years old (inclusive)
 * as of the current date.
 */
export function validateAgeEligibility(
  dobString: string,
  referenceDate: Date = new Date()
): AgeValidationResult {
  if (!dobString || !dobString.trim()) {
    return {
      age: null,
      isValid: false,
      message: 'Date of Birth is required.',
    };
  }

  const age = calculateAge(dobString, referenceDate);

  if (age === null || isNaN(age)) {
    return {
      age: null,
      isValid: false,
      message: 'Please provide a valid date of birth.',
    };
  }

  if (age < MIN_ELIGIBLE_AGE || age > MAX_ELIGIBLE_AGE) {
    return {
      age,
      isValid: false,
      message: AGE_ELIGIBILITY_ERROR_MESSAGE,
    };
  }

  return {
    age,
    isValid: true,
  };
}

/**
 * Returns dynamic minimum and maximum date strings (YYYY-MM-DD) for HTML5 datepicker boundaries,
 * corresponding to ages 40 and 18 relative to today.
 */
export function getDOBRangeLimits(referenceDate: Date = new Date()): { minDOB: string; maxDOB: string } {
  // Oldest eligible applicant: exactly 40 years old today
  const minDate = new Date(referenceDate);
  minDate.setFullYear(referenceDate.getFullYear() - (MAX_ELIGIBLE_AGE + 1));
  minDate.setDate(minDate.getDate() + 1);

  // Youngest eligible applicant: at least 18 years old today
  const maxDate = new Date(referenceDate);
  maxDate.setFullYear(referenceDate.getFullYear() - MIN_ELIGIBLE_AGE);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    minDOB: formatDate(minDate),
    maxDOB: formatDate(maxDate),
  };
}
