import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken: authToken || undefined,
});

export const db = drizzle(client, { schema });

// Auto initialize tables if not present (useful for local development & seamless first run)
let initialized = false;

export async function ensureDatabase() {
  if (initialized) return;
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

    // Migration guard: ensure custom_fields exists if clients table was created previously
    try {
      await client.execute(`ALTER TABLE clients ADD COLUMN custom_fields TEXT;`);
    } catch {
      // column already exists
    }

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
    initialized = true;
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  }
}
