# ReferralHub – Job Referral & Internal Hiring Platform

A production-ready full-stack platform that lets **employees** refer candidates to open jobs and lets **recruiters** manage the entire hiring pipeline — complete with ATS resume scoring, Kanban/table views, and structured candidate email outreach.

---

## 🏗️ Architecture

```
UpdatedJobReferalApp1/
├── backend/          Java 17 · Spring Boot 4 · Spring Security + JWT · JPA · MySQL
├── frontend/         React 19 · Vite · Plain JS · Vanilla CSS Design Tokens
└── docs/             API_CONTRACT.md · ARCHITECTURE.md · PROGRESS.md · migration.sql
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design and [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) as the single source of truth for every endpoint.

---

## ✨ Feature Overview

| Feature | Employee | Recruiter |
|---|---|---|
| Sign in / Register | ✅ | ✅ (invite code) |
| Browse open jobs | ✅ | ✅ |
| Add / manage jobs | ❌ | ✅ |
| Submit referral with resume | ✅ | ❌ |
| Track own referrals | ✅ | — |
| View all referrals | ❌ | ✅ |
| ATS resume scoring | Auto on submit | Visible in Drawer |
| Update candidate status | ❌ | ✅ |
| Send candidate outreach emails | ❌ | ✅ |
| Email template picker (4 types) | — | ✅ |
| Email delivery history | — | ✅ |
| Kanban + Table views | ✅ | ✅ |
| Dark / Light theme | ✅ | ✅ |

---

## ⚡ Quick Start

### Prerequisites
- **Java 17+** and **Maven 3.9+**
- **Node.js 20+** and **npm**
- **MySQL 8.0+** running locally (or Docker)

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd UpdatedJobReferalApp1
```

Create `backend/src/main/resources/application-dev.properties` (already gitignored template):

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/referral_db?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

# JWT
app.jwt.secret=YOUR_256BIT_SECRET_KEY_HERE
app.jwt.expiry-ms=86400000

# File Storage (absolute path, writable)
app.storage.upload-dir=./uploads

# Mail (dev: use MailDev or Mailtrap)
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
```

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend starts at **http://localhost:8080**. The `DevDataSeeder` seeds demo users automatically.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Note |
|---|---|---|---|
| Recruiter | `recruiter@demo.com` | `DemoPassword123!` | Full admin access |
| Employee | `employee@demo.com` | `DemoPassword123!` | Submit referrals |
| Register new Recruiter | any email | any password | Invite code: `RECRUITER2026` |

---

## 🌍 Environment Variables

All runtime secrets are injected via environment variables or Spring profile property files. **Never commit secrets.**

| Variable | Used in | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | Backend | Full JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Backend | DB username |
| `SPRING_DATASOURCE_PASSWORD` | Backend | DB password |
| `APP_JWT_SECRET` | Backend | Min 256-bit hex key |
| `APP_JWT_EXPIRY_MS` | Backend | Token TTL (default 86400000) |
| `APP_STORAGE_UPLOAD_DIR` | Backend | File upload directory |
| `SPRING_MAIL_HOST` | Backend | SMTP host |
| `SPRING_MAIL_PORT` | Backend | SMTP port |
| `SPRING_MAIL_USERNAME` | Backend | SMTP username |
| `SPRING_MAIL_PASSWORD` | Backend | SMTP password |
| `VITE_API_URL` | Frontend | Backend base URL (default `http://localhost:8080`) |

---

## 🐳 Docker Compose (optional)

```yaml
# docker-compose.yml (place at project root)
version: '3.9'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: referral_db
    ports:
      - "3306:3306"

  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"   # Web UI
      - "1025:1025"   # SMTP

  backend:
    build: ./backend
    depends_on: [db, maildev]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/referral_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
      APP_JWT_SECRET: changeme_use_a_256bit_hex_string
      SPRING_MAIL_HOST: maildev
      SPRING_MAIL_PORT: 1025
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    depends_on: [backend]
    environment:
      VITE_API_URL: http://localhost:8080
    ports:
      - "5173:80"
```

---

## 🔒 Security Notes

- Passwords hashed with **BCrypt** (strength 12).
- JWTs signed with **HS256**, inspected from `Authorization: Bearer` header only.
- All file uploads validated: **PDF/DOCX only, 5 MB max**, path-traversal protected.
- CORS restricted to `http://localhost:5173` in dev, configurable for prod.
- Email subject validated against header-injection (`\r`/`\n` rejected at DTO layer).
- Generic `401` error messages prevent user enumeration.
- `@PreAuthorize` on every recruiter-only endpoint, employee-scoping enforced at service layer.

---

## 🧪 Running Tests

### Backend (31 tests)

```bash
cd backend
mvn clean verify
```

Test classes: `AuthControllerTest` (8), `JobControllerTest` (6), `ReferralControllerTest` (10), `RecruiterEmailControllerTest` (6), smoke (1).

### Frontend Lint + Build

```bash
cd frontend
npm run lint    # 0 errors, 0 warnings
npm run build   # production bundle
```

### End-to-End (Playwright, 21 tests)

```bash
cd frontend
npx playwright test
```

Slices covered: Auth (6), Jobs (4), Referrals/ATS (5), Email Outreach (5), Smoke (1).

---

## 📋 API Summary

See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) for full request/response shapes.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register (employee or recruiter) |
| `POST` | `/auth/login` | None | Get JWT |
| `GET` | `/auth/me` | Any | Current user profile |
| `GET` | `/jobs` | Any | List jobs (search, paginated) |
| `POST` | `/jobs` | RECRUITER | Create job |
| `POST` | `/referrals` | EMPLOYEE | Submit referral + resume |
| `GET` | `/referrals` | Any | List referrals (employee-scoped) |
| `GET` | `/referrals/stats` | Any | Status count breakdown |
| `GET` | `/referrals/{id}` | Any | Single referral detail |
| `PATCH` | `/referrals/{id}/status` | RECRUITER | Update application status |
| `GET` | `/referrals/{id}/resume` | Any | Stream/download resume |
| `GET` | `/referrals/{id}/email-draft` | RECRUITER | Pre-filled email template |
| `POST` | `/referrals/{id}/emails` | RECRUITER | Send candidate outreach email |
| `GET` | `/referrals/{id}/emails` | RECRUITER | Email delivery history |

---

## 🗺️ Git History (branch: `finalize`)

| Commit | Slice | Description |
|---|---|---|
| `258ea09` | Phase 0 | Baseline, docs, env, profiles, DevDataSeeder |
| `afe679d` | Phase 1 | Design system, AppShell, UI component library |
| `2987650` | Slice A | Auth — BCrypt, JWT, split-screen AuthPage |
| `ae8f927` | Slice B | Jobs — CRUD, skill chips, AddJobModal |
| `0f5334c` | Slice C | Referrals, ATS scoring, resume upload |
| `dbf0590` | Slice D | Recruiter email outreach, templates, history |
