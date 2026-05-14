import crypto from 'crypto';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  type AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { env } from '@/lib/env';
import { AuthError, AuthErrorCode } from './errors';
import type {
  AuthProvider,
  AuthTokens,
  AuthUser,
  ConfirmSignUpInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  SignUpResult,
} from './types';

/**
 * Computes the SECRET_HASH required by Cognito when the app client has a
 * client secret (i.e. confidential client). Every USER_PASSWORD_AUTH and
 * token exchange call must include this hash.
 *
 * Formula: Base64(HMAC-SHA256(username + clientId, clientSecret))
 */
function computeSecretHash(username: string): string {
  return crypto
    .createHmac('sha256', env.COGNITO_CLIENT_SECRET)
    .update(username + env.COGNITO_CLIENT_ID)
    .digest('base64');
}

/**
 * Maps Cognito SDK exception names to our typed AuthErrorCode enum.
 * Any unrecognised exception falls through to UNKNOWN.
 */
function mapCognitoError(error: unknown): AuthError {
  if (!(error instanceof Error)) {
    return new AuthError(AuthErrorCode.UNKNOWN, String(error));
  }

  const name = (error as { name?: string }).name ?? '';

  switch (name) {
    case 'UsernameExistsException':
      return new AuthError(AuthErrorCode.USER_ALREADY_EXISTS, error.message);
    case 'NotAuthorizedException':
      return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, error.message);
    case 'UserNotConfirmedException':
      return new AuthError(AuthErrorCode.USER_NOT_CONFIRMED, error.message);
    case 'CodeMismatchException':
      return new AuthError(AuthErrorCode.CODE_MISMATCH, error.message);
    case 'ExpiredCodeException':
      return new AuthError(AuthErrorCode.CODE_EXPIRED, error.message);
    case 'InvalidPasswordException':
      return new AuthError(AuthErrorCode.PASSWORD_POLICY, error.message);
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      return new AuthError(AuthErrorCode.TOO_MANY_ATTEMPTS, error.message);
    case 'UserNotFoundException':
      return new AuthError(AuthErrorCode.USER_NOT_FOUND, error.message);
    default:
      return new AuthError(AuthErrorCode.UNKNOWN, error.message);
  }
}

