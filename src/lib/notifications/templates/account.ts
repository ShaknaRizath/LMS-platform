export function welcomeSetPasswordTemplate(params: { firstName: string; setPasswordUrl: string }) {
  return {
    subject: "Welcome to CIMS Campus — set your password",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>An account has been created for you on CIMS Campus. Click the link below to set your password:</p>
      <p><a href="${params.setPasswordUrl}">${params.setPasswordUrl}</a></p>
      <p>This link expires in 7 days.</p>
    `,
  };
}

export function signupWelcomeTemplate(params: { firstName: string }) {
  return {
    subject: "Welcome to CIMS Campus",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Your CIMS Campus account has been created. You can sign in any time with the email and password you chose.</p>
    `,
  };
}

export function passwordResetTemplate(params: { firstName: string; resetUrl: string }) {
  return {
    subject: "Reset your CIMS Campus password",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>We received a request to reset your password. Click the link below to choose a new one:</p>
      <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  };
}

export function applicationReceivedTemplate(params: { firstName: string; referenceCode: string; statusUrl: string }) {
  return {
    subject: "We've received your CIMS Campus application",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Thanks for applying to CIMS Campus. Your application is now under review.</p>
      <p>Your application reference is <strong>${params.referenceCode}</strong> — save this to check your status any time:</p>
      <p><a href="${params.statusUrl}">${params.statusUrl}</a></p>
    `,
  };
}

export function offerLetterTemplate(params: {
  firstName: string;
  programName: string;
  setPasswordUrl: string;
  offerLetterUrl: string;
}) {
  return {
    subject: "Congratulations — you've been admitted to CIMS Campus",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Congratulations! You've been admitted to ${params.programName} at CIMS Campus.</p>
      <p>Your offer letter is ready: <a href="${params.offerLetterUrl}">${params.offerLetterUrl}</a></p>
      <p>An account has been created for you. Click the link below to set your password and get started:</p>
      <p><a href="${params.setPasswordUrl}">${params.setPasswordUrl}</a></p>
      <p>This link expires in 7 days.</p>
    `,
  };
}

export function applicationRejectedTemplate(params: { firstName: string; reason: string }) {
  return {
    subject: "Update on your CIMS Campus application",
    html: `
      <p>Hi ${params.firstName},</p>
      <p>Thank you for your interest in CIMS Campus. After review, we're unable to offer you admission at this time.</p>
      <p>Reason: ${params.reason}</p>
    `,
  };
}
