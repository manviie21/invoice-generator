import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { db, ensureDatabase } from "@/db";
import { invoices, clients, senderDetails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InvoicePdfDocument } from "@/lib/pdf/InvoicePdfDocument";
import type { InvoiceItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
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

    const inv = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (inv.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoiceData = inv[0];

    // Fetch client
    const clientRows = await db
      .select()
      .from(clients)
      .where(eq(clients.id, invoiceData.clientId))
      .limit(1);

    const client = clientRows[0] || {
      id: 0,
      name: "Client",
      address: "",
      email: null,
      gstin: null,
      pan: null,
    };

    // Fetch sender
    let sender: any = null;
    try {
      const senderRows = await db.select().from(senderDetails).limit(1);
      if (senderRows.length > 0) {
        sender = senderRows[0];
      }
    } catch (e) {
      console.warn("Could not load sender details for PDF, using defaults:", e);
    }

    if (!sender) {
      sender = {
        name: "Manvi Sharma",
        address: "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia",
        pan: "OVFPS5255B",
        bankAccountName: "Manvi Sharma",
        bankAccountNumber: "50100634081448",
        ifsc: "HDFC0002674",
        bankName: "HDFC Bank",
        upiId: "manvi@okhdfcbank",
        signatureImageUrl: null,
      };
    }

    // Parse items if string
    let parsedItems: InvoiceItem[] = [];
    if (typeof invoiceData.items === "string") {
      try {
        parsedItems = JSON.parse(invoiceData.items);
      } catch {
        parsedItems = [];
      }
    } else {
      parsedItems = invoiceData.items as InvoiceItem[];
    }

    const fullInvoice = {
      ...invoiceData,
      status: invoiceData.status as "draft" | "sent" | "paid",
      items: parsedItems,
    };

    // Check if user requested download attachment or inline view
    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "true";
    const disposition = isDownload ? "attachment" : "inline";

    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePdfDocument, {
        invoice: fullInvoice,
        sender,
        client,
      }) as any
    );

    const filename = `${invoiceData.invoiceNumber || `Invoice-${invoiceData.id}`}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    console.error("PDF generation failed:", err);
    const details = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to generate PDF invoice", details },
      { status: 500 }
    );
  }
}
