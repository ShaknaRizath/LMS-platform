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
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 24,
  },
  date: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  programName: {
    fontWeight: 700,
    color: "#111827",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 48,
  },
  footerCol: {
    flexDirection: "column",
  },
  footerLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 2,
  },
  footerValue: {
    fontSize: 10,
    color: "#374151",
  },
});

export type OfferLetterData = {
  applicantName: string;
  programName: string;
  admissionDate: Date;
  referenceCode: string;
};

export function OfferLetterDocument(data: OfferLetterData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.institution}>CIMS Campus</Text>
        <Text style={styles.title}>Offer of Admission</Text>
        <Text style={styles.date}>{data.admissionDate.toLocaleDateString()}</Text>

        <Text style={styles.paragraph}>Dear {data.applicantName},</Text>
        <Text style={styles.paragraph}>
          Congratulations! We are pleased to offer you admission to{" "}
          <Text style={styles.programName}>{data.programName}</Text> at CIMS Campus. This offer
          is made on the basis of the application you submitted, and we look forward to
          welcoming you to the institution.
        </Text>
        <Text style={styles.paragraph}>
          An account has been created for you to access the student portal. Check your email for
          a separate link to set your password and get started.
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.footerCol}>
            <Text style={styles.footerValue}>{data.admissionDate.toLocaleDateString()}</Text>
            <Text style={styles.footerLabel}>Date issued</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerValue}>{data.referenceCode}</Text>
            <Text style={styles.footerLabel}>Application reference</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
