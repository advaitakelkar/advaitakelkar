/**
 * Firebase web config for the /admin console.
 *
 * These values are PUBLIC by design — Firebase web config is meant to ship in
 * the client bundle. The apiKey is an identifier, not a secret; what actually
 * protects the data is firestore.rules, which Google enforces server-side.
 *
 * Fill them in via .env (see .env.example). They come from:
 *   Firebase console → Project settings → General → Your apps → Web app → SDK
 *   setup and configuration → Config
 */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey:            env.PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain:        env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'advaitakelkar-site.firebaseapp.com',
  projectId:         env.PUBLIC_FIREBASE_PROJECT_ID ?? 'advaitakelkar-site',
  storageBucket:     env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'advaitakelkar-site.appspot.com',
  messagingSenderId: env.PUBLIC_FIREBASE_SENDER_ID ?? '',
  appId:             env.PUBLIC_FIREBASE_APP_ID ?? '',
};

/**
 * The single account that may read the console.
 *
 * /admin shows one password field rather than an email + password pair — the
 * email is fixed here and never typed. That keeps the sign-in feeling like a
 * simple gate while the authentication underneath is real: the password is
 * checked by Firebase Auth's servers, never by anything in this bundle, and
 * it is never stored here.
 */
export const ADMIN_EMAIL = env.PUBLIC_ADMIN_EMAIL ?? 'advaitakelkar@gmail.com';

export const isConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
