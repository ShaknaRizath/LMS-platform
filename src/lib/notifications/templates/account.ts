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
