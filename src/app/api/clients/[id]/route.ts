import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/db";
import { clients, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ClientCustomField } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    console.error("Failed to fetch client:", err);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, address, email, gstin, pan, customFields } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "Client name and address are required" },
        { status: 400 }
      );
    }

    const sanitizedCustomFields: ClientCustomField[] | null = Array.isArray(customFields)
      ? customFields
          .filter((cf) => cf && typeof cf.label === "string" && cf.label.trim())
          .map((cf) => ({
            label: cf.label.trim(),
            value: (cf.value || "").toString().trim(),
          }))
      : null;

    const updated = await db
      .update(clients)
      .set({
        name: name.trim(),
        address: address.trim(),
        email: email ? email.trim() : null,
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        pan: pan ? pan.trim().toUpperCase() : null,
        customFields:
          sanitizedCustomFields && sanitizedCustomFields.length > 0
            ? sanitizedCustomFields
            : null,
      })
      .where(eq(clients.id, clientId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: unknown) {
    console.error("Failed to update client:", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabase();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Check if client has associated invoices
    const associatedInvoices = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .limit(1);

    if (associatedInvoices.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this client because there are existing invoices linked to it.",
        },
        { status: 400 }
      );
    }

    await db.delete(clients).where(eq(clients.id, clientId));

    return NextResponse.json({ success: true, message: "Client deleted successfully" });
  } catch (err: unknown) {
    console.error("Failed to delete client:", err);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
