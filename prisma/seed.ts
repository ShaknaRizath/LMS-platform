import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "Passw0rd!";

async function main() {
  const passwordHash = await hashPassword(DEV_PASSWORD);

  // ---------- Programs ----------
  const cs = await prisma.program.upsert({
    where: { code: "BSC-CS" },
    update: {},
    create: { name: "BSc Computer Science", code: "BSC-CS", durationYears: 4 },
  });
  const bba = await prisma.program.upsert({
    where: { code: "BBA" },
    update: {},
    create: { name: "Bachelor of Business Administration", code: "BBA", durationYears: 3 },
  });

  // ---------- Users ----------
  const users = [
    { email: "superadmin@cims.edu", firstName: "Super", lastName: "Admin", role: "SUPER_ADMIN" as const },
    { email: "admin@cims.edu", firstName: "Amara", lastName: "Fernando", role: "ADMIN" as const },
    { email: "lecturer1@cims.edu", firstName: "Alice", lastName: "Perera", role: "LECTURER" as const },
    { email: "lecturer2@cims.edu", firstName: "Kasun", lastName: "Silva", role: "LECTURER" as const },
    { email: "finance@cims.edu", firstName: "Nadeesha", lastName: "Rathnayake", role: "FINANCE" as const },
    { email: "registrar@cims.edu", firstName: "Dilshan", lastName: "Jayasuriya", role: "REGISTRAR" as const },
    { email: "student1@cims.edu", firstName: "Sachini", lastName: "Perera", role: "STUDENT" as const, programId: cs.id },
    { email: "student2@cims.edu", firstName: "Nimal", lastName: "Bandara", role: "STUDENT" as const, programId: cs.id },
    { email: "student3@cims.edu", firstName: "Tharindu", lastName: "Gunasekara", role: "STUDENT" as const, programId: cs.id },
    { email: "student4@cims.edu", firstName: "Ishara", lastName: "Wickramasinghe", role: "STUDENT" as const, programId: cs.id },
  ];

  const userRecords: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};
  for (const user of users) {
    userRecords[user.email] = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }

  // ---------- Academic year & semesters ----------
  const academicYear = await prisma.academicYear.upsert({
    where: { name: "2025/2026" },
    update: {},
    create: {
      name: "2025/2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-08-31"),
      isActive: true,
    },
  });

  const semester1 = await prisma.semester.upsert({
    where: { academicYearId_semesterNumber: { academicYearId: academicYear.id, semesterNumber: 1 } },
    update: {},
    create: {
      academicYearId: academicYear.id,
      name: "Semester 1",
      semesterNumber: 1,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-20"),
      status: "CLOSED",
    },
  });

  // Registration window spans a wide range so it stays open for demos regardless of when the seed is run.
  const activeSemester = await prisma.semester.upsert({
    where: { academicYearId_semesterNumber: { academicYearId: academicYear.id, semesterNumber: 2 } },
    update: {},
    create: {
      academicYearId: academicYear.id,
      name: "Semester 2",
      semesterNumber: 2,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-30"),
      registrationOpensAt: new Date("2024-01-01"),
      registrationClosesAt: new Date("2030-01-01"),
      status: "ACTIVE",
    },
  });

  // Fee varies by program (and by year/semester of study), not by academic-year semester slot.
  await prisma.programCurriculumFee.upsert({
    where: { programId_yearLevel_semesterNumber: { programId: cs.id, yearLevel: 1, semesterNumber: 2 } },
    update: {},
    create: { programId: cs.id, yearLevel: 1, semesterNumber: 2, amount: 50000 },
  });
  await prisma.programCurriculumFee.upsert({
    where: { programId_yearLevel_semesterNumber: { programId: bba.id, yearLevel: 1, semesterNumber: 2 } },
    update: {},
    create: { programId: bba.id, yearLevel: 1, semesterNumber: 2, amount: 45000 },
  });

  // ---------- Modules ----------
  const cs101 = await prisma.module.upsert({
    where: { code_academicYearId_semesterId: { code: "CS101", academicYearId: academicYear.id, semesterId: activeSemester.id } },
    update: {},
    create: {
      code: "CS101",
      title: "Introduction to Programming",
      description: "Foundations of programming using a modern general-purpose language.",
      credits: 3,
      yearLevel: 1,
      programId: cs.id,
      academicYearId: academicYear.id,
      semesterId: activeSemester.id,
    },
  });
  const cs102 = await prisma.module.upsert({
    where: { code_academicYearId_semesterId: { code: "CS102", academicYearId: academicYear.id, semesterId: activeSemester.id } },
    update: {},
    create: {
      code: "CS102",
      title: "Discrete Mathematics",
      credits: 3,
      yearLevel: 1,
      programId: cs.id,
      academicYearId: academicYear.id,
      semesterId: activeSemester.id,
    },
  });
  const bba101 = await prisma.module.upsert({
    where: { code_academicYearId_semesterId: { code: "BBA101", academicYearId: academicYear.id, semesterId: activeSemester.id } },
    update: {},
    create: {
      code: "BBA101",
      title: "Principles of Management",
      credits: 3,
      yearLevel: 1,
      programId: bba.id,
      academicYearId: academicYear.id,
      semesterId: activeSemester.id,
    },
  });

  await prisma.lecturerModuleAssignment.upsert({
    where: { lecturerId_moduleId: { lecturerId: userRecords["lecturer1@cims.edu"].id, moduleId: cs101.id } },
    update: {},
    create: { lecturerId: userRecords["lecturer1@cims.edu"].id, moduleId: cs101.id },
  });
  await prisma.lecturerModuleAssignment.upsert({
    where: { lecturerId_moduleId: { lecturerId: userRecords["lecturer1@cims.edu"].id, moduleId: cs102.id } },
    update: {},
    create: { lecturerId: userRecords["lecturer1@cims.edu"].id, moduleId: cs102.id },
  });
  await prisma.lecturerModuleAssignment.upsert({
    where: { lecturerId_moduleId: { lecturerId: userRecords["lecturer2@cims.edu"].id, moduleId: bba101.id } },
    update: {},
    create: { lecturerId: userRecords["lecturer2@cims.edu"].id, moduleId: bba101.id },
  });

  // ---------- Weekly content for CS101 (only if not already seeded) ----------
  const existingWeeks = await prisma.moduleWeek.count({ where: { moduleId: cs101.id } });
  if (existingWeeks === 0) {
    const week1 = await prisma.moduleWeek.create({
      data: { moduleId: cs101.id, weekNumber: 1, title: "Introduction", orderIndex: 0 },
    });
    const week2 = await prisma.moduleWeek.create({
      data: { moduleId: cs101.id, weekNumber: 2, title: "Variables & Control Flow", orderIndex: 1 },
    });
    const week3 = await prisma.moduleWeek.create({
      data: { moduleId: cs101.id, weekNumber: 3, title: "Functions", orderIndex: 2 },
    });

    await prisma.contentItem.createMany({
      data: [
        {
          weekId: week1.id,
          type: "RICH_TEXT",
          title: "Welcome to CS101",
          richTextHtml: "<p>Welcome! This module covers the fundamentals of programming.</p>",
          status: "PUBLISHED",
          publishedAt: new Date(),
          orderIndex: 0,
          createdById: userRecords["lecturer1@cims.edu"].id,
        },
        {
          weekId: week1.id,
          type: "LINK",
          title: "Course syllabus",
          linkUrl: "https://example.com/cs101-syllabus",
          status: "PUBLISHED",
          publishedAt: new Date(),
          orderIndex: 1,
          createdById: userRecords["lecturer1@cims.edu"].id,
        },
        {
          weekId: week2.id,
          type: "ZOOM",
          title: "Week 2 live session",
          zoomJoinUrl: "https://zoom.us/j/1234567890",
          zoomMeetingId: "123 456 7890",
          status: "PUBLISHED",
          publishedAt: new Date(),
          orderIndex: 0,
          createdById: userRecords["lecturer1@cims.edu"].id,
        },
        {
          weekId: week3.id,
          type: "RICH_TEXT",
          title: "Functions assignment",
          richTextHtml: "<p>Write three functions demonstrating parameters and return values.</p>",
          status: "DRAFT",
          isAssignment: true,
          dueDate: new Date("2026-03-01"),
          orderIndex: 0,
          createdById: userRecords["lecturer1@cims.edu"].id,
        },
      ],
    });
  }

  // ---------- Announcements ----------
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        scope: "INSTITUTION",
        title: "Welcome to the new academic year",
        body: "We're excited to welcome everyone back for the 2025/2026 academic year.",
        isPinned: true,
        authorId: userRecords["admin@cims.edu"].id,
      },
    });
    await prisma.announcement.create({
      data: {
        scope: "MODULE",
        moduleId: cs101.id,
        title: "Week 2 session moved to Thursday",
        body: "This week's live session has been moved to Thursday at the same time.",
        authorId: userRecords["lecturer1@cims.edu"].id,
      },
    });
  }

  // ---------- Calendar events ----------
  const existingEvents = await prisma.calendarEvent.count();
  if (existingEvents === 0) {
    await prisma.calendarEvent.createMany({
      data: [
        {
          title: "Semester 2 begins",
          type: "SEMESTER_START",
          startDate: activeSemester.startDate,
          semesterId: activeSemester.id,
          createdById: userRecords["admin@cims.edu"].id,
        },
        {
          title: "Semester 2 ends",
          type: "SEMESTER_END",
          startDate: activeSemester.endDate,
          semesterId: activeSemester.id,
          createdById: userRecords["admin@cims.edu"].id,
        },
        {
          title: "Mid-semester exams",
          type: "EXAM_PERIOD",
          startDate: new Date("2026-03-10"),
          endDate: new Date("2026-03-17"),
          semesterId: activeSemester.id,
          createdById: userRecords["admin@cims.edu"].id,
        },
        {
          title: "Public holiday",
          type: "HOLIDAY",
          startDate: new Date("2026-04-13"),
          createdById: userRecords["admin@cims.edu"].id,
        },
      ],
    });
  }

  // ---------- Registrations covering all four statuses ----------
  async function seedRegistration(
    email: string,
    status: "APPROVED" | "PENDING" | "PAYMENT_PENDING" | "REJECTED"
  ) {
    const student = userRecords[email];
    const existing = await prisma.semesterRegistration.findUnique({
      where: { studentId_semesterId: { studentId: student.id, semesterId: activeSemester.id } },
    });
    if (existing) return existing;

    const registration = await prisma.semesterRegistration.create({
      data: {
        studentId: student.id,
        semesterId: activeSemester.id,
        yearLevel: 1,
        status: status === "PAYMENT_PENDING" ? "PAYMENT_PENDING" : status,
        submittedAt: status === "PAYMENT_PENDING" ? null : new Date(),
        decidedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : null,
        decidedById: status === "APPROVED" || status === "REJECTED" ? userRecords["admin@cims.edu"].id : null,
        rejectionReason: status === "REJECTED" ? "Payment receipt was unclear — please re-upload a clearer copy." : null,
        registrationModules: { create: [{ moduleId: cs101.id }] },
      },
    });

    if (status !== "PAYMENT_PENDING") {
      await prisma.paymentRecord.create({
        data: {
          registrationId: registration.id,
          amount: 50000,
          receiptUrl: "https://example.com/receipts/sample-receipt.pdf",
          receiptFileName: "receipt.pdf",
          verificationStatus: status === "APPROVED" ? "VERIFIED" : status === "REJECTED" ? "REJECTED" : "PENDING",
          verifiedById: status === "APPROVED" || status === "REJECTED" ? userRecords["admin@cims.edu"].id : null,
          verifiedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : null,
        },
      });
    }

    if (status === "APPROVED") {
      await prisma.enrollment.create({
        data: { studentId: student.id, moduleId: cs101.id, registrationId: registration.id },
      });
    }

    return registration;
  }

  await seedRegistration("student1@cims.edu", "APPROVED");
  await seedRegistration("student2@cims.edu", "PENDING");
  await seedRegistration("student3@cims.edu", "PAYMENT_PENDING");
  await seedRegistration("student4@cims.edu", "REJECTED");

  console.log(`Seeded ${users.length} users. Dev password for all: ${DEV_PASSWORD}`);
  console.log("Seeded 2 programs, 1 academic year, 2 semesters, 3 modules, weekly content, announcements, calendar events, and 4 registrations (one per status).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
