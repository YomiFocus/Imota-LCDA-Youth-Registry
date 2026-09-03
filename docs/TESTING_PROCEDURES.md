# Imota LCDA Youth Data Registration Portal - Testing Procedures & Quality Assurance

This document describes the validation procedures to verify all four duplicate rules, format constraints, and security requirements.

---

## 1. Duplicate Verification Test Matrix

The database is pre-seeded with the example record:
- **Full Name**: `Adebogun Oriyomi`
- **Email Address**: `adebogunoriyomi@gmail.com`
- **Phone Number**: `08031234567`

### Test Case 1: Rule 1 - Full Name Duplicate Detection
- **Objective**: Verify that attempting to register with an existing full name is rejected immediately before insertion.
- **Input**:
  - Full Name: `Adebogun Oriyomi` (or `adebogun oriyomi`, or `  Adebogun   Oriyomi  `)
  - Email: `any.different.email@test.com`
  - Phone: `08199990001`
- **Expected Result**:
  - HTTP Status: `409 Conflict`
  - Error Message: `"This name has already been used for registration."`
  - Database Insertion: Rejected, no record created.

---

### Test Case 2: Rule 2 - Email Address Uniqueness & Case-Insensitivity
- **Objective**: Verify that email addresses are strictly unique and case-insensitive.
- **Input**:
  - Full Name: `Unique Person Name`
  - Email: `Adebogunoriyomi@gmail.com` (note capital 'A')
  - Phone: `08199990002`
- **Expected Result**:
  - HTTP Status: `409 Conflict`
  - Error Message: `"This email address already exists."`
  - Database Insertion: Rejected.

---

### Test Case 3: Rule 3 - Nigerian Phone Number Format & Uniqueness
- **Objective**: Verify that phone numbers are unique regardless of prefix (+234 vs 080).
- **Input**:
  - Full Name: `Another Distinct Youth`
  - Email: `another.youth@test.com`
  - Phone: `+234 803 123 4567` (equivalent to `08031234567`)
- **Expected Result**:
  - HTTP Status: `409 Conflict`
  - Error Message: `"This phone number has already been used."`
  - Database Insertion: Rejected.

---

### Test Case 4: Rule 4 - Database Constraint Verification
- **Objective**: Verify that even if frontend checks or client-side scripts are disabled or bypassed, the database layer enforces uniqueness.
- **Method**: Send direct raw POST requests with cURL or Postman to `/api/register` with duplicate values.
- **Expected Result**: Backend pre-insert check and SQLite/PostgreSQL UNIQUE constraints reject the insertion.

---

## 2. Automated Test Execution in Admin Dashboard
The admin dashboard includes an interactive **"System Diagnostics & Rules Test"** panel:
1. Log into the Admin Dashboard using:
   - Email: `admin@imota.gov.ng`
   - Password: `Admin@Imota2026!`
2. Navigate to **"Test Rules & SQL"** tab.
3. Click **"Run Automated Duplicate Rule Tests"**.
4. The system executes the test suite against `/api/admin/test-duplicate-rules` and displays green checkmarks for all 4 rules!
