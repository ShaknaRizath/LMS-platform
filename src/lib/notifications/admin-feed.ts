import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Admin (Super Admin / Campus Admin) header bell —
 * previously this role only got getStaffLeaveNotifications (their own leave decisions), so none
 * of the three queues Admin actually decides on (registrations, applications, payment
 * verification — all visible as dashboard stat cards already) surfaced in the bell.
 */
export async function getAdminNotifications(userId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, pendingRegistrations, pendingApplications, pendingPayments] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.semesterRegistration.findMany({
      where: { status: "PENDING" },
      include: { student: true },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.application.findMany({
      where: { status: "PENDING" },
      include: { program: true },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.paymentRecord.findMany({
      where: { verificationStatus: "PENDING" },
      include: { registration: { include: { student: true } } },
      orderBy: { uploadedAt: "desc" },
      take: FEED_LIMIT,
    }),
  ]);

  return [
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...pendingRegistrations.map((registration) => ({
      id: `registration-${registration.id}`,
      title: "Registration awaiting approval",
      detail: `${registration.student.firstName} ${registration.student.lastName}`,
      date: registration.submittedAt ?? registration.createdAt,
      href: `/admin/registrations/${registration.id}`,
    })),
    ...pendingApplications.map((application) => ({
      id: `application-${application.id}`,
      title: "Application awaiting review",
      detail: `${application.firstName} ${application.lastName} · ${application.program.name}`,
      date: application.submittedAt,
      href: "/admin/applications",
    })),
    ...pendingPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      title: "Payment awaiting verification",
      detail: `${payment.registration.student.firstName} ${payment.registration.student.lastName} · ${payment.currency} ${payment.amount.toString()}`,
      date: payment.uploadedAt,
      href: `/admin/registrations/${payment.registrationId}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
