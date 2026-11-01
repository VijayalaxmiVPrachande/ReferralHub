# API Contract - ReferralHub

All endpoints speak JSON (except resume file streaming).
All dates are in ISO-8601 format (`YYYY-MM-DDTHH:mm:ss`).
All non-2xx responses MUST use the unified Error shape.

---

## Unified Error Shape
Every non-2xx response adheres to:
```json
{
  "status": 400,
  "message": "Human readable summary",
  "errors": {
    "field": "Field validation message"
  }
}
```
*Note: `errors` map may be empty for non-validation errors.*

HTTP Status Codes:
- `400 Bad Request`: Validation failure or malformed payload
- `401 Unauthorized`: Missing, expired, or invalid JWT token; invalid login credentials
- `403 Forbidden`: Authenticated user lacks permission for action/role
- `404 Not Found`: Resource does not exist, or referral not owned by employee
- `409 Conflict`: Duplicate email registration or candidate already referred to job
- `500 Internal Server Error`: Generic internal server error (no SQL or stack traces leaked)
- `502 Bad Gateway`: Email provider failure during recruiter email dispatch (FAILED record is persisted)

---

## Enums

### Status
`REFERRED`, `IN_REVIEW`, `NEXT_ROUND`, `SELECTED`, `REJECTED`

### Role
`EMPLOYEE`, `RECRUITER`

### EmailType
`NEXT_ROUND`, `SELECTED`, `REJECTED`, `CUSTOM`

### EmailStatus
`SENT`, `FAILED`

---

## Authentication (`/auth`)

### 1. Register
- **URL**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "inviteCode": "OPTIONAL_CODE"
  }
  ```
  - `password`: minimum 8 characters
  - Role is `EMPLOYEE` unless `inviteCode` equals `APP_RECRUITER_INVITE_CODE`, then `RECRUITER`.
  - Duplicate email -> `409 Conflict`.
  - Any `role` or `id` fields in request body are completely ignored and never bound.
- **Response**: `201 Created`
  ```json
  {
    "message": "User registered successfully"
  }
  ```

### 2. Login
- **URL**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "role": "EMPLOYEE",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```
- **Failure**: Wrong email or wrong password -> `401 Unauthorized` with message: `"Invalid email or password"`.

### 3. Get Current User Profile
- **URL**: `GET /auth/me`
- **Access**: Authenticated (`EMPLOYEE` or `RECRUITER`)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "EMPLOYEE"
  }
  ```

---

## Jobs (`/jobs`)

### 1. List Jobs
- **URL**: `GET /jobs`
- **Access**: Authenticated (`EMPLOYEE` or `RECRUITER`)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Senior Backend Engineer",
      "description": "Looking for Java and Spring Boot experience...",
      "location": "Remote / Bengaluru"
    }
  ]
  ```

### 2. Create Job
- **URL**: `POST /jobs`
- **Access**: `RECRUITER` only
- **Request Body**:
  ```json
  {
    "title": "Senior Backend Engineer",
    "description": "Job description up to 5000 characters...",
    "location": "Bengaluru, India"
  }
  ```
  - `title`: required, max 150 chars
  - `description`: optional, max 5000 chars
  - `location`: optional, max 150 chars
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "title": "Senior Backend Engineer",
    "description": "Job description up to 5000 characters...",
    "location": "Bengaluru, India"
  }
  ```

---

## Referrals (`/referrals`)

### Model Types
```typescript
interface ReferralResponse {
  id: number;
  status: "REFERRED" | "IN_REVIEW" | "NEXT_ROUND" | "SELECTED" | "REJECTED";
  createdTime: string; // ISO-8601
  atsScore: number | null;
  atsLabel: string;
  matchedSkills: string[];
  missingSkills: string[];
  job: {
    id: number;
    title: string;
  };
  candidate: {
    name: string;
    email: string;
    phone?: string;
  };
  referredBy: {
    name: string;
    email: string;
  } | null; // ONLY populated for RECRUITER; null for EMPLOYEE
  hasResume: boolean;
  lastEmailAt: string | null; // ONLY populated for RECRUITER; null for EMPLOYEE
}
```

### 1. Submit Referral
- **URL**: `POST /referrals`
- **Access**: `EMPLOYEE` only
- **Content-Type**: `multipart/form-data`
- **Parts**:
  - `data` (`application/json`):
    ```json
    {
      "jobId": 1,
      "candidate": {
        "name": "Alex Smith",
        "email": "alex@example.com",
        "phone": "+1-555-0199"
      }
    }
    ```
    - `phone`: optional, pattern `^$|^[0-9+\-\s]{7,15}$`
  - `resume` (Binary file): `.pdf` or `.docx`, max 5 MB
- **Response**: `201 Created`
  Returns `ReferralResponse`
- **Duplicate Rule**: If candidate with same email already referred to same job -> `409 Conflict`.

### 2. List Referrals (Paginated, Filtered, Sorted)
- **URL**: `GET /referrals?page=0&size=10&sort=newest|ats&status=&q=`
- **Access**: Authenticated
  - `EMPLOYEE`: Sees only own submitted referrals
  - `RECRUITER`: Sees all referrals
- **Query Params**:
  - `page`: default `0`
  - `size`: default `10`
  - `sort`: `newest` (default) or `ats` (atsScore desc)
  - `status`: optional filter (`REFERRED`, `IN_REVIEW`, `NEXT_ROUND`, `SELECTED`, `REJECTED`)
  - `q`: optional search keyword matching candidate name, candidate email, or job title
- **Response**: `200 OK`
  ```json
  {
    "content": [ /* ReferralResponse objects */ ],
    "page": 0,
    "size": 10,
    "totalPages": 3,
    "totalElements": 25
  }
  ```

### 3. Referral Statistics
- **URL**: `GET /referrals/stats`
- **Access**: Authenticated (same visibility rules; computed across ALL referrals, not paginated)
- **Response**: `200 OK`
  ```json
  {
    "REFERRED": 8,
    "IN_REVIEW": 5,
    "NEXT_ROUND": 4,
    "SELECTED": 2,
    "REJECTED": 3,
    "total": 22
  }
  ```

### 4. Get Single Referral
- **URL**: `GET /referrals/{id}`
- **Access**: Owner (`EMPLOYEE` who submitted it) or any `RECRUITER`; otherwise `404 Not Found`.
- **Response**: `200 OK`
  Returns `ReferralResponse`

### 5. Download / Preview Resume
- **URL**: `GET /referrals/{id}/resume?download=true|false`
- **Access**: Owner or `RECRUITER`; unauthenticated returns `401 Unauthorized`; non-owner employee returns `404 Not Found`.
- **Response**: `200 OK` file stream
  - `Content-Type`: `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `X-Content-Type-Options: nosniff`
  - `Content-Disposition`: `inline; filename="<CandidateName>-resume.<ext>"` (when download=false) or `attachment; filename="<CandidateName>-resume.<ext>"` (when download=true)

