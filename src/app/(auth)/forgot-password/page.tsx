export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl bg-white border border-[#cfc5bd] px-8 py-8">
      <div className="w-12 h-12 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-5">
        <svg className="w-6 h-6 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <h1 className="mb-1 text-xl font-serif font-semibold text-[#1c1b1b]">Reset your password</h1>
      <p className="mb-6 text-sm text-[#7d766f]">
        Password reset is coming soon. In the meantime, contact{' '}
        <a
          href="mailto:support@harmonyliving.app"
          className="text-[#c96d4d] hover:underline"
        >
          support@harmonyliving.app
        </a>{' '}
        and we&apos;ll help you recover your account.
      </p>

      <a
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4c4640] border border-[#cfc5bd] rounded-xl px-4 py-2.5 hover:bg-[#fdf8f7] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to login
      </a>
    </div>
  );
}
