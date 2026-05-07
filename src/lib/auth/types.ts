export interface AuthUser {
  cognitoSub: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export interface SignUpResult {
  userSub: string;
  codeDeliveryDestination?: string;
}

export interface ConfirmSignUpInput {
  email: string;
  code: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthProvider {
  signUp(input: SignUpInput): Promise<SignUpResult>;
  confirmSignUp(input: ConfirmSignUpInput): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  signIn(input: SignInInput): Promise<AuthTokens>;
  signOut(accessToken: string): Promise<void>;
  verifyIdToken(idToken: string): Promise<AuthUser>;
  /**
   * Mints a fresh ID + access token from a refresh token.
   *
   * `username` is the Cognito `sub` of the user owning the refresh token.
   * It's required by Cognito's `REFRESH_TOKEN_AUTH` flow because the
   * `SECRET_HASH` for confidential clients must be keyed on the username.
   * Pass the value of the `hl_user_sub` cookie at the call site.
   */
  refreshTokens(refreshToken: string, username: string): Promise<AuthTokens>;
  getHostedUiUrl(
    provider: 'Google' | 'Apple',
    redirectUri: string,
    state: string,
  ): string;
  exchangeAuthCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokens>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
