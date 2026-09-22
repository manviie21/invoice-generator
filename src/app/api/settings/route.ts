import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/db";
import { senderDetails } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_SENDER_DETAILS = {
  id: null,
  name: "Manvi Sharma",
  address: "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia",
  pan: "OVFPS5255B",
  bankAccountName: "Manvi Sharma",
  bankAccountNumber: "50100634081448",
  ifsc: "HDFC0002674",
  bankName: "HDFC Bank",
  upiId: "manvi@okhdfcbank",
  signatureImageUrl: "",
};

export async function GET() {
  try {
    await ensureDatabase();
    const rows = await db.select().from(senderDetails).limit(1);
    if (rows.length === 0) {
      return NextResponse.json(DEFAULT_SENDER_DETAILS);
    }
    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    console.warn("Could not query sender settings, falling back to defaults:", err);
    return NextResponse.json(DEFAULT_SENDER_DETAILS);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const body = await request.json();
    const {
      name,
      address,
      pan,
      bankAccountName,
      bankAccountNumber,
      ifsc,
      bankName,
      upiId,
      signatureImageUrl,
    } = body;

    if (!name || !address || !bankAccountName || !bankAccountNumber || !ifsc || !bankName) {
      return NextResponse.json(
        { error: "Name, address, bank name, account name, account number, and IFSC are required" },
        { status: 400 }
      );
    }

    const existing = await db.select().from(senderDetails).limit(1);

    if (existing.length > 0) {
      await db
        .update(senderDetails)
        .set({
          name,
          address,
          pan: pan || null,
          bankAccountName,
          bankAccountNumber,
          ifsc,
          bankName,
          upiId: upiId || null,
          signatureImageUrl: signatureImageUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(senderDetails.id, existing[0].id));
    } else {
      await db.insert(senderDetails).values({
        name,
        address,
        pan: pan || null,
        bankAccountName,
        bankAccountNumber,
        ifsc,
        bankName,
        upiId: upiId || null,
        signatureImageUrl: signatureImageUrl || null,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: unknown) {
    console.error("Failed to save settings:", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
