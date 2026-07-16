import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  border: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#2a78d6",
    padding: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  institution: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 24,
  },
  presentedTo: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  studentName: {
    fontSize: 26,
    fontWeight: 700,
    color: "#2a78d6",
    marginBottom: 24,
  },
  body: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    marginTop: 4,
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
  },
  footerCol: {
    flexDirection: "column",
    alignItems: "center",
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
  qrCode: {
    width: 50,
    height: 50,
  },
});

export type CertificateData = {
  studentName: string;
  moduleTitle: string;
  moduleCode: string;
  programName: string;
  academicYearName: string;
  semesterName: string;
  issuedAt: Date;
  verificationCode: string;
  issuedByName: string;
  qrCodeDataUrl: string;
};

export function CertificateDocument(data: CertificateData) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.institution}>CIMS Campus</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
          <Text style={styles.studentName}>{data.studentName}</Text>
          <Text style={styles.body}>for successfully completing</Text>
          <Text style={styles.moduleTitle}>
            {data.moduleTitle} ({data.moduleCode})
          </Text>
          <Text style={styles.body}>{data.programName}</Text>
          <Text style={styles.body}>
            {data.academicYearName} · {data.semesterName}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.footerCol}>
              <Text style={styles.footerValue}>{data.issuedAt.toLocaleDateString()}</Text>
              <Text style={styles.footerLabel}>Date issued</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerValue}>{data.issuedByName}</Text>
              <Text style={styles.footerLabel}>Examination Unit</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerValue}>{data.verificationCode}</Text>
              <Text style={styles.footerLabel}>Verification code</Text>
            </View>
            <View style={styles.footerCol}>
              <Image src={data.qrCodeDataUrl} style={styles.qrCode} />
              <Text style={styles.footerLabel}>Scan to verify</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
