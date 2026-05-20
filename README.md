# Introduction

**Project Mission**: Develop a software to aid in medical simulation, mimicking medical standards, such as EPIC. 

---
<mark>Live Demo: [Yet to come]</mark>


# Run the EHR Simulator from scratch (macOS and Windows)

This app is a **Next.js 15** frontend in the `ehr-simulator` folder. It talks to **Supabase** (Postgres, Auth, and server actions that use the service role key). You can point it at a **hosted Supabase project** or run **Supabase locally** with Docker.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Get the Code](#2-get-the-code)
3. [Install Dependencies](#3-install-dependencies)
4. [Environment Variables](#4-environment-variables)
5. [Supabase Setup (Choose One Path)](#5-supabase-choose-one-path)
6. [Google Cloud OAuth Setup](#6-google-cloud-oauth-setup)
7. [Running the Development Server](#7-running-the-development-server)
8. [Production-like Run (Optional)](#8-production-like-run-optional)
9. [Platform-Specific Tips](#9-platform-specific-tips)
10. [Quick Troubleshooting](#10-quick-troubleshooting)
11. [Reference Files](#11-reference-files)

---

## 1. Prerequisites

### Both platforms

|Requirement|Notes|
|---|---|
|**Git**|To clone the repository.|
|**Node.js**|**20.x or newer** (LTS recommended). Check with `node -v`.|
|**npm**|Comes with Node. Check with `npm -v`.|
---


Install Node from [nodejs.org](https://nodejs.org/) or use a version manager ([nvm](https://github.com/nvm-sh/nvm) on Mac/Linux, [nvm-windows](https://github.com/coreybutler/nvm-windows) or [fnm](https://github.com/Schniz/fnm) on Windows).

### macOS extras (local Supabase only)

- **Docker Desktop for Mac** — required for `supabase start`. Install from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/), start Docker before running Supabase CLI commands.

### Windows extras (local Supabase only)

(Might not be needed.. I did not need this for development)
- **Docker Desktop for Windows** — use the **WSL 2** backend when prompted; it is the most reliable setup for the Supabase stack. Install from the same Docker link as above.
- If you develop inside **WSL**, install Node and Git inside that Linux distro and run all commands there; use Docker Desktop’s WSL integration.

---

## 2. Get the code

```bash
git clone <repository-url>
cd ehr-simulator-gv/ehr-simulator
```

The Next.js app root is **`ehr-simulator`** (the folder that contains `package.json` and `next.config.*`). All `npm` and Supabase commands below assume your shell’s current directory is this folder.

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Environment variables

1. Copy the example file:
    
    ```bash
    cp .env.example .env.local
    ```
    
    <mark>On Windows PowerShell:</mark>
    
    ```powershell
    copy .env.example .env.local
    ```

2. <mark>Fill in values (see the next section). The app expects at least:</mark>
    
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — used by the server client and login flow (often the same value as the **anon** key from the Supabase dashboard or CLI output).
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used by browser clients and some components.
    - `SUPABASE_SERVICE_ROLE_KEY` — **server-only**; never expose to the client. Required for server actions that talk to Supabase with elevated privileges.


3. <mark>Optional (local development only):</mark>
    
    - `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` — if your team uses this for Google OAuth wiring with Supabase.
    - **Dev admin bypass** (see `src/lib/devAdminEmails.ts`):
        - `DEV_ADMIN_BYPASS_ENABLED` or `NEXT_PUBLIC_DEV_ADMIN_BYPASS_ENABLED` — e.g. `true`
        - `DEV_ADMIN_EMAILS` or `NEXT_PUBLIC_DEV_ADMIN_EMAILS` — comma-separated allowlisted emails
---
## 5. Supabase: choose one path

### Path A — Hosted Supabase (typical for shared dev/staging)

1. Create or open a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. **Project Settings → API**: copy **Project URL**, **anon public** key, and **service_role** key into `.env.local`:
    - URL → `NEXT_PUBLIC_SUPABASE_URL`
    - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY` and usually also `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (unless your project uses a distinct publishable key)
    - service_role → `SUPABASE_SERVICE_ROLE_KEY`
3. Ensure **Auth → URL configuration** includes your local app URL, e.g. `http://localhost:3000`, and the auth callback path your app uses (e.g. `/auth/callback`).
4. **Google sign-in**: enable the Google provider under **Authentication → Providers** and follow Supabase’s Google OAuth setup (Google Cloud OAuth client, redirect URIs Supabase provides).

Apply any SQL migrations your team uses (for example from `supabase/migrations/`) via the Supabase SQL editor or linked CI, so your schema matches the app.

### Path B — Local Supabase (full stack on your machine)

1. Install **Docker Desktop** and ensure it is running.
    
2. The Supabase CLI is already a **devDependency** of this project. Use it via `npx`:
    
    ```bash
    npx supabase start
    ```
    
    The first run downloads images and can take several minutes.
    
3. After it starts, the CLI prints **API URL**, **anon key**, and **service_role key**. Put them in `.env.local` as in Path A. For a default local stack, the URL is often `http://127.0.0.1:54321` (see `supabase/config.toml` → `[api]` → `port`).
    
4. Migrations under `supabase/migrations/` are applied when the local DB starts/ resets according to your Supabase CLI version and project config. If you need a clean slate:
    
    ```bash
    npx supabase db reset
    ```
    
    (This reapplies migrations and seed data per `supabase/config.toml`.)
    
5. **Google OAuth on localhost** still requires configuring the provider in the **local** Supabase instance (or you rely on seeded users / bypass flows your team documents).
    

To stop local Supabase:

```bash
npx supabase stop
```

---
<mark>### Supabase Side Note:</mark>

> **Note:** When you set up Supabase, your login credentials are automatically set to **student**. Go to the **Supabase Studio Table Editor**, then go to the users table, you can search or query on email and change your role to any other role:(admin, faculty, etc.).

---
## 6. <mark>Google Cloud OAuth setup (required for Google sign-in)</mark>

Both hosted and local Supabase paths require a Google OAuth client.

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/) and create or select a project.
    
2. Open the side navigation and select **APIs & Services → Credentials**.
    
3. Click **+ Create Credentials** and choose **OAuth client ID**. Select **Web application** as the application type, then follow the prompts (you will need to configure the OAuth consent screen first if you haven't already).
    
4. Once created, copy your **Client ID** and **Client Secret**.

> **Note:** For hosted Supabase (Path A) skip steps 5 and 6, then enter the Client ID and Client Secret directly in the Supabase dashboard under **Authentication → Providers → Google** instead of `config.toml`.
    
5. Add the **Client Secret** to `.env.local` (local development only):
    
    ```
    SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your-client-secret-here
    ```
    
6. Add the **Client ID** to `supabase/config.toml` under the `[auth.external.google]` section:
    
    ```toml
    [auth.external.google]
    enabled = true
    client_id = "your-client-id-here"
    secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
    ```

---

## 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/). 

<mark>The dev script uses **Turbopack** (`next dev --turbopack`).</mark>

---

## 8. <mark>Production-like run (optional)</mark>

```bash
npm run build
npm run start
```

Use this to verify a production build locally.

---

## 9. Platform-specific tips

### macOS

- If `npx supabase start` fails, confirm Docker is running and ports **54320–54322** (and related ports in `supabase/config.toml`) are not used by another Postgres or Supabase project.

### Windows

- <mark>Prefer **Docker Desktop + WSL 2** for Supabase.</mark>
- If antivirus software blocks Docker networking, allow Docker Desktop or add exclusions as needed.
- Use the same terminal (PowerShell, cmd, or WSL) consistently for `npm` and `npx supabase` so paths and env files resolve the same way.
- Line endings: Git `core.autocrlf` can sometimes confuse scripts; if a shell script fails, check the file’s line endings (LF vs CRLF).

---

## 10. Quick troubleshooting

|Symptom|Things to check|
|---|---|
|Blank errors / missing Supabase|`.env.local` exists **in `ehr-simulator`**, variables spelled exactly as in `.env.example`, dev server restarted after edits.|
|Auth / Google redirect errors|Supabase **Site URL** and **Redirect URLs** include `http://localhost:3000` and your callback route; Google OAuth client matches Supabase’s redirect URI.|
|Local Supabase won’t start|Docker running; enough disk/RAM; ports free; try `npx supabase stop` then `npx supabase start`.|
|`npm run build` fails|Node version ≥ 20; run `npm install` again; read the full Next.js / TypeScript error output.|

---

## <mark>11. Reference files</mark>

- Example env: `.env.example`
- NPM scripts: `package.json`
- Local Supabase ports and DB version: `supabase/config.toml`
- Optional dev admin bypass: `src/lib/devAdminEmails.ts`


