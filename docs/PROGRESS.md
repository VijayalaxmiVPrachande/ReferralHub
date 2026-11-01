# ReferralHub - Progress Log

## Current Status
- **Current Phase**: **COMPLETE** — All 6 phases shipped on branch `finalize`.
- **Active Branch**: `finalize`
- **Final Gate R4 Result**: PASSED ✅

---

## Slice Status

| Slice | Backend | Frontend | Tests | Gate R4 | Status |
|---|---|---|---|---|---|
| **Phase 0: Baseline, Docs, Config** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 1: Design System & Shell** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 2: Slice A — Auth** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 3: Slice B — Jobs** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 4: Slice C — Referrals & ATS** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 5: Slice D — Recruiter Emails** | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **Phase 6: Final Polish & Docs** | ✅ | ✅ | ✅ | ✅ | **Complete** |

---

## Final Test Counts

| Suite | Count | Result |
|---|---|---|
| `AuthControllerTest` | 8 | ✅ All pass |
| `JobControllerTest` | 6 | ✅ All pass |
| `ReferralControllerTest` | 10 | ✅ All pass |
| `RecruiterEmailControllerTest` | 6 | ✅ All pass |
| `JobReferralAndInternalHiringPlatformApplicationTests` | 1 | ✅ All pass |
| **Total Java** | **31** | ✅ |
| Playwright — Auth (Slice A) | 6 | ✅ All pass |
| Playwright — Jobs (Slice B) | 4 | ✅ All pass |
| Playwright — Referrals/ATS (Slice C) | 5 | ✅ All pass |
| Playwright — Emails (Slice D) | 5 | ✅ All pass |
| Playwright — Smoke | 1 | ✅ All pass |
| **Total Playwright** | **21** | ✅ |

---

## Git History (branch: `finalize`)

| Commit | Description |
|---|---|
| `258ea09` | Phase 0: Baseline, docs, env config, profiles, DevDataSeeder |
| `afe679d` | Phase 1: Design tokens, AppShell, 15-component UI library |
| `2987650` | Slice A: Auth — BCrypt, JWT, split-screen AuthPage, 14 tests |
| `ae8f927` | Slice B: Jobs — CRUD, skill chips, AddJobModal, 10 tests |
| `0f5334c` | Slice C: Referrals, ATS scoring, resume upload, 15 tests |
| `dbf0590` | Slice D: Recruiter email outreach, templates, history, 11 tests |
| `(final)` | Phase 6: README, PROGRESS.md, final polish |

---

## Phase 0 Baseline Audit

- **Backend Test Baseline**: Ran `mvn clean test` on initial workspace.
  - Result: 1 test passed (context load `JobReferralAndInternalHiringPlatformApplicationTests`).
  - Observations:
    - MySQL connection was active on `localhost:3306/referral_db`.
    - Hardcoded credentials present in `application.properties` and `JwtUtil.java`.
    - Unused `AppProperties.java` contained old Cloudinary keys.
    - SecurityConfig allowed broad endpoints and had `/api/files/**` public.
- **Frontend Baseline**: Ran `npm run lint` and `npm run build`.
  - Lint Result: FAILED with 10 errors (synchronous setState in effects, unused imports, duplicate CSS keys).
  - Build Result: `vite build` completed but with lint violations.

---

## Decisions & Assumptions

1. **Repository Layout**: Normalized workspace root so that `backend` and `frontend` are at top level.
2. **Database & Testing**: Added H2 database in test scope so unit and integration tests run reliably in headless CI without requiring an active MySQL instance. `dev` and `prod` profiles use MySQL.
3. **Password Security**: Removed all hardcoded secrets from `application.properties` and Java source files. Environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `MAIL_*`, etc.) are now used throughout.
4. **Dev Data Seeding**: Demo recruiter (`recruiter@demo.com`), demo employee (`employee@demo.com`), and 3 sample jobs are seeded only under `@Profile("dev")` when the `users` table is empty. Credentials derive from `DEMO_PASSWORD`.
5. **No TypeScript**: Frontend remains in plain JavaScript per mission constraints.
6. **No TailwindCSS**: All styling uses the design token system in `frontend/src/index.css`.
7. **Email Test Strategy**: `RecruiterEmailControllerTest` uses `@MockitoBean EmailService` to avoid real SMTP calls. `ReferralControllerTest` uses the real `EmailServiceImpl` (which fails silently to mock SMTP), confirmed by the async acknowledgment warnings in test output.
8. **FK Delete Order**: `ReferralControllerTest.setUp()` now calls `referralEmailRepository.deleteAll()` before `referralRepository.deleteAll()` to satisfy the FK constraint between `referral_email` and `referral`.

---

## Known Issues & Notes for Manual Action

- Leaked secrets in git history (old Gmail app password, DB password, Cloudinary credentials) must be purged using `git filter-repo` or BFG by the user, and credentials rotated immediately.
- For production deployment, set `spring.jpa.hibernate.ddl-auto=validate` and run the provided `docs/migration.sql` manually to evolve the schema safely.
