import { CognitoAuthProvider } from './cognito-provider';
import type { AuthProvider } from './types';

/**
 * Singleton auth provider. Swap the implementation here to change providers
 * (e.g. Clerk, Auth.js) without touching any feature code.
 */
export const auth: AuthProvider = new CognitoAuthProvider();

export * from './types';
export * from './errors';
