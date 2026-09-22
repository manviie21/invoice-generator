import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  Svg,
  Path,
} from "@react-pdf/renderer";
import type { Invoice, Client, SenderDetails } from "@/lib/types";

// 1. Register Cormorant Garamond (Editorial Luxury Display Font from manviie21.github.io)
Font.register({
  family: "Cormorant Garamond",
  fonts: [
    {
      src: path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: "normal",
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "CormorantGaramond-BoldItalic.ttf"),
      fontStyle: "italic",
      fontWeight: "bold",
    },
  ],
});

// 2. Register DM Sans (Clean UI / Body Font from manviie21.github.io)
Font.register({
  family: "DM Sans",
  fonts: [
    {
      src: path.join(process.cwd(), "assets", "fonts", "DMSans-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "DMSans-Medium.ttf"),
      fontWeight: 500,
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "DMSans-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

// 3. Register Noto Sans (Indian Rupee ₹ / U+20B9 Glyph Fallback)
Font.register({
  family: "Noto Sans",
  fonts: [
    {
      src: path.join(process.cwd(), "assets", "fonts", "NotoSans-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: path.join(process.cwd(), "assets", "fonts", "NotoSans-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

// Reusable 4-pointed sparkle star matching Manvi's brand icon "✦"
const BrandStar = ({ size = 9, color = "#e86c54" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 0 C12 6.627 17.373 12 24 12 C17.373 12 12 17.373 12 24 C12 17.373 6.627 12 0 12 C6.627 12 12 6.627 12 0 Z"
      fill={color}
    />
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontSize: 8.5,
    fontFamily: "DM Sans",
    color: "#140f12",
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
  },
  // Warm, editorial header block in Dark Espresso (#140f12) with Coral (#e86c54) bottom accent
  headerBar: {
    backgroundColor: "#140f12",
    color: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 3,
    marginBottom: 20,
    borderBottomWidth: 2.5,
    borderBottomColor: "#e86c54",
  },
  headerLeft: {
    flexDirection: "column",
    justifyContent: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#ffffff",
    marginRight: 6,
    lineHeight: 1.15,
  },
  headerSubtitle: {
    fontSize: 7,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#f2c4bb",
    lineHeight: 1.2,
  },
  headerRight: {
    textAlign: "right",
    alignItems: "flex-end",
  },
  headerInvoiceNo: {
    fontSize: 10,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: "#ffffff",
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 8,
    fontFamily: "DM Sans",
    color: "#fde9dc",
  },
  // Two columns FROM / BILL TO
  partiesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 24,
  },
  partyColumn: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8.5,
    fontFamily: "Cormorant Garamond",
    fontWeight: "bold",
    color: "#e86c54",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 12,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#140f12",
    marginBottom: 3,
  },
  partyText: {
    fontSize: 8.5,
    fontFamily: "DM Sans",
    color: "#524b4f",
    lineHeight: 1.35,
    marginBottom: 2,
  },
  taxInfo: {
    marginTop: 4,
  },
  taxText: {
    fontSize: 8,
    fontFamily: "DM Sans",
    color: "#140f12",
    marginBottom: 1.5,
  },
  // Campaign Reference block if present
  campaignBox: {
    backgroundColor: "#faf6f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(20, 15, 18, 0.08)",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  campaignLabel: {
    fontSize: 7.5,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#e86c54",
  },
  campaignTitle: {
    fontSize: 9.5,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#140f12",
  },
  // Deliverables Table
  table: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 15, 18, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#140f12",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e86c54",
    color: "#ffffff",
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(20, 15, 18, 0.06)",
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#faf6f0",
  },
  colNo: {
    width: "8%",
    textAlign: "center",
    fontFamily: "DM Sans",
    fontSize: 8,
    color: "#7a7276",
  },
  colDeliverable: {
    width: "70%",
    paddingLeft: 6,
    paddingRight: 6,
    fontFamily: "DM Sans",
    fontSize: 8.5,
    color: "#140f12",
  },
  colAmount: {
    width: "22%",
    textAlign: "right",
    fontFamily: "DM Sans",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#140f12",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#faf6f0",
    borderTopWidth: 1.5,
    borderTopColor: "#140f12",
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  totalLabel: {
    width: "78%",
    textAlign: "right",
    fontFamily: "Cormorant Garamond",
    fontWeight: "bold",
    fontSize: 11,
    color: "#140f12",
    paddingRight: 12,
    letterSpacing: 1.2,
  },
  totalValue: {
    width: "22%",
    textAlign: "right",
    fontFamily: "DM Sans",
    fontWeight: "bold",
    fontSize: 10.5,
    color: "#e86c54",
  },
  // Amount in Words line
  wordsLine: {
    flexDirection: "row",
    backgroundColor: "#faf6f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(20, 15, 18, 0.06)",
    marginBottom: 20,
    alignItems: "center",
  },
  wordsLabel: {
    fontSize: 7.5,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#e86c54",
    marginRight: 6,
  },
  wordsValue: {
    fontSize: 9.5,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#140f12",
  },
  // Payment Details Table
  paymentTable: {
    borderWidth: 1,
    borderColor: "rgba(20, 15, 18, 0.1)",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  paymentHeader: {
    backgroundColor: "#140f12",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e86c54",
  },
  paymentHeaderText: {
    fontFamily: "Cormorant Garamond",
    fontWeight: "bold",
    fontSize: 9.5,
    letterSpacing: 1,
    color: "#ffffff",
    marginLeft: 4,
  },
  paymentRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(20, 15, 18, 0.06)",
    paddingVertical: 5.5,
    paddingHorizontal: 10,
  },
  paymentLabel: {
    width: "35%",
    fontSize: 8,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    color: "#524b4f",
  },
  paymentVal: {
    width: "65%",
    fontSize: 8,
    fontFamily: "DM Sans",
    color: "#140f12",
  },
  // Authorised Signatory block (bottom right)
  signatoryContainer: {
    alignSelf: "flex-end",
    alignItems: "center",
    width: 150,
    marginTop: 6,
  },
  signatoryTitleTop: {
    fontSize: 7,
    fontFamily: "DM Sans",
    color: "#7a7276",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  signatureBox: {
    height: 48,
    width: 135,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  signatureImg: {
    maxHeight: 46,
    maxWidth: 130,
    objectFit: "contain",
  },
  signatoryNameBottom: {
    fontSize: 10,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#140f12",
    borderTopWidth: 1,
    borderTopColor: "rgba(20, 15, 18, 0.15)",
    paddingTop: 3,
    textAlign: "center",
    width: "100%",
  },
  // Optional Notes
  notesBox: {
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(20, 15, 18, 0.08)",
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    color: "#e86c54",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8,
    fontFamily: "DM Sans",
    color: "#524b4f",
    lineHeight: 1.3,
  },
});

interface InvoicePdfProps {
  invoice: Invoice;
  sender: SenderDetails;
  client: Client;
}

export const InvoicePdfDocument: React.FC<InvoicePdfProps> = ({
  invoice,
  sender,
  client,
}) => {
  // Format currency with ₹ symbol
  const formatAmount = (num: number) => {
    return (
      "₹ " +
      (Number(num) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    );
  };

  // Resolve client custom fields safely
  const clientCustomFields = (() => {
    if (!client?.customFields) return [];
    if (Array.isArray(client.customFields)) return client.customFields;
    if (typeof client.customFields === "string") {
      try {
        const parsed = JSON.parse(client.customFields);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Warm Editorial Header Bar with Coral Accent */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>INVOICE</Text>
              <BrandStar size={10} color="#e86c54" />
            </View>
            <Text style={styles.headerSubtitle}>
              Manvi Sharma Studio &bull; Creative Production
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerInvoiceNo}>
              {invoice.invoiceNumber || "INV-2026-001"}
            </Text>
            <Text style={styles.headerDate}>
              Date: {invoice.issueDate || "22 September 2026"}
            </Text>
          </View>
        </View>

        {/* FROM and BILL TO */}
        <View style={styles.partiesSection}>
          {/* FROM: Manvi Sharma */}
          <View style={styles.partyColumn}>
            <Text style={styles.partyLabel}>FROM</Text>
            <Text style={styles.partyName}>{sender?.name || "Manvi Sharma"}</Text>
            <Text style={styles.partyText}>
              {sender?.address ||
                "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia"}
            </Text>
            {sender?.pan && (
              <View style={styles.taxInfo}>
                <Text style={styles.taxText}>
                  PAN: <Text style={{ fontFamily: "DM Sans" }}>{sender.pan}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* BILL TO: Client */}
          <View style={styles.partyColumn}>
            <Text style={styles.partyLabel}>BILL TO</Text>
            <Text style={styles.partyName}>{client?.name || "Client Name"}</Text>
            <Text style={styles.partyText}>{client?.address || "Client Address"}</Text>
            {(client?.gstin || client?.pan || clientCustomFields.length > 0) && (
              <View style={styles.taxInfo}>
                {client?.gstin ? (
                  <Text style={styles.taxText}>GSTIN: {client.gstin}</Text>
                ) : null}
                {client?.pan ? (
                  <Text style={styles.taxText}>PAN: {client.pan}</Text>
                ) : null}
                {clientCustomFields.map((cf, idx) => (
                  <Text key={idx} style={styles.taxText}>
                    {cf.label}: {cf.value}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Campaign single line if present */}
        {invoice.reference ? (
          <View style={styles.campaignBox}>
            <Text style={styles.campaignLabel}>Reference:</Text>
            <Text style={styles.campaignTitle}>{invoice.reference}</Text>
          </View>
        ) : null}

        {/* Deliverables Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colDeliverable}>Deliverable &amp; Services</Text>
            <Text style={styles.colAmount}>Amount (INR)</Text>
          </View>

          {invoice.items &&
            invoice.items.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <Text style={styles.colNo}>{idx + 1}</Text>
                <Text style={styles.colDeliverable}>{item.description}</Text>
                <Text style={styles.colAmount}>
                  {formatAmount(item.amount)}
                </Text>
              </View>
            ))}

          {/* TOTAL Row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>
              {formatAmount(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.wordsLine}>
          <Text style={styles.wordsLabel}>Amount in Words:</Text>
          <Text style={styles.wordsValue}>{invoice.amountInWords}</Text>
        </View>

        {/* Payment Details Table */}
        <View style={styles.paymentTable}>
          <View style={styles.paymentHeader}>
            <BrandStar size={8} color="#e86c54" />
            <Text style={styles.paymentHeaderText}>Payment Details</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account Name</Text>
            <Text style={styles.paymentVal}>
              {sender?.bankAccountName || "Manvi Sharma"}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account Number</Text>
            <Text style={styles.paymentVal}>
              {sender?.bankAccountNumber || "50100634081448"}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Bank Name</Text>
            <Text style={styles.paymentVal}>
              {sender?.bankName || "HDFC Bank"}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>IFSC Code</Text>
            <Text style={styles.paymentVal}>
              {sender?.ifsc || "HDFC0002674"}
            </Text>
          </View>
        </View>

        {/* Authorised Signatory Block (Bottom Right) */}
        <View style={styles.signatoryContainer}>
          <Text style={styles.signatoryTitleTop}>Authorised Signatory</Text>
          <View style={styles.signatureBox}>
            {sender?.signatureImageUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image
                src={sender.signatureImageUrl}
                style={styles.signatureImg}
              />
            ) : null}
          </View>
          <Text style={styles.signatoryNameBottom}>
            {sender?.name || "Manvi Sharma"}
          </Text>
        </View>

        {/* Optional Notes */}
        {invoice.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};
