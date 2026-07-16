import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { AcademicRecord } from "@/lib/grades/gpa";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  institution: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
  },
  studentBlock: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  studentName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 10,
    color: "#6b7280",
  },
  semesterBlock: {
    marginBottom: 14,
  },
  semesterTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2a78d6",
    marginBottom: 6,
  },
  table: {
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 3,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 3,
    marginBottom: 2,
  },
  colCode: { width: "16%", fontSize: 9 },
  colTitle: { width: "44%", fontSize: 9 },
  colCredits: { width: "13%", fontSize: 9, textAlign: "right" },
  colPercentage: { width: "13%", fontSize: 9, textAlign: "right" },
  colLetter: { width: "14%", fontSize: 9, textAlign: "right" },
  headerText: { fontSize: 9, fontWeight: 700, color: "#374151" },
  semesterGpa: {
    fontSize: 10,
    fontWeight: 700,
    color: "#374151",
    textAlign: "right",
    marginTop: 4,
  },
  cumulativeBlock: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#111827",
  },
  cumulativeGpa: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    textAlign: "right",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
  },
  footerCol: {
    flexDirection: "column",
  },
  footerLabel: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  footerValue: {
    fontSize: 9,
    color: "#374151",
  },
});

export type TranscriptData = {
  studentName: string;
  registrationNumber: string;
  programName: string;
  record: AcademicRecord;
  issuedAt: Date;
  verificationCode: string;
  issuedByName: string;
};

export function TranscriptDocument(data: TranscriptData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.institution}>CIMS Campus</Text>
        <Text style={styles.title}>Official Academic Transcript</Text>

        <View style={styles.studentBlock}>
          <Text style={styles.studentName}>{data.studentName}</Text>
          <Text style={styles.studentMeta}>
            Registration No. {data.registrationNumber} · {data.programName}
          </Text>
        </View>

        {data.record.semesters.map((semester) => (
          <View key={semester.semesterId} style={styles.semesterBlock} wrap={false}>
            <Text style={styles.semesterTitle}>
              {semester.academicYearName} — {semester.semesterName}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.colCode, styles.headerText]}>Code</Text>
                <Text style={[styles.colTitle, styles.headerText]}>Module</Text>
                <Text style={[styles.colCredits, styles.headerText]}>Credits</Text>
                <Text style={[styles.colPercentage, styles.headerText]}>%</Text>
                <Text style={[styles.colLetter, styles.headerText]}>Grade</Text>
              </View>
              {semester.modules.map((module_) => (
                <View key={module_.moduleId} style={styles.tableRow}>
                  <Text style={styles.colCode}>{module_.code}</Text>
                  <Text style={styles.colTitle}>{module_.title}</Text>
                  <Text style={styles.colCredits}>{module_.credits ?? "—"}</Text>
                  <Text style={styles.colPercentage}>
                    {module_.percentage !== null ? Math.round(module_.percentage) : "—"}
                  </Text>
                  <Text style={styles.colLetter}>{module_.letter ?? "—"}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.semesterGpa}>
              Semester GPA: {semester.semesterGpa !== null ? semester.semesterGpa.toFixed(2) : "—"}
            </Text>
          </View>
        ))}

        <View style={styles.cumulativeBlock}>
          <Text style={styles.cumulativeGpa}>
            Cumulative GPA: {data.record.cumulativeGpa !== null ? data.record.cumulativeGpa.toFixed(2) : "—"}
          </Text>
        </View>

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
        </View>
      </Page>
    </Document>
  );
}
