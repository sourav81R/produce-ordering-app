import jwt from 'jsonwebtoken';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const requiredFirebaseEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];
const firebasePublicKeysUrl =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const firebaseIssuerBaseUrl = 'https://securetoken.google.com';
const firebasePublicKeyCache = {
  certs: null,
  expiresAt: 0,
};

const formatPrivateKey = (privateKey) => privateKey.replace(/\\n/g, '\n');
const getFirebaseProjectId = () => process.env.FIREBASE_PROJECT_ID?.trim();
const parseMaxAgeSeconds = (cacheControlHeader = '') => {
  const match = cacheControlHeader.match(/max-age=(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : 3600;
};

const buildFirebaseConfigError = () => {
  const error = new Error(
    'Firebase authentication is not configured on the server. Set FIREBASE_PROJECT_ID.'
  );
  error.code = 'FIREBASE_CONFIG_MISSING';
  return error;
};

const buildInvalidFirebaseTokenError = (message = 'Invalid Firebase ID token.') => {
  const error = new Error(message);
  error.code = 'FIREBASE_TOKEN_INVALID';
  return error;
};

const buildFirebaseKeyFetchError = () => {
  const error = new Error(
    'Unable to verify Firebase sign-in right now because the server could not load Google public keys.'
  );
  error.code = 'FIREBASE_PUBLIC_KEYS_UNAVAILABLE';
  return error;
};

export const isFirebaseAdminConfigured = () =>
  requiredFirebaseEnvVars.every((envVar) => Boolean(process.env[envVar]));

export const canVerifyFirebaseTokens = () => Boolean(getFirebaseProjectId());

const initializeFirebaseAdmin = () => {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  if (getApps().length) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
};

export const getFirebaseAdminAuth = () => getAuth(initializeFirebaseAdmin());

const getFirebasePublicKeys = async (forceRefresh = false) => {
  if (
    !forceRefresh &&
    firebasePublicKeyCache.certs &&
    Date.now() < firebasePublicKeyCache.expiresAt
  ) {
    return firebasePublicKeyCache.certs;
  }

  let response;
  try {
    response = await fetch(firebasePublicKeysUrl);
  } catch (_error) {
    throw buildFirebaseKeyFetchError();
  }

  if (!response.ok) {
    throw buildFirebaseKeyFetchError();
  }

  const certs = await response.json();
  const maxAgeSeconds = parseMaxAgeSeconds(response.headers.get('cache-control'));

  firebasePublicKeyCache.certs = certs;
  firebasePublicKeyCache.expiresAt = Date.now() + maxAgeSeconds * 1000;

  return certs;
};

const verifyFirebaseIdTokenWithPublicKeys = async (idToken) => {
  const projectId = getFirebaseProjectId();

  if (!projectId) {
    throw buildFirebaseConfigError();
  }

  const decoded = jwt.decode(idToken, { complete: true });

  if (
    !decoded ||
    typeof decoded !== 'object' ||
    typeof decoded.header !== 'object' ||
    decoded.header.alg !== 'RS256' ||
    !decoded.header.kid
  ) {
    throw buildInvalidFirebaseTokenError();
  }

  let certs = await getFirebasePublicKeys();
  let signingCert = certs[decoded.header.kid];

  if (!signingCert) {
    certs = await getFirebasePublicKeys(true);
    signingCert = certs[decoded.header.kid];
  }

  if (!signingCert) {
    throw buildInvalidFirebaseTokenError();
  }

  let verifiedToken;
  try {
    verifiedToken = jwt.verify(idToken, signingCert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `${firebaseIssuerBaseUrl}/${projectId}`,
    });
  } catch (_error) {
    throw buildInvalidFirebaseTokenError();
  }

  if (
    !verifiedToken ||
    typeof verifiedToken !== 'object' ||
    typeof verifiedToken.sub !== 'string' ||
    !verifiedToken.sub.trim()
  ) {
    throw buildInvalidFirebaseTokenError();
  }

  return verifiedToken;
};

export const verifyFirebaseIdToken = async (idToken) => {
  if (isFirebaseAdminConfigured()) {
    return getFirebaseAdminAuth().verifyIdToken(idToken);
  }

  return verifyFirebaseIdTokenWithPublicKeys(idToken);
};
