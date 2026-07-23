# CIMS Campus LMS — User Manual & Technical/Deployment Guide

**Prepared by:** Shakna Rizath, Software Engineer
**Date:** July 2026
**Purpose:** Describes what the CIMS Campus platform actually does today, role by role, and what is needed to take it from local development to a hosted, production environment — required API keys, hosting steps, domain/DNS, and security posture.

This document reconciles against the original *Learning Management System (LMS) Dashboard* proposal (July 2026) submitted for approval. Where the built system differs from what was proposed, that is called out explicitly rather than glossed over.

---

## 1. System Overview

CIMS Campus is a role-based academic management platform covering the full student lifecycle — admissions, enrollment, teaching, assessment, attendance, finance, examinations, staff management, and reporting — for a single institution (Ceylon Institute of Management Sciences).

It is built as one full-stack Next.js application (not a separate frontend/backend), backed by a single PostgreSQL database, with 11 role-based dashboards sharing one authentication system and one design system.

### 1.1 Guiding principles (carried over from the original proposal)
- **Role-based access** — every user sees only the tools and data relevant to their role.
- **Single source of truth** — one database, no duplicate spreadsheets or disconnected tools.
- **Automation over manual work** — grade calculation, GPA, invoices, offer letters, and certificates are system-generated, not manually compiled.
- **Real data only** — every dashboard stat reflects an actual database query; nothing is a fabricated placeholder unless explicitly labeled "Coming soon."

---

## 2. User Roles & What Each Can Do Today

All 11 roles from the original proposal exist and are functional. Below is what each role can actually do in the live system, not what was originally scoped.

### Student
Self-service portal: browse/register for the course catalog, view enrolled modules and content (video links, notes, PDFs, slides), submit assignments, take quizzes/exams/practical assessments, view grades and GPA, check attendance, view/pay fees (mock gateway or manual bank-transfer upload), apply for scholarships, view/download certificates (with QR verification) and transcripts, participate in module-level and institution-wide forums, view announcements, manage their own profile/avatar, and see a notification bell for all of the above.

### Lecturer
Manages assigned modules: uploads content (notes/PDFs/slides/video links/Zoom-Meet links), creates assignments/quizzes/exams/practical assessments with rubrics, grades submissions (auto-graded MCQ/True-False, manual essay/practical), records attendance per class session, runs a grade book (category-weighted, feeds GPA), tags learning outcomes onto assessments, manages module-level discussion boards and announcements, and views their own teaching workload/schedule.

### Program Coordinator
Manages class sessions/timetables with room and lecturer conflict detection, oversees module assignment across lecturers, files and tracks discipline cases (routed to Academic Director for resolution), views student support summaries, and sees lecturer workload reporting.

### Academic Director
Cross-program oversight: academic performance and grade-distribution analytics, module quality summaries, lecturer workload reporting, discipline case resolution, and institution-wide reporting dashboards.

### Admin (Super Admin / Campus Admin)
Full system administration: manages users/roles/programs/modules/semesters/academic years, reviews and approves admissions applications (with auto-generated offer letters and set-password emails), verifies payments, manages scholarships, posts institution-wide announcements, and views the full analytics suite. **Note:** Campus Admin currently shares the exact same dashboard/routes as Super Admin — there is no distinct Campus Admin view yet (see §5).

### Finance Officer
Manages program/semester fee structures, verifies student payment uploads and issues real invoice PDFs, decides scholarship discount awards, and views outstanding-balance/collection-rate financial reports.

### HR Officer
Manages staff employment records (contracts, expiry tracking) and staff leave requests (approve/reject workflow). Payroll itself is **not** built — see §5.

### Examination Unit
Schedules exams with venue/invigilator conflict detection, manages a marks-locking workflow per module (locks grade entry once finalized), reviews and selects which results to publish to students, and generates transcripts.

### Marketing Officer
Views admissions/enrollment-adjacent stats. Two of its four dashboard stats ("Prospective enquiries," "Conversion rate") are still `comingSoon` placeholders — see §5.

### Library Officer
Has a role, login, and dashboard shell, but the dashboard's stats (catalogue size, active loans, overdue items) are all still `comingSoon` — no real library/loan model has been built yet.

---

## 3. Module-by-Module Status (vs. the original proposal's modules)

