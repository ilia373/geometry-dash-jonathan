/**
 * Firebase Cloud Functions for Geometry Dash
 * 
 * This module provides server-side authentication controls including:
 * - Admin privilege assignment via custom claims
 * - Secure admin verification that cannot be bypassed client-side
 * 
 * IMPORTANT: Admin emails are stored server-side here to prevent client-side tampering.
 * Custom claims are cryptographically signed in the JWT token and verified by Firebase.
 */

import { beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { logger } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
initializeApp();

/**
 * Super admin email addresses - stored server-side only
 * These emails are granted admin privileges via custom claims
 * 
 * SECURITY: These emails are NOT exposed to the client.
 * The client only receives the `admin: true` claim in the JWT token.
 */
const SUPER_ADMIN_EMAILS = [
  'ilia209@gmail.com',
  'jonathan.aronov.140417@gmail.com', // lowercase for comparison
];

/**
 * Check if an email is a super admin
 */
const isSuperAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Blocking function that runs before every sign-in
 * 
 * This function:
 * 1. Checks if the user's email is in the admin list
 * 2. Sets/updates the `admin` custom claim on the user
 * 3. The claim is included in the user's ID token (JWT)
 * 4. Firestore security rules can verify `request.auth.token.admin === true`
 * 
 * SECURITY BENEFITS:
 * - Admin list is stored server-side, not in client code
 * - Custom claims are cryptographically signed by Firebase
 * - Claims cannot be forged or modified by the client
 * - Firestore rules enforce permissions server-side
 */
export const setAdminClaim = beforeUserSignedIn(async (event) => {
  const user = event.data;
  
  // User should always exist in beforeUserSignedIn, but handle edge case
  if (!user) {
    logger.warn('No user data in sign-in event');
    return;
  }
  
  const email = user.email;
  
  logger.info(`User signing in: ${email}`);
  
  // Check if user should be admin
  const shouldBeAdmin = isSuperAdmin(email);
  
  // Get current claims to check if update is needed
  const auth = getAuth();
  let currentClaims: { admin?: boolean } = {};
  
  try {
    const userRecord = await auth.getUser(user.uid);
    currentClaims = userRecord.customClaims || {};
  } catch (error) {
    // User might be new, claims will be set
    logger.info(`New user or error fetching claims: ${error}`);
  }
  
  // Only update if claim needs to change
  if (currentClaims.admin !== shouldBeAdmin) {
    logger.info(`Updating admin claim for ${email}: ${shouldBeAdmin}`);
    
    // Set custom claims - these persist in the Auth database
    // and are included in the ID token
    return {
      customClaims: {
        admin: shouldBeAdmin,
      },
    };
  }
  
  logger.info(`Admin claim unchanged for ${email}: ${currentClaims.admin}`);
  return;
});
