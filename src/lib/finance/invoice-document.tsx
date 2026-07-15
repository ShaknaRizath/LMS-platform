import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  institution: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },
  footer: {
    marginTop: 40,
    fontSize: 9,
    color: "#9ca3af",
  },
});

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: Date;
  studentName: string;
  programName: string;
  semesterLabel: string;
  description: string;
  amount: number;
  currency: string;
  method: string;
  verifiedAt: Date;
};

export function InvoiceDocument(data: InvoiceData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.institution}>CIMS Campus</Text>
        <Text style={styles.title}>Invoice</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Invoice number</Text>
          <Text style={styles.value}>{data.invoiceNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Issued</Text>
          <Text style={styles.value}>{data.issuedAt.toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Billed to</Text>
          <Text style={styles.value}>{data.studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Program</Text>
          <Text style={styles.value}>{data.programName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Semester</Text>
          <Text style={styles.value}>{data.semesterLabel}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>{data.description}</Text>
          <Text style={styles.value}>
            {data.currency} {data.amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total paid</Text>
          <Text style={styles.totalValue}>
            {data.currency} {data.amount.toLocaleString()}
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Payment method</Text>
            <Text style={styles.value}>{data.method}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verified</Text>
            <Text style={styles.value}>{data.verifiedAt.toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.footer}>This invoice was generated automatically upon payment verification.</Text>
      </Page>
    </Document>
  );
}
