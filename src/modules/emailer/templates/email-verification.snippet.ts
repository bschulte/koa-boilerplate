export const emailVerificationSnippet = (token: string) => {
  return `
    <mj-text font-size="22px">
    Verify your email address
    </mj-text>

    <mj-text>
    An account has been created for you with this email address. Please click the link below to verify your email address.
    </mj-text>

    <mj-button href="/user/verify?token=${token}">
      Verify Email
    </mj-button>

    <mj-text font-style="italic" font-size="11px">
      If you did not create this account you can safely ignore this email.
    </mj-text>
  `;
};
