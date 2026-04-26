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

export interface AuthProvider {
  signUp(input: SignUpInput): Promise<SignUpResult>;
  confirmSignUp(input: ConfirmSignUpInput): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  signIn(input: SignInInput): Promise<AuthTokens>;
  signOut(accessToken: string): Promise<void>;
  verifyIdToken(idToken: string): Promise<AuthUser>;
  refreshTokens(refreshToken: string): Promise<AuthTokens>;
  getHostedUiUrl(
    provider: 'Google' | 'Apple',
    redirectUri: string,
    state: string,
  ): string;
  exchangeAuthCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokens>;
}
