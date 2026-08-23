/**
 * Firebase web config for the /admin console.
 *
 * These values are committed on purpose. Firebase web config is PUBLIC by
 * design — it ships in the client bundle to every visitor no matter where it
 * is stored, and the apiKey is an identifier rather than a secret. What
 * actually protects the visit log is firestore.rules (pinned to one uid,
 * enforced by Google's servers) plus self-signup being disabled.
 *
 * They started life in a gitignored .env, which quietly broke production: CI
 * has no .env, so GitHub Actions built with empty config and deployed an
 * /admin that could only show its own setup instructions. Hiding a value that
 * is served to every visitor anyway bought nothing and cost a deploy.
 *
 * .env still overrides these, which is useful for pointing a local build at a
 * different Firebase project.
 */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey:            env.PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCkow4qpaBNHNHJ9WzxuqGCG34ybRJNFcg',
  authDomain:        env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'advaitakelkar-site.firebaseapp.com',
  projectId:         env.PUBLIC_FIREBASE_PROJECT_ID ?? 'advaitakelkar-site',
  storageBucket:     env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'advaitakelkar-site.appspot.com',
  messagingSenderId: env.PUBLIC_FIREBASE_SENDER_ID ?? '233978163356',
  appId:             env.PUBLIC_FIREBASE_APP_ID ?? '1:233978163356:web:09626d7b4b49795829fd59',
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
