export function announcementNotificationTemplate(params: { title: string; body: string; moduleCode?: string }) {
  return {
    subject: params.moduleCode ? `[${params.moduleCode}] ${params.title}` : params.title,
    body: params.body,
  };
}

export function assignmentGradedTemplate(params: { contentItemTitle: string; moduleCode: string; grade?: number }) {
  return {
    subject: `"${params.contentItemTitle}" graded`,
    body: `Your submission for "${params.contentItemTitle}" in ${params.moduleCode} has been graded${
      params.grade != null ? ` — ${params.grade}` : ""
    }. Log in to CIMS Campus to see the full feedback.`,
  };
}

export function quizResultsPublishedTemplate(params: {
  quizTitle: string;
  moduleCode: string;
  pointsEarned?: number;
  totalPoints?: number;
}) {
  return {
    subject: `"${params.quizTitle}" results published`,
    body: `Your results for "${params.quizTitle}" in ${params.moduleCode} are ready${
      params.pointsEarned != null && params.totalPoints ? ` — ${params.pointsEarned}/${params.totalPoints}` : ""
    }. Log in to CIMS Campus to see the full breakdown.`,
  };
}
