# ReferralHub - Progress Log

## Current Status
- **Current Phase**: Phase 0 - Baseline, Docs, Config
- **Active Branch**: `finalize`

---

## Slice Status
| Slice | Backend | Frontend | Tests | Gate R4 Passed | Status |
|---|---|---|---|---|---|
| **Phase 0: Baseline, Docs, Config** | Complete | Complete | Complete | YES | Complete |
| **Phase 1: Design System & Shell** | Complete | Complete | Complete | YES | Complete |
| **Phase 2: Slice A - Auth** | In Progress | In Progress | In Progress | Pending | In Progress |
| **Phase 3: Slice B - Jobs** | Not Started | Not Started | Not Started | Pending | Planned |
| **Phase 4: Slice C - Referrals & ATS** | Not Started | Not Started | Not Started | Pending | Planned |
| **Phase 5: Slice D - Recruiter Emails** | Not Started | Not Started | Not Started | Pending | Planned |
| **Phase 6: Final Polish & Verification**| Pending | Pending | Pending | Pending | Planned |

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
  - Lint Result: FAILED with 10 errors:
    - `AddJobModal.jsx`: Synchronous setState call within effect.
    - `AtsScorecard.jsx`: Duplicate `display` keys.
    - `EmptyState.jsx`: Duplicate `margin` key.
    - `Header.jsx`: Unused `mobileOpen`, `setMobileOpen` variables.
    - `Toast.jsx`: Unused `isSuccess` variable.
    - `Dashboard.jsx`: Synchronous setState in useEffect causing potential cascading renders.
    - `ReferralsTab.jsx`: Unused `Modal` import.
  - Build Result: `vite build` completed in 415ms, producing bundle.

---

## Decisions & Assumptions
1. **Repository Layout**: Normalized workspace root so that `backend` and `frontend` are at top level.
2. **Database & Testing**: Added H2 database in test scope so unit and integration tests run reliably and fast in headless CI environments without requiring an active MySQL instance, while `dev` and `prod` profiles use MySQL.
3. **Password Security**: Removed all hardcoded secrets from `application.properties` and Java source files. Environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `APP_CORS_ORIGINS`, `APP_UPLOAD_DIR`, `APP_COMPANY_NAME`, `APP_RECRUITER_INVITE_CODE`, `DEMO_PASSWORD`) are now utilized.
4. **Dev Data Seeding**: Demo recruiter (`recruiter@demo.com`), demo employee (`employee@demo.com`), and 3 sample jobs are seeded only under `@Profile("dev")` when the `users` table is empty. Credentials derive from `DEMO_PASSWORD`.
5. **No Questions Policy (R8)**: Sensible decisions made per prompt requirements without interrupting the workflow.

---

## Known Issues & Notes for Manual Action
- Leaked secrets in git history (old Gmail app password, DB password, Cloudinary credentials) must be purged using `git filter-repo` or BFG by the user, and credentials rotated.