| Proposal Module | Status | Notes |
|---|---|---|
| Learning Module | **Done** | Content types (video link, notes, PDF, slides, eBooks), assignments, quizzes, discussion boards all real. |
| Assessment Module | **Done** | MCQ/True-False (auto-graded), Essay and Practical (rubric-scored, manually graded), timed attempts, exam scheduling with conflict detection. |
| Communication Module | **Partial** | Email is real (via Resend, once configured). SMS and WhatsApp are wired with adapter interfaces but only `console.log` — no real provider integrated. Institution-wide + module-level forums are real. Push notifications do not exist. |
| Certificate Module | **Done** | PDF certificates with embedded QR codes, public `/verify/[code]` page, transcript generation with a tiered-privacy public verify page. |
| Analytics Dashboard | **Done** | Cross-role reporting for Admin/Academic Director/Coordinator across enrollment, revenue, performance, attendance categories. |
| Admissions | **Done** | Public application form, staff review queue, offer letters, set-password email. |
| Attendance | **Done** | Tied to real class sessions, bulk roster entry, surfaced on Lecturer/Student/Admin/Reports. |
| GPA / Transcripts | **Done** | 4.0-scale, category-weighted, one shared calculation reused across all surfaces. |
| Timetables | **Done** | Room and lecturer conflict detection. |
| Scholarships / Discipline | **Done** | Student-applies → Finance-decides; Coordinator-files → Director-resolves. |
| Lecturer Workload | **Done** | Read-only reporting page. |
| Payment Gateway | **Mock only** | Explicitly a sandbox simulation in code (labeled "Sandbox" in the UI) — no real payment processor. |
| Payroll Integration | **Not built** | Placeholder stat only. |
| Multi-tenant Campus | **Not built** | No `Campus` model; `CAMPUS_ADMIN` is a role label only, sharing Super Admin's UI. |
| Mobile App | **Not built** | Proposal explicitly scoped this as future work; still future work. |

---

## 4. Reconciliation Against the Original Proposal's Technology Stack

The original proposal suggested a stack to be finalized based on "the institution's existing infrastructure and in-house technical expertise." Here's what was actually built and why it still satisfies the proposal's intent:

| Layer | Proposed | Actually Built | Rationale |
|---|---|---|---|
| Frontend | React.js / Angular | **Next.js 16 (React 19)** | Satisfies "React.js" directly — Next.js is the standard production framework built on React, adding server rendering and routing the proposal's stack table didn't itemize separately. |
| Backend | Laravel / ASP.NET Core / Node.js | **Next.js Server Actions + Route Handlers (Node.js)** | Satisfies "Node.js" — using one framework for both frontend and backend (rather than a separate API server) removed an entire integration layer and its failure modes, at the cost of being tied to the JS/TS ecosystem end-to-end. |
| Database | MySQL / PostgreSQL | **PostgreSQL (via Prisma 7 ORM)** | Directly matches the proposed PostgreSQL option. |
| Authentication | OAuth 2.0 / JWT | **Auth.js v5 (JWT sessions + Google OAuth 2.0)** | Satisfies both listed options in one library; Credentials (email/password) login uses bcrypt-hashed passwords, Google sign-in uses real OAuth 2.0. |
| Mobile | Flutter | **Not built** | Consistent with the proposal's own framing of mobile as "future implementation" — no deviation, just not yet reached. |
| Cloud | AWS / Azure / Google Cloud | **Not yet decided — see §6** | This is the main open decision left before hosting; any of the three remains a valid choice. |
| Video | Zoom API / Microsoft Teams API | **Manually-pasted link/ID fields** | The proposal's "Zoom API"/"Teams API" implies live scheduling/joining through a real API integration; what exists is a lecturer-pasted URL field. This is the single largest gap between the stack table and reality — flagged for a scoping decision, not a silent shortfall. |

**Bottom line:** the core stack (React-based frontend, Node.js backend, PostgreSQL, OAuth/JWT auth) matches the proposal's intent even though the specific framework names differ. The one genuine, worth-discussing deviation is video conferencing — real Zoom/Meet API integration was never built, only a manual link field.

---

## 5. Known Gaps to Disclose Before Go-Live

- **Payment gateway is a labeled sandbox mock** — no real transaction processor (PayHere, Stripe, etc.) is wired in. Going live with real tuition payments requires integrating one.
- **SMS and WhatsApp notifications are stubs** — they log to the console only; no Twilio/WhatsApp Business API account is connected.
- **No multi-tenant "Campus" entity** — if the institution ever needs to run more than one physical campus with separate data, this needs to be designed and built; today `CAMPUS_ADMIN` is functionally identical to `SUPER_ADMIN`.
- **No push notifications** — only email + in-app notification bell exist.
- **Payroll is not implemented** — HR's "Payroll sync" stat is a placeholder.
- **Library Officer and Marketing Officer dashboards are largely placeholder** — Library's dashboard has no real data behind any stat; Marketing has 2 of 4 stats unbuilt.
- **A real, reproducing build-blocking bug exists today**: the Academic Director dashboard (`/academic`) currently fails `npm run build` under load, due to too many simultaneous database queries exhausting the connection pool. **This must be fixed before a production build will succeed** — it is a concrete, scoped bug, not a design gap.

