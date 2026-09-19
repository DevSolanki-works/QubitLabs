# Supabase Authentication & Database Setup for QubitLabs

This document provides complete instructions for provisioning, configuring, and verifying **Supabase Authentication**, **Google OAuth**, and **PostgreSQL with Row Level Security (RLS)** in QubitLabs.

---

## 1. Quick Architecture Overview

* **Identity & Auth**: Supabase Auth with Email & Password, Google OAuth 2.0, Password Reset, and JWT session cookies.
* **Database**: Supabase PostgreSQL with 7 user-owned tables.
* **Row Level Security (RLS)**: Enforced across all tables so users can only access their own learning progress, XP, and quiz records.
* **Quantum Engine**: Unchanged. IBM Qiskit & AerSimulator continue executing in the FastAPI backend microservice.
* **AI Copilot**: Unchanged. Google Gemini 2.5 Flash continues answering physics queries grounded in verified Qiskit simulation statevectors.

---

## 2. Setting Up Supabase (Step-by-Step)

### Step 2.1: Create a Free Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose your organization and specify:
   - **Name**: `QubitLabs`
   - **Database Password**: (Generate a strong password and save it securely)
   - **Region**: Select a region close to your users (e.g. `South Asia (Mumbai)` or `East US`).
4. Click **Create new project** and wait ~2 minutes for provisioning to complete.

### Step 2.2: Apply Database Schema & RLS Policies
1. In your Supabase Project dashboard, open the **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/migrations/20260919000000_init_qubitlabs_schema.sql`](supabase/migrations/20260919000000_init_qubitlabs_schema.sql) and paste them into the editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. Verify that all 7 tables and RLS policies are created:
   - `public.profiles`
   - `public.user_progression`
   - `public.lesson_progress`
   - `public.challenge_progress`
   - `public.quiz_progress`
   - `public.user_achievements`
   - `public.learning_activity`

### Step 2.3: Retrieve API Credentials
1. Navigate to **Project Settings** (gear icon) $\rightarrow$ **API**.
2. Copy the following values:
   - **Project URL**: `https://<your-project-id>.supabase.co`
   - **Project API Keys** $\rightarrow$ `anon` / `public`: `eyJhbGciOi...`

> ⚠️ **CRITICAL SECURITY NOTE**: Never copy or expose the `service_role` (secret) key to frontend code or repository commits. Only use the `anon` / `public` key in the browser.

---

## 3. Environment Variables Configuration

### A. Local Development (`frontend/.env.local`)
Create or update `frontend/.env.local`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://itxinmcdjdbjeqzxhmck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eGlubWNkamRiamVxenhobWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTg4MjQsImV4cCI6MjEwNTM3NDgyNH0.43Q0PLhCCftJw2fcpKWRfApr81ox-NkQ0tVqWdQS7_c
```

### B. Production Deployment (Vercel)
Add the environment variables to your Vercel project:

```bash
# Add Supabase URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add Supabase Anon Key
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

Alternatively, add them directly in the [Vercel Dashboard](https://vercel.com/) $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.

---

## 4. Configuring Google OAuth 2.0 (Step-by-Step)

To enable **Continue with Google** sign-in:

### Step 4.1: Google Cloud Console Setup
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your existing project or create a new project called **QubitLabs**.
3. Go to **APIs & Services** $\rightarrow$ **OAuth consent screen**:
   - Choose User Type: **External**.
   - Fill in App name (`QubitLabs`), User support email, and Developer contact information.
   - Click **Save and Continue**.
4. Go to **APIs & Services** $\rightarrow$ **Credentials**:
   - Click **+ CREATE CREDENTIALS** $\rightarrow$ **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `QubitLabs Web Client`.
   - Under **Authorized redirect URIs**, click **+ ADD URI** and enter:
     ```text
     https://itxinmcdjdbjeqzxhmck.supabase.co/auth/v1/callback
     ```
   - Click **Create**.
   - Copy the **Client ID** and **Client Secret**.

### Step 4.2: Enable Google in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/itxinmcdjdbjeqzxhmck).
2. On the left sidebar, click **Authentication** $\rightarrow$ **Providers**.
3. Locate **Google** in the provider list and click on it:
   - Toggle **Enable Google provider** to **ON**.
   - Paste your Google **Client ID**.
   - Paste your Google **Client Secret**.
   - Click **Save**.

### Step 4.3: Add Redirect URLs in Supabase
1. In Supabase Dashboard, go to **Authentication** $\rightarrow$ **URL Configuration**.
2. Set **Site URL** to:
   ```text
   http://localhost:3000
   ```
   *(or `https://qubitlabs-ai.vercel.app` in production)*
3. Under **Redirect URLs**, click **Add URL** and add:
   - `http://localhost:3000/auth/callback`
   - `https://qubitlabs-ai.vercel.app/auth/callback`
4. Click **Save**.

---

## 5. Multi-User Verification & Testing Protocol

### Test Case 1: User Registration & Auto-Profile Generation
1. Navigate to `http://localhost:3000/auth/signup`.
2. Register as **User A**:
   - **Display Name**: `Alice Feynman`
   - **Email**: `alice@qubitlabs.test`
   - **Password**: `quantum123!`
3. Verify automatic redirect to `/dashboard`.
4. Observe that the top right shows the initials `AF` and display name `Alice Feynman`.
5. Complete Lesson 1 ("Qubit Basics") and run Challenge 1 in Quantum Lab.
6. Verify XP increases and achievements unlock.

### Test Case 2: Google Sign-In Verification
1. Click **Sign In** or **Sign Up**.
2. Click **Continue with Google**.
3. Choose your Google account and grant consent.
4. Verify you are seamlessly redirected back to `/dashboard` with your Google name and avatar populated.

### Test Case 3: Multi-User Data Isolation (RLS Verification)
1. Click the top-right User Menu and select **Sign Out**.
2. Register as **User B**:
   - **Display Name**: `Bob Bohr`
   - **Email**: `bob@qubitlabs.test`
   - **Password**: `superposition123!`
3. Verify that **Bob Bohr** starts with **0 XP**, **0 completed lessons**, and **0 achievements**. Bob cannot view or modify Alice's records.
4. Sign out and log back in as **User A** (`alice@qubitlabs.test`).
5. Confirm that Alice's XP, completed lessons, and achievements remain intact.

### Test Case 4: Offline / Graceful Fallback
1. If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set:
   - The platform gracefully falls back to local state.
   - The 3D landing page, Quantum Lab, Bloch sphere, Qiskit simulation, and Gemini Copilot function without any errors or crashes.
