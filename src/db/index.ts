import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const unquoted = trimmed.slice(1, -1).trim();
    return unquoted.length > 0 ? unquoted : undefined;
  }
  return trimmed.length > 0 ? trimmed : undefined;
}

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const defaultUrl = isServerless ? "file:/tmp/local.db" : "file:local.db";

const rawUrl =
  cleanEnv(process.env.TURSO_DATABASE_URL) ||
  cleanEnv(process.env.invoice_TURSO_DATABASE_URL) ||
  cleanEnv(process.env.INVOICE_TURSO_DATABASE_URL) ||
  cleanEnv(process.env.TURSO_URL);

const rawAuthToken =
  cleanEnv(process.env.TURSO_AUTH_TOKEN) ||
  cleanEnv(process.env.invoice_TURSO_AUTH_TOKEN) ||
  cleanEnv(process.env.INVOICE_TURSO_AUTH_TOKEN) ||
  cleanEnv(process.env.TURSO_TOKEN);

const url = rawUrl || defaultUrl;
const authToken = rawAuthToken || undefined;

export const client = createClient({
  url,
  authToken: url.startsWith("file:") ? undefined : authToken,
});

export const db = drizzle(client, { schema });

// Auto initialize tables if not present
let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDatabase() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Create each table individually so a single failure doesn't block the rest
      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS sender_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            pan TEXT,
            bank_account_name TEXT NOT NULL,
            bank_account_number TEXT NOT NULL,
            ifsc TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            upi_id TEXT,
            signature_image_url TEXT,
            updated_at INTEGER
          );
        `);
      } catch (e) {
        console.warn("sender_details table init warning:", e);
      }

      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            email TEXT,
            gstin TEXT,
            pan TEXT,
            custom_fields TEXT,
            created_at INTEGER
          );
        `);
      } catch (e) {
        console.warn("clients table init warning:", e);
      }

      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT NOT NULL UNIQUE,
            client_id INTEGER NOT NULL REFERENCES clients(id),
            issue_date TEXT NOT NULL,
            reference TEXT,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            amount_in_words TEXT NOT NULL,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'draft',
            created_at INTEGER
          );
        `);
      } catch (e) {
        console.warn("invoices table init warning:", e);
      }

      // Migration guard: add custom_fields if clients table existed before
      try {
        await client.execute(`ALTER TABLE clients ADD COLUMN custom_fields TEXT;`);
      } catch {
        // column already exists — safe to ignore
      }

      // Migration guard: ensure signature_image_url and updated_at exist in sender_details
      try {
        await client.execute(`ALTER TABLE sender_details ADD COLUMN signature_image_url TEXT;`);
      } catch {
        // column already exists — safe to ignore
      }
      try {
        await client.execute(`ALTER TABLE sender_details ADD COLUMN updated_at INTEGER;`);
      } catch {
        // column already exists — safe to ignore
      }

      // Pre-seed default sender details if empty
      try {
        const existing = await client.execute(`SELECT id FROM sender_details LIMIT 1;`);
        if (existing.rows.length === 0) {
          await client.execute({
            sql: `INSERT INTO sender_details (name, address, pan, bank_account_name, bank_account_number, ifsc, bank_name, upi_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
              "Manvi Sharma",
              "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia",
              "OVFPS5255B",
              "Manvi Sharma",
              "50100634081448",
              "HDFC0002674",
              "HDFC Bank",
              "manvi@okhdfcbank",
              Date.now(),
            ],
          });
        }
      } catch (seedErr) {
        console.warn("Could not pre-seed sender details:", seedErr);
      }

      initialized = true;
    } catch (err) {
      console.error("Failed to initialize database:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}