### 6. Update Referral Status
- **URL**: `PATCH /referrals/{id}/status`
- **Access**: `RECRUITER` only
- **Request Body**:
  ```json
  {
    "status": "NEXT_ROUND"
  }
  ```
- **Response**: `200 OK`
  Returns updated `ReferralResponse`.
  *Note: This endpoint sends NO email to the candidate.*

---

## Recruiter Candidate Emails (`/referrals/{id}/...`)
All endpoints in this section are **RECRUITER only**.

### 1. Get Email Draft
- **URL**: `GET /referrals/{id}/email-draft?type=NEXT_ROUND|SELECTED|REJECTED|CUSTOM`
- **Access**: `RECRUITER` only
- **Response**: `200 OK`
  ```json
  {
    "to": "alex@example.com",
    "subject": "Interview Invitation: Senior Backend Engineer at ReferralHub",
    "body": "Hi Alex,\n\n..."
  }
  ```
  - Placeholders `{{candidateName}}`, `{{jobTitle}}`, `{{recruiterName}}`, `{{company}}` pre-filled.
  - `NEXT_ROUND` draft contains marked lines for round name, date and time, meeting link/address, and what to bring.

### 2. Send Email
- **URL**: `POST /referrals/{id}/emails`
- **Access**: `RECRUITER` only
- **Request Body**:
  ```json
  {
    "type": "NEXT_ROUND",
    "subject": "Interview Invitation: Next Round",
    "body": "Hi Alex,\n\nWe are pleased to invite you...",
    "ccMe": true,
    "notifyReferrer": true,
    "updateStatus": true
  }
  ```
  - `subject`: required, max 150 chars, NO line breaks (`\r` or `\n` rejected)
  - `body`: required, max 5000 chars
  - `ccMe`: CC recruiter's email
  - `notifyReferrer`: CC the referring employee's email
  - `updateStatus`: if true and send succeeds, updates status to matching type (`NEXT_ROUND`, `SELECTED`, `REJECTED`; `CUSTOM` leaves status unchanged)
- **Response**: `200 OK` (when send succeeds)
  ```json
  {
    "id": 1,
    "type": "NEXT_ROUND",
    "toEmail": "alex@example.com",
    "subject": "Interview Invitation: Next Round",
    "body": "Hi Alex,\n...",
    "status": "SENT",
    "errorMessage": null,
    "sentAt": "2026-11-01T15:30:00",
    "sentBy": {
      "name": "Sarah Recruiter",
      "email": "sarah@example.com"
    }
  }
  ```
- **Failure**: On mail delivery exception, a record with status `FAILED` and error message is saved, status remains unchanged, and response is `502 Bad Gateway` using the Error shape.

### 3. List Email History
- **URL**: `GET /referrals/{id}/emails`
- **Access**: `RECRUITER` only
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "type": "NEXT_ROUND",
      "toEmail": "alex@example.com",
      "subject": "Interview Invitation: Next Round",
      "body": "...",
      "status": "SENT",
      "errorMessage": null,
      "sentAt": "2026-11-01T15:30:00",
      "sentBy": {
        "name": "Sarah Recruiter",
        "email": "sarah@example.com"
      }
    }
  ]
  ```
  Sorted newest first.

---

## Automatic Background Notifications (Async, Best-Effort)
- When a referral is created, an async acknowledgement email is dispatched to the candidate (`@Async`). Failures are logged and never fail the referral creation.
- When referral status is updated, an optional async notice may be sent to the referring employee (best-effort).
