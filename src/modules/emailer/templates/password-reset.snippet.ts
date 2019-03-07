export const passwordResetSnippet = (token: string) => {
  return `
    <mj-text font-size="22px">
    Password Reset
    </mj-text>

    <mj-text>
      A password reset has been initiated for your account. Please click the link
      below to reset your password.
    </mj-text>

    <mj-button href="/password-reset?token=${token}">
      Reset Password
    </mj-button>

    <mj-text font-style="italic" font-size="11px">
      If you did not make this request, please contact support.
    </mj-text>
  `;
};
