export function registrationApprovedTemplate(params: { firstName: string }) {
  return {
    subject: "Your semester registration has been approved",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Your semester registration has been approved. You now have access to your enrolled modules on CIMS Campus.</p>
    `,
  };
}

export function registrationRejectedTemplate(params: { firstName: string; reason: string }) {
  return {
    subject: "Your semester registration needs attention",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Your semester registration was not approved for the following reason:</p>
      <p>${params.reason}</p>
      <p>Please log in to CIMS Campus to review and resubmit.</p>
    `,
  };
}

export function paymentVerifiedTemplate(params: { firstName: string }) {
  return {
    subject: "Your payment has been verified",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Your semester fee payment has been verified. Your registration is now awaiting final approval.</p>
    `,
  };
}

export function paymentRejectedTemplate(params: { firstName: string; reason: string }) {
  return {
    subject: "Your payment receipt could not be verified",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>We couldn't verify your payment receipt for the following reason:</p>
      <p>${params.reason}</p>
      <p>Please log in to CIMS Campus to upload a new receipt.</p>
    `,
  };
}
