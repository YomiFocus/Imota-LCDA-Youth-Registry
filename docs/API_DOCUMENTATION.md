# Imota LCDA Youth Data Registration Portal - API Documentation

## Base URL
- Production: `https://<your-domain>/api`
- Development: `http://localhost:3000/api`

---

## 1. Public Endpoints

### `GET /api/health`
Health check and system status.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "Imota LCDA Youth Data Registration Portal Backend",
  "timestamp": "2026-09-02T13:30:00.000Z"
}
```

---

### `GET /api/validate-field`
Performs instant real-time validation for a single unique field before submission.
- **Query Parameters**:
  - `field`: `name` | `email` | `phone` (Required)
  - `value`: String value to validate (Required)
  - `excludeId`: (Optional) Existing record ID when editing
- **Response**: `200 OK`
```json
{
  "available": false,
  "message": "This email address already exists."
}
```

---

### `POST /api/check-duplicates`
Pre-flight verification checking all three duplicate rules simultaneously.
- **Request Body**:
```json
{
  "full_name": "Adebogun Oriyomi",
  "email": "adebogunoriyomi@gmail.com",
  "phone": "08031234567"
}
```
- **Response**: `200 OK`
```json
{
  "isDuplicate": true,
  "rule": 1,
  "message": "This name has already been used for registration."
}
```

---

### `POST /api/register`
Submits a new youth registration record.
- **Rate Limit**: 20 requests per minute per IP.
- **Validation Rules Enforced**:
  - Rule 1: A Full Name can only appear once. Reject with: `"This name has already been used for registration."`
  - Rule 2: An Email Address must be unique (case-insensitive). Reject with: `"This email address already exists."`
  - Rule 3: A Phone Number must be unique (normalized Nigerian 11-digit). Reject with: `"This phone number has already been used."`
  - Rule 4: Duplicate checks occur BEFORE database insertion. Relational UNIQUE constraints prevent duplicates even if bypassed.
- **Request Body**:
```json
{
  "full_name": "Babajide Sanwo-Olu",
  "email": "sanwoolu.youth@example.com",
  "phone": "08021112233",
  "gender": "Male",
  "ward": "Ward B - Oke-Agbo",
  "lassra": "LA-2026-902314",
  "dob": "2000-05-12",
  "address": "12 Council Road, Imota LCDA, Lagos",
  "state_of_origin": "Lagos",
  "occupation": "Automobile Technician",
  "education": "National Diploma (ND)",
  "photo_url": "data:image/jpeg;base64,...",
  "skills": "Automotive Engineering, Diagnostics"
}
```
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Congratulations! Your registration has been submitted successfully.",
  "registration": {
    "id": 104,
    "reg_number": "IMT/2026/YTH-00104",
    "full_name": "Babajide Sanwo-Olu",
    "email": "sanwoolu.youth@example.com",
    "phone": "08021112233",
    "gender": "Male",
    "ward": "Ward B - Oke-Agbo",
    "dob": "2000-05-12",
    "address": "12 Council Road, Imota LCDA, Lagos",
    "state_of_origin": "Lagos",
    "occupation": "Automobile Technician",
    "education": "National Diploma (ND)",
    "skills": "Automotive Engineering, Diagnostics",
    "created_at": "2026-09-02T13:30:00.000Z"
  }
}
```
- **Duplicate Error Response**: `409 Conflict`
```json
{
  "error": "This name has already been used for registration.",
  "rule": 1
}
```

---

## 2. Administrative Endpoints (Protected by JWT)

All admin requests require the header:
`Authorization: Bearer <jwt_token>`

### `POST /api/admin/login`
- **Request Body**:
```json
{
  "email": "admin@imota.gov.ng",
  "password": "Admin@Imota2026!"
}
```
- **Response**: `200 OK` with JWT token.

### `GET /api/admin/stats`
Returns counts for Total, Today, This Week, This Month, Gender breakdown, Ward breakdown, and top skills.

### `GET /api/admin/registrations`
Query parameters: `search`, `startDate`, `endDate`, `ward`, `gender`.

### `PUT /api/admin/registrations/:id`
Updates existing record while preventing duplicate conflicts with other registered youths.

### `DELETE /api/admin/registrations/:id`
Deletes record and logs audit trail.

### `GET /api/admin/export/excel`
Generates binary `.xlsx` spreadsheet download.

### `GET /api/admin/export/csv`
Generates UTF-8 encoded `.csv` file with Excel BOM.

### `POST /api/admin/test-duplicate-rules`
Runs automated validation test suite testing Rules 1, 2, 3, and 4 against active test records.