---

## 6. Technical Architecture

```
                        ┌─────────────────────────────┐
                        │        Web Browser          │
                        │  (Student/Staff/Admin, etc.) │
                        └───────────────┬─────────────┘
                                         │ HTTPS
                                         ▼
                        ┌─────────────────────────────┐
                        │   Next.js 16 application     │
                        │  (single deployable service) │
                        │                              │
                        │  • React Server Components   │
                        │    render each role dashboard │
                        │  • Server Actions handle all  │
                        │    writes (forms, approvals)  │
                        │  • Auth.js issues/reads JWT    │
                        │    session cookies             │
                        └───┬───────────┬───────────┬───┘
                            │           │           │
                 ┌──────────┘           │           └──────────┐
                 ▼                      ▼                      ▼
        ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
        │   PostgreSQL     │   │    Cloudinary     │   │      Resend       │
        │  (via Prisma 7)  │   │  (file/image      │   │  (transactional   │
        │  all application │   │   storage —       │   │   email)          │
        │  data            │   │   optional in dev) │   │  (optional in dev)│
        └─────────────────┘   └──────────────────┘   └──────────────────┘
```

Key architectural facts (verified from the code, not assumed):

- **No separate backend/API server** — the Next.js app itself is the backend. All database access goes through Prisma from Server Components and Server Actions; there is no REST/GraphQL API surface for the frontend to call.
- **Role protection is enforced per-role, in code, not at the network edge.** Every role's `layout.tsx` calls a shared `requireRole()` function that re-checks the user's `isActive` flag and role directly against the database on every request (not just trusting the JWT), then redirects to `/login` or `/unauthorized` if the check fails. There is no `proxy.ts`/middleware doing this at the edge — it's deliberate, defense-in-depth at the page level.
- **Sessions are JWT-based** (Auth.js, `session: { strategy: "jwt" }`), stored in an HTTP-only cookie. There is no server-side session store/database table for sessions.
- **Passwords are hashed with bcrypt** (`bcryptjs`), never stored in plaintext.
- **File uploads** (avatars, payment proof, content attachments) go to Cloudinary when configured; if Cloudinary env vars are blank, uploads no-op in development.
- **Email** is sent via Resend when `RESEND_API_KEY` is set; otherwise a console-log adapter stands in so development doesn't require real credentials.

---

## 7. What You Need Before Hosting: API Keys, Accounts & Environment Variables

Below is every environment variable the running application actually reads, where to obtain it, and whether it's required for a real production launch.

| Variable | Required for prod? | Where to get it | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | Your chosen managed Postgres provider (see §8) — a connection string they give you after creating a database | The single database backing the entire application |
| `AUTH_SECRET` | **Yes** | Generate locally with `npx auth secret` (or any 32+ byte random string) — never reuse the dev placeholder | Signs/encrypts session JWTs — treat like a password |
| `AUTH_URL` | **Yes** | Your production domain, e.g. `https://campus.cims.edu` | Auth.js needs to know its own public URL for callbacks |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional (only if "Sign in with Google" should work) | [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials) — create an OAuth 2.0 Client ID, add `https://<your-domain>/api/auth/callback/google` as an authorized redirect URI | Enables the Google sign-in button |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | **Yes**, if you want file uploads (avatars, payment proof images, content attachments) to actually work in production | Free Cloudinary account at cloudinary.com → Dashboard shows all three values | Real file/image storage |
| `STORAGE_PROVIDER` | Currently unused by the code (dead variable) | — | Documented but not read anywhere — safe to remove or should be wired up; flagging so it isn't mistaken for a working toggle |
| `RESEND_API_KEY` | **Yes**, if real emails (offer letters, password resets, notifications) should send | Free/paid account at resend.com → API Keys | Real transactional email delivery |
| `EMAIL_FROM` | Yes, alongside Resend | Must be an email address on a domain you've verified with Resend | The "From" address on all system emails |

