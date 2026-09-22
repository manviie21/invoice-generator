import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/db";
import { invoices, clients, senderDetails } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { numberToWordsIndian } from "@/lib/numberToWords";
import type { InvoiceItem } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const inv = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (inv.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = inv[0];

    // Fetch client
    const clientRows = await db
      .select()
      .from(clients)
      .where(eq(clients.id, invoice.clientId))
      .limit(1);

    // Fetch sender
    const senderRows = await db.select().from(senderDetails).limit(1);

    return NextResponse.json({
      invoice,
      client: clientRows[0] || null,
      sender: senderRows[0] || null,
    });
  } catch (err: unknown) {
    console.error("Failed to get invoice:", err);
    return NextResponse.json(
      { error: "Failed to get invoice details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const currentInv = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (currentInv.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const existing = currentInv[0];
    const body = await request.json();

    // Check if this is a simple status change
    const isStatusOnlyChange =
      Object.keys(body).length === 1 && body.status !== undefined;

    if (isStatusOnlyChange) {
      const { status } = body;
      if (!["draft", "sent", "paid"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }

      await db
        .update(invoices)
        .set({ status })
        .where(eq(invoices.id, invoiceId));

      return NextResponse.json({ success: true, message: "Invoice status updated" });
    }

    // Otherwise, this is a full invoice edit. Only allowed if status is 'draft'!
    if (existing.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "This invoice cannot be edited because it has already been marked as " +
            existing.status +
            ". Only draft invoices can be edited.",
        },
        { status: 400 }
      );
    }

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

    // Check if invoice number is unique (excluding current invoice)
    const duplicate = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNumber, invoiceNumber.trim()),
          ne(invoices.id, invoiceId)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: `Invoice number "${invoiceNumber}" is already in use by another invoice.` },
        { status: 400 }
      );
    }

    // Parse and calculate items
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

    const updated = await db
      .update(invoices)
      .set({
        invoiceNumber: invoiceNumber.trim(),
        clientId: Number(clientId),
        issueDate,
        reference: reference ? reference.trim() : null,
        items: parsedItems,
        total,
        amountInWords,
        notes: notes ? notes.trim() : null,
        status: status as "draft" | "sent" | "paid",
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err: unknown) {
    console.error("Failed to update invoice:", err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    await db.delete(invoices).where(eq(invoices.id, invoiceId));

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (err: unknown) {
    console.error("Failed to delete invoice:", err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
