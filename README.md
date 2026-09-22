# Manviie Invoice

A private, luxury studio invoice and billing application custom-built for **Manvi Sharma**, designed to generate professional PDF invoices matching brand collaboration standards, manage client directory, and track campaign billing history. Styled with editorial luxury matching [Manvi's portfolio](https://manviie21.github.io/).

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Turso (libSQL) / SQLite** with **Drizzle ORM**, and **@react-pdf/renderer**.

---

## Key Features

- **Single Shared Access ID & Password**: No public sign-ups or user tables. Login credentials are controlled entirely via `ACCESS_ID` and `ACCESS_PASSWORD` environment variables.
- **Signed HTTP-Only Session**: Sessions persist via secure, signed JWT cookies (`jose`) and protected by Next.js edge middleware.
- **Matched PDF Invoice Template**:
  - Dark navy header bar with invoice number and date
  - Two-column **FROM** (with PAN) and **BILL TO** (with GSTIN, PAN, Email)
  - Optional project or campaign reference banner (e.g. `Campaign: DLF`)
  - Items table with row numbers, deliverables, optional qty/rate, and amount
  - Bold **TOTAL** row
  - Auto-generated **Amount in Words** (Indian Currency format: Lakhs, Crores, Rupees, Paise)
  - Payment Details block: Account Name, Account Number, Bank Name, IFSC, UPI ID
  - Authorised Signatory block with transparent digital signature image above typed name
- **Live Math & Word Generation**: Total amount and words calculate in real-time as you add rows.
- **Client Directory**: Save client profiles once; reuse across invoices.
- **Dashboard & Analytics**: Track Total Invoiced, Paid Amount, Pending Amount, and filter by status (*Draft*, *Sent*, *Paid*).
- **Embedded PDF Preview**: Inspect generated PDFs in-browser before downloading.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via `@libsql/client` + Drizzle ORM (Supports local `file:local.db` and Turso) |
| PDF Engine | `@react-pdf/renderer` |
| Auth & Sessions | `jose` (Signed JWT HTTP-only cookie) + Next.js Middleware |

---

## Local Development Setup

### 1. Install Dependencies
```bash
cd invoice-generator
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default credentials in `.env.local`:
- **ACCESS_ID**: `admin`
- **ACCESS_PASSWORD**: `admin123`
- **SESSION_SECRET**: Set to any 32+ character random string
- **TURSO_DATABASE_URL**: `file:local.db` (zero-setup local SQLite file)

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## First-Time Configuration Walkthrough

1. Go to `http://localhost:3000/login` and log in with your Access ID and Password.
2. Navigate to **Settings** (`/settings`):
   - Enter your Business / Personal Name and full address.
   - Fill in your Bank Account Name, Bank Name, Account Number, IFSC Code, and optional UPI ID.
   - Upload your transparent signature PNG (stored securely in the database).
   - Click **Save Settings**.
3. Go to **Clients** (`/clients`) and add your first client (with GSTIN/PAN).
4. Click **New Invoice** (`/invoices/new`):
   - Choose your client.
   - Add line items (amounts and words calculate automatically).
   - Click **Save & Generate PDF**.
5. Preview and click **Download PDF**!

---

## Deploying to Vercel with Turso

### 1. Create a Free Database on Turso
1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash` (or via [turso.tech](https://turso.tech)).
2. Create database:
   ```bash
   turso db create invoice-db
   turso db show invoice-db --url
   turso db tokens create invoice-db
   ```

### 2. Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `ACCESS_ID`: Your secret login ID (e.g. `partner-admin`)
   - `ACCESS_PASSWORD`: Your strong shared password
   - `SESSION_SECRET`: A cryptographically random 32+ byte string (e.g., generated with `openssl rand -base64 32`)
   - `TURSO_DATABASE_URL`: Your `libsql://...` URL from Turso
   - `TURSO_AUTH_TOKEN`: Your Turso auth token
4. Deploy! Share the URL and credentials with your collaborator.

---

## ⚠️ Security Notice: Local Placeholders vs Production Secrets

> [!CAUTION]
> **Never reuse the local development placeholders in production!**
>
> - The credentials in `.env.local` (`ACCESS_ID=admin`, `ACCESS_PASSWORD=admin123`) and the placeholder `SESSION_SECRET` are strictly for local development testing on your machine.
> - **Before deploying to Vercel**, you MUST set distinct, private values in the Vercel Environment Variables dashboard:
>   - **`ACCESS_ID`**: Choose a unique, non-obvious identifier.
>   - **`ACCESS_PASSWORD`**: Use a strong, high-entropy password known only to you and your authorized collaborator.
>   - **`SESSION_SECRET`**: Must be a brand new random string with at least 32 bytes (256 bits) of entropy.
> - `.env.local` and `local.db` are both explicitly listed in `.gitignore` and will never be committed to your Git repository. Keep them private at all times.