**Not yet needed (because the features aren't built), but to budget for later:**
- A real payment gateway account (e.g. PayHere, Stripe) once the mock checkout is replaced.
- A Twilio (or similar) account for real SMS.
- A WhatsApp Business API provider for real WhatsApp messages.

---

## 8. Hosting & Deployment Guide

### Step 1 — Choose a host
Because this is a standard Next.js application with no unusual runtime requirements, any of these work; pick based on budget/familiarity:
- **Vercel** (simplest — built by the Next.js team, zero-config deploys from a Git push, free tier available). Recommended if this is the first production deployment.
- **AWS / Azure / Google Cloud** (matches the original proposal's suggested cloud layer) — deploy as a containerized Node.js service (e.g. AWS App Runner, Azure App Service, Google Cloud Run).
- Any VPS running Node.js 20+ behind a reverse proxy (Nginx) — more manual setup, more control.

### Step 2 — Provision a real PostgreSQL database
The local `npx prisma dev` database used throughout development is a throwaway instance — **it cannot be used in production.** Provision a real managed Postgres instance from a provider such as Neon, Supabase, or your cloud provider's managed Postgres (AWS RDS, Azure Database for PostgreSQL, etc.), and set `DATABASE_URL` to the connection string it gives you.

### Step 3 — Run database migrations
```
npx prisma migrate deploy
```
(Not `db push` — `migrate deploy` is the production-safe command that applies versioned migrations without needing a shadow database.)

### Step 4 — Set all environment variables from §7
On your chosen host's dashboard (Vercel Project Settings → Environment Variables, or the equivalent), not committed to the repo.

### Step 5 — Fix the known build-blocking bug
Run `npm run build` locally against a real (or realistic) database first and confirm it completes — do not deploy until it does. (See §5 — the `/academic` connection-pool issue must be resolved first.)

### Step 6 — Deploy
- Vercel: connect the GitHub repo, it builds and deploys automatically on push to `main`.
- Container-based hosts: `npm run build` then `npm run start`, packaged into your deployment pipeline.

### Step 7 — Point your domain at it
1. Buy/own a domain (e.g. through Namecheap, GoDaddy, or your registrar of choice) — e.g. `cims.edu` or a subdomain like `campus.cims.edu`.
2. In your host's dashboard, add the custom domain — it will give you a CNAME or A record to add.
3. In your domain registrar's DNS settings, add that record.
4. Wait for DNS propagation (minutes to ~24 hours), then verify the host shows the domain as "Active"/"Verified."
5. SSL/HTTPS is automatic on Vercel and most managed hosts (Let's Encrypt certificates auto-issued and auto-renewed). On a self-managed VPS, you'd set this up yourself (e.g. via Certbot).
6. Update `AUTH_URL` to the final `https://` domain and redeploy — Auth.js's OAuth callback and cookie behavior depend on this being correct.

### Step 8 — Smoke test in production
Log in as each of the 11 roles, confirm the dashboard loads, submit one form per major module (e.g. one assignment submission, one payment upload, one announcement) to confirm the database write path works end-to-end against the real production database.

---

## 9. Security Posture — What's Implemented vs. What the Proposal Asked For

| Proposal's Security Feature | Status |
|---|---|
| Role-Based Access Control | **Implemented** — every role-scoped page re-validates role + active status against the database on every request. |
| SSL Encryption | **Implemented at the hosting layer** — automatic on Vercel/most managed hosts once a custom domain is added (see §8); nothing the app itself needs to configure. |
| Password hashing | **Implemented** — bcrypt, never plaintext. |
| Multi-Factor Authentication | **Not implemented.** Login is email/password or Google OAuth only. |
| Password Policies (complexity/rotation) | **Partially implemented** — minimum 8 characters is enforced at signup; no complexity rules (uppercase/number/symbol) and no forced rotation exist. |
| Daily Backup | **Not implemented by the app** — this becomes the responsibility of whichever managed Postgres provider you choose (most offer automatic daily backups/point-in-time-recovery as a plan feature — confirm this is enabled). |
| Audit Trail / Activity Logs | **Not implemented** — no dedicated audit-log table exists; some domain models (e.g. notification log) incidentally record who/when, but there's no general-purpose activity log. |
| GDPR Compliance | **Not implemented** — no data export/deletion self-service tooling exists. |
| Rate limiting on login | **Not implemented** — no lockout after repeated failed attempts. |
| Security headers (CSP, HSTS, etc.) | **Not explicitly configured** — relies on host defaults; recommend adding explicit headers before launch if handling sensitive student/financial data. |

**Recommendation before go-live:** at minimum, add login rate-limiting and confirm your database provider's backup plan is active — these are the two gaps most likely to cause real harm (account brute-forcing, unrecoverable data loss) if skipped, versus the others which are lower-urgency hardening.

---

## 10. Summary

CIMS Campus is substantially complete relative to the original proposal — all core academic workflows (admissions through grading through transcripts/certificates) are real and functioning across all 11 roles. What remains before a full production launch is: (1) fixing one concrete build-blocking bug, (2) deciding on and integrating a real payment processor, (3) provisioning real production infrastructure (database, domain, API keys) per §7–8, and (4) closing the security hardening gaps in §9 appropriate to how sensitive the data being hosted is. Everything explicitly scoped as "future implementation" in the original proposal (mobile app, real SMS/WhatsApp, multi-campus) remains future work, consistent with that original scoping — not a shortfall against what was promised for this phase.
