import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import type { InvoiceItem, ClientCustomField } from "@/lib/types";

export const senderDetails = sqliteTable("sender_details", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  pan: text("pan"),
  bankAccountName: text("bank_account_name").notNull(),
  bankAccountNumber: text("bank_account_number").notNull(),
  ifsc: text("ifsc").notNull(),
  bankName: text("bank_name").notNull(),
  upiId: text("upi_id"),
  signatureImageUrl: text("signature_image_url"),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  email: text("email"),
  gstin: text("gstin"),
  pan: text("pan"),
  customFields: text("custom_fields", { mode: "json" }).$type<ClientCustomField[]>(),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  issueDate: text("issue_date").notNull(),
  reference: text("reference"),
  items: text("items", { mode: "json" }).$type<InvoiceItem[]>().notNull(),
  total: real("total").notNull(),
  amountInWords: text("amount_in_words").notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["draft", "sent", "paid"] })
    .default("draft")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
});
