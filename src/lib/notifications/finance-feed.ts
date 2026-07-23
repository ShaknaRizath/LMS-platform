import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Finance Staff header bell — combines the staff member's
 * own leave request decisions (e.g. HR approving/rejecting a request they filed) with the
 * things Finance itself needs to act on: new pending payment uploads, new scholarship
 * applications, and registrations awaiting approval (Finance can approve/reject registrations
 * too, once a payment's verified — see approveRegistration/rejectRegistration's allowed roles).
 * Same per-item read-state mechanism as getStudentNotifications (NotificationRead, keyed by
 * this item's id), so it slots into DashboardShell's existing notifications prop as-is.
 */
export async function getFinanceNotifications(userId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, pendingPayments, pendingScholarships, pendingRegistrations] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.paymentRecord.findMany({
      where: { verificationStatus: "PENDING" },
      include: { registration: { include: { student: true } } },
      orderBy: { uploadedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.scholarship.findMany({
      where: { status: "PENDING" },
      include: { student: true },
      orderBy: { createdAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.semesterRegistration.findMany({
      where: { status: "PENDING" },
      include: { student: true },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT,
    }),
  ]);

  const items: NotificationItem[] = [
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...pendingPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      title: "Payment awaiting verification",
      detail: `${payment.registration.student.firstName} ${payment.registration.student.lastName} · ${payment.currency} ${payment.amount.toString()}`,
      date: payment.uploadedAt,
      href: `/finance/registrations/${payment.registrationId}`,
    })),
    ...pendingScholarships.map((scholarship) => ({
      id: `scholarship-${scholarship.id}`,
      title: "Scholarship application pending",
      detail: `${scholarship.student.firstName} ${scholarship.student.lastName}`,
      date: scholarship.createdAt,
      href: "/finance/scholarships",
    })),
    ...pendingRegistrations.map((registration) => ({
      id: `registration-${registration.id}`,
      title: "Registration awaiting approval",
      detail: `${registration.student.firstName} ${registration.student.lastName}`,
      date: registration.submittedAt ?? registration.createdAt,
      href: `/finance/registrations/${registration.id}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);

  return items;
}
