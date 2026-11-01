# ReferralHub Architecture

## 1. System Overview
ReferralHub is an internal job referral and hiring platform enabling employees to refer qualified candidates for open job positions and track their status, while recruiters manage job openings, review ATS matching scores, inspect resumes, transition candidate status, and compose candidate communications directly through pre-filled templates.

```
+--------------------------------------------------------------------+
|                         React 19 + Vite UI                         |
|  - Vanilla CSS Design Tokens (Light/Dark themes)                   |
|  - Plus Jakarta Sans (Headings) + Inter (Body)                     |
|  - Lucide Icons & Responsive App Shell                             |
|  - Client API Client (JWT Bearer, unified Error shape parsing)     |
+---------------------------------+----------------------------------+
                                  | HTTP / JSON & Multipart
                                  v
+--------------------------------------------------------------------+
|                   Spring Boot 4.x / Java 17 Backend                |
|                                                                    |
|  [Security Filter Chain] -> JwtFilter -> SecurityContext           |
|                                                                    |
|  [Controllers]                                                     |
|    - AuthController        - JobController                         |
|    - ReferralController    - RecruiterEmailController              |
|                                                                    |
|  [Services & Business Logic]                                       |
|    - AuthService           - JobService                            |
|    - ReferralService       - AtsService (regex boundary matcher)   |
|    - EmailService          - FileSystemStorageService              |
|                                                                    |
|  [Repositories (Spring Data JPA)]                                  |
|    - UserRepository        - JobRepository                         |
|    - CandidateRepository   - ReferralRepository                    |
|    - ReferralEmailRepository                                       |
|                                                                    |
|  [Database] MySQL 8.0 (Dev/Prod) / H2 In-Memory (Test scope)       |
|  [Storage]  backend/uploads (isolated filesystem directory)        |
|  [Mailer]   JavaMailSender (SMTP / mock in test)                   |
+--------------------------------------------------------------------+
```

## 2. Core Components & Responsibilities

### Backend
- **Security & JWT**: Stateless authentication via `JwtFilter` extracting Bearer token from the `Authorization` header. Custom `AuthenticationEntryPoint` (401) and `AccessDeniedHandler` (403) emit the unified Error shape.
- **DTO Layer**: Strong isolation between public API contracts and JPA persistence entities. Prevents parameter binding attacks (e.g. self-assigning role or overwriting IDs).
- **ATS Engine (`AtsService`)**: Analyzes resume content extracted via Apache PDFBox (.pdf) and Apache POI (.docx) against required job skills with boundary-safe regex pattern matching (`(?<![a-z0-9])skill(?![a-z0-9])`), ensuring accurate matching for terms like `c++`, `c#`, `.net`, `node.js`, and preventing false matches for English words like "go".
- **Storage (`FileSystemStorageService`)**: Secures uploaded resume assets in a dedicated folder, strictly verifying path resolution to prevent path traversal, and streaming files with `X-Content-Type-Options: nosniff`.
- **Recruiter Emails (`EmailService`)**: Sends personalized recruiter candidate emails with customizable drafts (`NEXT_ROUND`, `SELECTED`, `REJECTED`, `CUSTOM`), updates referral state upon delivery, handles delivery errors with HTTP 502, and logs failure records.

### Frontend
- **Design System (`index.css`)**: Tokenized design system with custom properties for colors, shadows, border radii, and fluid animations. Complete dark/light mode support using `data-theme` attribute on `<html>`.
- **API Client (`src/utils/api.js`)**: Unified request helper handling JWT injection, multi-part uploads, blob file previews, auto-logout on 401, and structured error extraction (`status`, `message`, `fieldErrors`).
- **Context Providers**:
  - `AuthProvider`: Manages token lifecycle, queries `/auth/me` for user identity, never stores roles in localStorage.
  - `ToastProvider`: Global notification toasts with auto-dismiss timers and pause-on-hover.
- **Views**:
  - `AuthPage`: Split-screen layout with hero illustration, responsive registration with invite code toggle.
  - `JobsTab`: Card grid with skill chips extracted from descriptions, detailed job drawer, and recruiter job creation modal.
  - `ReferralsTab`: Top KPI stats cards, list and board views, status filtering, search, ATS scorecard viewer, and multi-tab detail drawer (Overview, Resume preview, Email history).
  - `EmailModal`: Recruiter email composer with draft template selector, template variable substitution, live preview, and status synchronization.

## 3. Data Model
- `User`: `id`, `name`, `email` (unique), `password` (hashed), `role` (`EMPLOYEE`, `RECRUITER`)
- `Job`: `id`, `title`, `description` (TEXT), `location`
- `Candidate`: `id`, `name`, `email` (unique), `phone`, `resume_public_id` (maps to `storedFilename`), `resumeUrl` (legacy, nullable)
- `Referral`: `id`, `job_id`, `employee_id`, `candidate_id`, `status`, `atsScore`, `atsLabel`, `matchedSkills` (TEXT), `missingSkills` (TEXT), `createdTime`
- `ReferralEmail`: `id`, `referral_id`, `sent_by_user_id`, `type`, `to_email`, `subject`, `body` (TEXT), `status` (`SENT`, `FAILED`), `error_message`, `sent_at`
