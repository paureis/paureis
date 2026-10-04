# Alvaro "Pau" Reis

**AI engineer. I build multi-tenant products end to end, and I use AI agents to assist my development without lowering the bar.**

Broward County, Florida · open to full-time roles and selected freelance work

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alpaureis/)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:alpau.reis@gmail.com)
[![Certifications](https://img.shields.io/badge/Certifications-FF6B00?style=flat&logo=credly&logoColor=white)](https://www.credly.com/users/alpaureis)

<p>
  <img src="https://skillicons.dev/icons?i=ts,nextjs,react,tailwind,supabase,postgres,azure,aws,vercel,rust,tauri,py,cs,redis,vitest,githubactions&perline=16" alt="TypeScript, Next.js, React, Tailwind, Supabase, PostgreSQL, Azure, AWS, Vercel, Rust, Tauri, Python, C#, Redis, Vitest, GitHub Actions" />
</p>

Also in daily use: Claude (API and Claude Code), Codex, Playwright, pgTAP, mutation testing, Stripe, DuckDB, Ollama.

---

## What I'm working on now

*Updated October 2026.*

- **MiConsultorio**: clinic management for medical and dental practices in Venezuela. In production, pre-launch.
- **RefreshRadar**: monitoring for Power BI refreshes. Live at [refreshradar.com](https://refreshradar.com).
- **Talent Scout Pro**: a multi-tenant recruiting platform in production with two healthcare organizations.
- **[pau-skills](https://github.com/paureis/pau-skills)**: the Claude Code skills, hooks and scripts I use every day, packaged as a plugin marketplace so others can reap the benefits as well.
- **PauPortfolio**: my portfolio site, a closer look at my work and what I do off the clock. *Coming soon.*

---

## Featured work

Most of what I build lives in private repositories, so here is what's inside them. Open any project for its architecture diagram and engineering notes.

### MiConsultorio · clinic management

Scheduling, patient records with clinical history and odontogram, billing in two currencies, inventory, memberships, WhatsApp reminders, a patient portal and an audit trail, for small practices that today run on paper and chat messages. I am the sole engineer; a partner leads the commercial side.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres 17, Auth, Storage) · Vercel · Vitest · Playwright

<details>
<summary><b>Architecture and engineering notes</b></summary>

```mermaid
flowchart LR
  staff[Staff app] --> next[Next.js on Vercel]
  patient[Patient portal] --> next
  operator[Operator console] --> next
  next -->|user session, never a service key| db[(Postgres with row-level security)]
  db --> audit[Audit triggers]
  cron[Scheduled job] --> queue[Message queue] --> wa[WhatsApp Cloud API]
  next --> pdf[Branded PDFs]
  subgraph Environments
    stg[Staging: seeded] -.-> prod[Production: migrations only]
  end
```

- **Access rules live in the database.** Row-level security decides which rows each role sees, the server decides modules and amounts, and the client only renders. Every new rule ships with a test that signs in as each role.
- **Two-factor is enforced in the database too**, not only in the UI, with a guided setup that always ends in backup codes.
- **261 end-to-end tests run from a freshly seeded database** on every pull request, next to unit and row-level-security suites. A flaky test is treated as a defect.
- **Staging and production are separate projects**; migrations are additive and reach staging before a merge.

</details>

### RefreshRadar · Power BI refresh monitoring

Catches failed, missed and silently disabled dataset refreshes, explains the error in plain language and alerts by email or webhook. Self-serve, with Stripe subscriptions. Live at [refreshradar.com](https://refreshradar.com).

**Stack:** Next.js 16 · TypeScript · Supabase Postgres (forced RLS) · Microsoft Entra ID · Azure Key Vault · Stripe · Resend · Vercel Cron · Claude through Vercel AI Gateway

<details>
<summary><b>Architecture and engineering notes</b></summary>

```mermaid
flowchart LR
  cron[Cron every 15 min] --> poll[Poller with single-run lease]
  poll -->|read-only, per-tenant token| pbi[Power BI REST]
  kv[Azure Key Vault] -.->|signs certificate assertion| poll
  poll --> detect[Detectors: failed, missing, schedule disabled]
  detect --> classify{Error classifier}
  classify -->|1| catalog[Deterministic catalog]
  classify -->|2| cache[Cache]
  classify -->|3, only if both miss| llm[Claude Haiku, Sonnet on low confidence]
  detect --> outbox[Alert outbox] --> email[Email]
  outbox --> hook[Signed webhook]
```

- **The LLM is the last resort.** A deterministic catalog answers first, then a cache; a model is called only when both miss, behind an interface so the whole suite runs with no network and no key.
- **No client secret anywhere.** Tenants are reached with a certificate assertion whose private key never leaves Key Vault.
- **The architecture document cannot go stale.** A test fails CI if the architecture manifest and the code disagree, in either direction.
- **About 1,700 unit, 300 integration and 129 database tests**, plus eight custom static gates (for example: privileged database imports only from one layer; the cron schedule in config must equal the constant in code).

</details>

### Talent Scout Pro · multi-tenant recruiting platform

A B2B SaaS used in production by two healthcare organizations. I am the founder and sole engineer. Details of the product are deliberately brief here; the engineering side is definitely not.

**Stack:** Next.js 16 · TypeScript · Azure App Service · Azure Functions · Storage Queues · serverless Azure SQL · Key Vault · Redis · Entra ID SSO · Stripe · Claude

<details>
<summary><b>Architecture and engineering notes</b></summary>

```mermaid
flowchart LR
  user[Recruiter] --> web[Web app]
  admin[Platform admin] --> console[Admin console]
  web --> sql[(Shared database)]
  web -->|enqueue| q1[Queue]
  q1 --> f1[Source] --> q2[Queue] --> f2[Evaluate with an LLM] --> q3[Queue] --> f3[Finalize and notify]
  f3 --> sql
  console -->|provision| prov[Infrastructure as code + migrations]
  prov --> tdb[(Dedicated database per tenant)]
  redis[Redis] -.->|distributed rate limits| f1
```

- **Tenant isolation with an upgrade path**: a shared database by default and a dedicated one per corporate customer, provisioned automatically from the admin console.
- **A queue-driven pipeline** so slow external calls and model evaluation scale independently, with distributed rate limiting to respect third-party quotas.
- **Cost is engineered, not assumed**: token cost is recorded per call, and a billing regression in a serverless database was diagnosed from the invoice and fixed with budget alerts added.
- **Separate staging and production pipelines**, about 590 tests, and a strict content security policy.

</details>

### Desktop log-analysis workbench · Rust

An offline-first desktop tool for database consultants: it ingests SQL Server diagnostic logs, stores them locally and drafts findings that a person approves before anything is delivered.

**Stack:** Tauri v2 · Rust · React · TypeScript · DuckDB · Ollama or Azure OpenAI

<details>
<summary><b>Architecture and engineering notes</b></summary>

```mermaid
flowchart LR
  files[Log files] --> parse[Parser registry] --> duck[(Encrypted DuckDB)]
  duck --> rules[Rules and sampling] --> ai{AI backend}
  ai --> local[Local model]
  ai --> cloud[Cloud model]
  ai --> find[Draft findings] --> human[Human approval] --> report[Report]
  human --> chain[Hash-chained audit log]
```

- **Analysis can run fully offline** with a local model; cloud models are an optional upgrade behind one interface.
- **A tamper-evident audit log** (hash chain with an integrity verifier) for everything delivered to a client.
- **Encrypted at rest with the key in the operating system keystore**, tested on real Windows runners in CI. About 310 tests.

</details>

### Open source

- **[pau-skills](https://github.com/paureis/pau-skills)** · the Claude Code skills, hooks and scripts behind the process described below, as an installable plugin marketplace: 14 skills and 4 hooks, each marked original or adapted, with about 100 tests.
- **[BurnRate](https://github.com/paureis/BurnRate)** · a local-first subscription tracker with no backend, no account and no API key. Share pages, the preview image and a live calendar feed are rendered purely from the URL. Includes a dependency-free QR encoder and about 530 tests. [Live demo](https://burnrate-bay.vercel.app).

---

Most of my commits are in private repositories, so the contribution graph is the best public trace of what I am working on day to day.
