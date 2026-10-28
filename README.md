# MSL AI Skills — gate modules MVP

Learner and grader app for the five gate modules in the *MSL AI Skills — Gate Modules Spec*:

| Gate | Rubric ID | What the learner does |
| --- | --- | --- |
| 1. Your MSL week, rebuilt with AI | D1.1 | Four units, a reference set of 10 synthetic abstracts, a build (task map + prompt cards) |
| 2. Keeping AI on the scientific side of the line | D3.1 | Four units, a red-flag drill on a seeded AI draft, a build |
| 3. Classify before you paste | D3.2 | Four units, a 12-snippet sorting drill (zero tolerance), a build |
| 4. When AI surfaces an adverse event | D3.3 | Four units, an inbox drill (missing any planted event fails), a build |
| 5. Graded practical assessment | D5.1 | Not a module: graders score every build on the seven-line rubric |

All products, people, trials and numbers in the content are invented. The teaching content is a **draft**
(`CONTENT_REVIEW_STATUS` in `src/lib/content/gates.ts`) and needs sign-off from medical-affairs compliance,
pharmacovigilance and privacy reviewers before any learner sees it.

## Run it

```bash
npm install
npm run dev
```

Without Supabase settings the app runs in **demo mode**: data goes to `.data/db.json` and you sign in as
"Demo Learner" or "Demo Grader". Delete `.data/` to start over.

```bash
npm test        # scoring and progress rules
npm run lint
npm run build
```

## Production (Supabase)

1. Create a Supabase project and run `supabase/migrations/0001_init.sql`.
2. Copy `.env.example` to `.env.local` and fill in the URL and anon key.
3. In Supabase Auth, add `<your site>/auth/callback` as a redirect URL.
4. Sign-ups get the learner role. Make a grader with the service key or SQL editor:
   `update profiles set role = 'grader' where id = '<user id>';`

Row-level security does the access control: learners read and write only their own records; graders read
submissions and the audit log and write grades; no one grades their own work; the audit log is append-only.

## How it fits together

- `src/lib/content/` — gate units, builds and the synthetic drill data (answer keys stay server-side)
- `src/lib/scoring.ts` — drill scoring (Gates 2–4); `src/lib/rubric.ts` — the rubric and pass rule (Gate 5)
- `src/lib/progress.ts` — unlocks, gate status, the one resubmission
- `src/lib/store/` — `Store` interface with a local JSON store (demo) and a Supabase store (production)
- `src/app/actions.ts` — every write: validated, role-checked, audited

Pass rules (`THRESHOLDS` and `RUBRIC_PASS_TOTAL`) are the spec's proposals; calibrate them in the pilot.

## Not built yet

SSO and LMS/SCORM export, the enterprise approved-tool list loader (Gate 3), grader double-marking
and calibration, the capstone, the certificate, and pre/post metrics reporting.
