import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/db";
import { invoices, clients } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { numberToWordsIndian } from "@/lib/numberToWords";
import type { InvoiceItem } from "@/lib/types";

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);

    // If query requests the next suggested invoice number
    if (url.searchParams.get("nextNumber") === "true") {
      const allInvoices = await db.select().from(invoices);
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;

      let maxSeq = 0;
      for (const inv of allInvoices) {
        if (inv.invoiceNumber.startsWith(prefix)) {
          const numPart = parseInt(inv.invoiceNumber.replace(prefix, ""), 10);
          if (!isNaN(numPart) && numPart > maxSeq) {
            maxSeq = numPart;
          }
        }
      }
      const nextNum = `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
      return NextResponse.json({ nextInvoiceNumber: nextNum });
    }

    // Return invoices with client data
    const list = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        issueDate: invoices.issueDate,
        reference: invoices.reference,
        items: invoices.items,
        total: invoices.total,
        amountInWords: invoices.amountInWords,
        notes: invoices.notes,
        status: invoices.status,
        createdAt: invoices.createdAt,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.id));

    return NextResponse.json(list);
  } catch (err: unknown) {
    console.error("Failed to fetch invoices:", err);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const body = await request.json();
    const {
      invoiceNumber,
      clientId,
      issueDate,
      reference,
      items,
      notes,
      status = "draft",
    } = body;

    if (!invoiceNumber || !clientId || !issueDate || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields (invoiceNumber, clientId, issueDate, items)" },
        { status: 400 }
      );
    }

    // Check if invoice number is unique
    const existing = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Invoice number "${invoiceNumber}" already exists.` },
        { status: 400 }
      );
    }

    // Calculate total from items
    const parsedItems: InvoiceItem[] = items.map((it: InvoiceItem) => {
      const amount = Number(it.amount) || 0;
      return {
        description: it.description || "",
        qty: it.qty !== undefined && it.qty !== null && it.qty !== "" ? it.qty : null,
        rate: it.rate !== undefined && it.rate !== null && it.rate !== "" ? it.rate : null,
        amount,
      };
    });

    const total = parsedItems.reduce((sum, it) => sum + (it.amount || 0), 0);
    const amountInWords = numberToWordsIndian(total);

    const inserted = await db
      .insert(invoices)
      .values({
        invoiceNumber: invoiceNumber.trim(),
        clientId: Number(clientId),
        issueDate,
        reference: reference || null,
        items: parsedItems,
        total,
        amountInWords,
        notes: notes || null,
        status: status as "draft" | "sent" | "paid",
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create invoice:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
