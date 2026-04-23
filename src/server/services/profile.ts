/**
 * Profile service — all reads/writes of Profile data go through here.
 *
 * TODO: Implement `getPublicProfile(viewerId, ownerId)` that:
 *   - Always omits `lastName` unless viewer === owner
 *     OR there is an ACCEPTED ListingInterest between viewer and owner
 *   - Always omits precise `dateOfBirth` (return age bucket instead)
 *   - Respects the owner's `privacyMode` (HIDDEN → 404, MATCHES_ONLY → require match)
 */

export {};
