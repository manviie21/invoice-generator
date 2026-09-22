import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/db";
import { clients } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDatabase();
    const list = await db.select().from(clients).orderBy(desc(clients.id));
    return NextResponse.json(list);
  } catch (err: unknown) {
    console.error("Failed to load clients:", err);
    return NextResponse.json(
      { error: "Failed to load clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const body = await request.json();
    const { name, address, email, gstin, pan, customFields } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "Client name and address are required" },
        { status: 400 }
      );
    }

    const sanitizedCustomFields = Array.isArray(customFields)
      ? customFields
          .filter((cf) => cf && typeof cf.label === "string" && cf.label.trim())
          .map((cf) => ({
            label: cf.label.trim(),
            value: (cf.value || "").toString().trim(),
          }))
      : null;

    const inserted = await db
      .insert(clients)
      .values({
        name: name.trim(),
        address: address.trim(),
        email: email ? email.trim() : null,
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        pan: pan ? pan.trim().toUpperCase() : null,
        customFields:
          sanitizedCustomFields && sanitizedCustomFields.length > 0
            ? sanitizedCustomFields
            : null,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create client:", err);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
