/**
 * Forgot password — placeholder page.
 * Full implementation in Phase 3 once Cognito ForgotPassword + ConfirmForgotPassword
 * flows are wired up.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">Reset your password</h1>
      <p className="mb-6 text-sm text-gray-500">
        Password reset is coming soon. In the meantime, contact{' '}
        <a
          href="mailto:support@harmonyliving.app"
          className="text-teal-600 hover:underline"
        >
          support@harmonyliving.app
        </a>{' '}
        and we&apos;ll help you recover your account.
      </p>
      <a
        href="/login"
        className="inline-block rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        ← Back to login
      </a>
    </div>
  );
}