export class CognitoAuthProvider implements AuthProvider {
  private readonly client: CognitoIdentityProviderClient;

  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: env.COGNITO_USER_POOL_ID,
    tokenUse: 'id',
    clientId: env.COGNITO_CLIENT_ID,
  });

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: env.COGNITO_REGION,
    });
  }

  async signUp(input: SignUpInput): Promise<SignUpResult> {
    try {
      const resp = await this.client.send(
        new SignUpCommand({
          ClientId: env.COGNITO_CLIENT_ID,
          SecretHash: computeSecretHash(input.email),
          Username: input.email,
          Password: input.password,
          UserAttributes: [{ Name: 'email', Value: input.email }],
        }),
      );

      return {
        userSub: resp.UserSub!,
        codeDeliveryDestination:
          resp.CodeDeliveryDetails?.Destination ?? undefined,
      };
    } catch (err) {
      throw mapCognitoError(err);
    }
  }

  async confirmSignUp(input: ConfirmSignUpInput): Promise<void> {
    try {
      await this.client.send(
        new ConfirmSignUpCommand({
          ClientId: env.COGNITO_CLIENT_ID,
          SecretHash: computeSecretHash(input.email),
          Username: input.email,
          ConfirmationCode: input.code,
        }),
      );
    } catch (err) {
      throw mapCognitoError(err);
    }
  }

  async resendConfirmationCode(email: string): Promise<void> {
    try {
      await this.client.send(
        new ResendConfirmationCodeCommand({
          ClientId: env.COGNITO_CLIENT_ID,
          SecretHash: computeSecretHash(email),
          Username: email,
        }),
      );
    } catch (err) {
      throw mapCognitoError(err);
    }
  }

  async signIn(input: SignInInput): Promise<AuthTokens> {
    try {
      const resp = await this.client.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH' as AuthFlowType,
          ClientId: env.COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: input.email,
            PASSWORD: input.password,
            SECRET_HASH: computeSecretHash(input.email),
          },
        }),
      );

      const result = resp.AuthenticationResult;
      if (!result?.AccessToken || !result.IdToken || !result.RefreshToken) {
        throw new AuthError(AuthErrorCode.UNKNOWN, 'Incomplete auth result from Cognito');
      }

      return {
        accessToken: result.AccessToken,
        idToken: result.IdToken,
        refreshToken: result.RefreshToken,
        expiresIn: result.ExpiresIn ?? 3600,
      };
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw mapCognitoError(err);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.client.send(
        new ForgotPasswordCommand({
          ClientId: env.COGNITO_CLIENT_ID,
          SecretHash: computeSecretHash(email),
          Username: email,
        }),
      );
    } catch (err) {
      // Privacy: swallow UserNotFoundException so callers always return 200
      if ((err as { name?: string }).name === 'UserNotFoundException') return;
      throw mapCognitoError(err);
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    try {
      await this.client.send(
        new ConfirmForgotPasswordCommand({
          ClientId: env.COGNITO_CLIENT_ID,
          SecretHash: computeSecretHash(input.email),
          Username: input.email,
          ConfirmationCode: input.code,
          Password: input.newPassword,
        }),
      );
    } catch (err) {
      throw mapCognitoError(err);
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      await this.client.send(
        new GlobalSignOutCommand({ AccessToken: accessToken }),
      );
    } catch (err) {
      // GlobalSignOut can fail if the token is already expired; that's fine,
      // we clear cookies regardless on the caller side.
      if ((err as { name?: string }).name !== 'NotAuthorizedException') {
        throw mapCognitoError(err);
      }
    }
  }

  async verifyIdToken(idToken: string): Promise<AuthUser> {
    try {
      const payload = await this.verifier.verify(idToken);

      return {
        cognitoSub: payload.sub,
        email: payload.email as string,
        emailVerified: payload.email_verified as boolean ?? false,
      };
    } catch {
      throw new AuthError(AuthErrorCode.INVALID_TOKEN, 'ID token verification failed');
    }
  }

  async refreshTokens(refreshToken: string, username: string): Promise<AuthTokens> {
    try {
      // REFRESH_TOKEN_AUTH for confidential clients requires SECRET_HASH
      // to be keyed on the user's `sub`, not the client ID. Cognito returns
      // "Unable to verify secret hash" if you key it on the client ID instead.
      const resp = await this.client.send(
        new InitiateAuthCommand({
          AuthFlow: 'REFRESH_TOKEN_AUTH' as AuthFlowType,
          ClientId: env.COGNITO_CLIENT_ID,
          AuthParameters: {
            REFRESH_TOKEN: refreshToken,
            SECRET_HASH: computeSecretHash(username),
          },
        }),
      );

      const result = resp.AuthenticationResult;
      if (!result?.AccessToken || !result.IdToken) {
        throw new AuthError(AuthErrorCode.TOKEN_EXPIRED, 'Could not refresh tokens');
      }

      return {
        accessToken: result.AccessToken,
        idToken: result.IdToken,
        // Cognito does not return a new refresh token on refresh; reuse the old one.
        refreshToken,
        expiresIn: result.ExpiresIn ?? 3600,
      };
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw mapCognitoError(err);
    }
  }

  getHostedUiUrl(
    provider: 'Google' | 'Apple',
    redirectUri: string,
    state: string,
  ): string {
    // TODO(auth-phase-3): Wire up Google and Apple identity providers in the
    // Cognito console (Social and external providers → Add identity provider).
    // Until then, these URLs will redirect to Cognito's hosted UI but fail
    // with an "IdP not configured" error; expected behaviour for now.
    const params = new URLSearchParams({
      identity_provider: provider,
      client_id: env.COGNITO_CLIENT_ID,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: redirectUri,
      state,
    });

    return `${env.COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
  }

  async exchangeAuthCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokens> {
    // Public/confidential client token exchange via Cognito's hosted UI
    // /oauth2/token endpoint. For a confidential client we must include
    // client_id and client_secret as Basic Auth credentials.
    const credentials = Buffer.from(
      `${env.COGNITO_CLIENT_ID}:${env.COGNITO_CLIENT_SECRET}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.COGNITO_CLIENT_ID,
      code,
      redirect_uri: redirectUri,
    });

    const resp = await fetch(`${env.COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        `Token exchange failed (${resp.status}): ${text}`,
      );
    }

    const data = (await resp.json()) as {
      access_token: string;
      id_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}
