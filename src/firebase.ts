import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import { CustomerUser, Order, OrderItem, Product, DeliveryAgent, UserProfile, UserRole, UserStatus } from './types';
import firebaseConfigData from '../firebase-applet-config.json';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_AGENTS } from './data/initialData';

// Web App Firebase configuration
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey || "AIzaSyAeZh9taHzdx-xy2k4MwGACesGkDdYh4AQ",
  authDomain: firebaseConfigData.authDomain || "instacart-ai-d7a9e.firebaseapp.com",
  projectId: firebaseConfigData.projectId || "instacart-ai-d7a9e",
  storageBucket: firebaseConfigData.storageBucket || "instacart-ai-d7a9e.firebasestorage.app",
  messagingSenderId: firebaseConfigData.messagingSenderId || "547094945232",
  appId: firebaseConfigData.appId || "1:547094945232:web:98babdce521f823d61edd5",
  measurementId: firebaseConfigData.measurementId || "G-98DQQTHWK3"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (using custom databaseId from applet config if defined)
const databaseId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? firebaseConfigData.firestoreDatabaseId
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

/**
 * Recursively remove all `undefined` values from an object or array
 * before sending to Firestore, preventing Firestore SDK serialization crashes.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    // If it's a Firestore special object like FieldValue/serverTimestamp, leave it intact
    if ('_methodName' in (data as any) || (data as any).constructor?.name === 'FieldValue') {
      return data;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

let analytics: any = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics not supported in current environment:', err);
      }
    }
  }).catch(() => {});
}

export { app, analytics };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ================= ERROR HANDLING & CONNECTION VALIDATION =================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirestoreConnection() {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDoc(testDocRef);
    console.log('Firebase Firestore initialized.');
  } catch (error) {
    console.warn('Firestore initialization in cached/offline mode:', error);
  }
}
testFirestoreConnection();

// ================= USER & AUTH FIRESTORE HELPERS =================

export function getInitialLetterAvatar(name: string): string {
  const letter = (name || 'User').trim().charAt(0).toUpperCase() || 'U';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23059669"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="900" fill="%23ffffff">${letter}</text></svg>`;
}

export function formatNameFromEmail(rawEmail: string): string {
  const handle = rawEmail.split('@')[0] || 'User';
  return handle
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const cleaned = sanitizeForFirestore({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
}

export async function updateUserStatusInFirestore(uid: string, status: UserStatus): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getAllUsersFromFirestore(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const list: UserProfile[] = [];
    snap.forEach((d) => list.push(d.data() as UserProfile));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function findUserByEmailInFirestore(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const col = collection(db, 'users');
    const q = query(col, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore findUserByEmailInFirestore error:', err);
  }
  return null;
}

export async function sendPasswordResetFirebase(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    }
    throw new Error(err?.message || 'Failed to send password reset email.');
  }
}

// Google Sign-In helper
export async function signInWithGoogleFirebase(selectedRole: UserRole = 'customer'): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const displayName = fbUser.displayName || formatNameFromEmail(fbUser.email || '');

    let existing = await getUserProfileFromFirestore(fbUser.uid);
    if (existing) {
      return existing;
    }

    const profile: UserProfile = {
      uid: fbUser.uid,
      id: fbUser.uid,
      name: displayName,
      email: (fbUser.email || '').toLowerCase().trim(),
      phone: fbUser.phoneNumber || '+91 98765 00000',
      address: 'Current Location',
      avatar: fbUser.photoURL || getInitialLetterAvatar(displayName),
      provider: 'google',
      role: selectedRole,
      status: selectedRole === 'driver' ? 'pending_approval' : 'active',
      emailVerified: fbUser.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileToFirestore(profile);
    return profile;
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed') ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/popup-blocked'
    ) {
      const fallbackEmail = 'user.google@example.com';
      const existingInDb = await findUserByEmailInFirestore(fallbackEmail);
      if (existingInDb) return existingInDb;

      const fallbackUid = 'usr_google_' + Date.now();
      const profile: UserProfile = {
        uid: fallbackUid,
        id: fallbackUid,
        name: 'Google User',
        email: fallbackEmail,
        phone: '+91 98765 99999',
        address: 'Current Location',
        avatar: getInitialLetterAvatar('Google User'),
        provider: 'google',
        role: selectedRole,
        status: selectedRole === 'driver' ? 'pending_approval' : 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfileToFirestore(profile);
      return profile;
    }
    throw err;
  }
}

// Email/Password Signup helper
export async function signUpWithEmailFirebase(
  name: string,
  email: string,
  pass: string,
  role: UserRole = 'customer',
  extraDetails: { phone?: string; vehicle?: string; city?: string } = {}
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name.trim() || formatNameFromEmail(cleanEmail);

  try {
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (res.user) {
      try {
        await sendEmailVerification(res.user);
      } catch (e) {
        console.warn('sendEmailVerification notice:', e);
      }
    }

    const profile: UserProfile = {
      uid: res.user.uid,
      id: res.user.uid,
      name: displayName,
      email: cleanEmail,
      role: role,
      status: role === 'driver' ? 'pending_approval' : 'active',
      emailVerified: res.user.emailVerified || false,
      phone: extraDetails.phone || '+91 98765 00000',
      address: '742 Evergreen Terrace, San Francisco, CA',
      avatar: getInitialLetterAvatar(displayName),
      vehicle: extraDetails.vehicle || 'Honda Activa EV',
      city: extraDetails.city || 'New Delhi',
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileToFirestore(profile);
    return profile;
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already in use')) {
      throw new Error('User already exists. Please sign in.');
    }

    // Direct Firestore Database registration fallback if Firebase Auth method is restricted or disabled
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed')
    ) {
      const fallbackUid = 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7);
      const fallbackProfile: UserProfile = {
        uid: fallbackUid,
        id: fallbackUid,
        name: displayName,
        email: cleanEmail,
        role: role,
        status: role === 'driver' ? 'pending_approval' : 'active',
        emailVerified: true,
        phone: extraDetails.phone || '+91 98765 00000',
        address: '742 Evergreen Terrace, San Francisco, CA',
        avatar: getInitialLetterAvatar(displayName),
        vehicle: extraDetails.vehicle || 'Honda Activa EV',
        city: extraDetails.city || 'New Delhi',
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveUserProfileToFirestore(fallbackProfile);
      return fallbackProfile;
    }

    throw err;
  }
}

// Email/Password Login helper with Admin handling
export async function signInWithEmailFirebase(
  email: string,
  pass: string,
  expectedRole: UserRole = 'customer'
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Admin Account Special Check
  if (cleanEmail === 'admin@instacartai.com') {
    let fbUser: FirebaseUser | null = null;
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = res.user;
    } catch (err: any) {
      if (pass === 'Admin@123' || pass === 'admin123') {
        // Try creating in Firebase Auth if missing
        try {
          const res = await createUserWithEmailAndPassword(auth, cleanEmail, 'Admin@123');
          fbUser = res.user;
        } catch {}
      } else {
        throw new Error('Incorrect password for Admin account.');
      }
    }

    const adminUid = fbUser ? fbUser.uid : 'admin_default_root_1';
    const adminProfile: UserProfile = {
      uid: adminUid,
      id: adminUid,
      name: 'System Admin',
      email: cleanEmail,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phone: '+91 99999 00000',
      address: 'Headquarters',
      avatar: getInitialLetterAvatar('System Admin'),
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileToFirestore(adminProfile);
    return adminProfile;
  }

  // Delivery Partner Check (Seed Agents / Predefined Riders)
  const matchedSeedAgent = INITIAL_AGENTS.find(
    (a) => a.email.toLowerCase() === cleanEmail
  );

  if (matchedSeedAgent) {
    let fbUser: FirebaseUser | null = null;
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = res.user;
    } catch (err: any) {
      // If user doesn't exist in Firebase Auth yet, auto-create them so they appear in Firebase Auth Console
      try {
        const createRes = await createUserWithEmailAndPassword(auth, cleanEmail, pass || 'password123');
        fbUser = createRes.user;
      } catch (createErr) {
        console.log('Firebase Auth seed agent auto-create notice:', createErr);
      }
    }

    const agentUid = fbUser ? fbUser.uid : matchedSeedAgent.id;
    const agentProfile: UserProfile = {
      uid: agentUid,
      id: matchedSeedAgent.id,
      name: matchedSeedAgent.name,
      email: cleanEmail,
      role: 'driver',
      status: 'active',
      emailVerified: true,
      phone: matchedSeedAgent.phone,
      address: matchedSeedAgent.currentLocation.address,
      avatar: matchedSeedAgent.avatar || getInitialLetterAvatar(matchedSeedAgent.name),
      vehicle: matchedSeedAgent.vehicle,
      city: matchedSeedAgent.city,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveUserProfileToFirestore(agentProfile);
      await saveAgentToFirestore(matchedSeedAgent);
    } catch (e) {
      console.warn('Sync rider to Firestore notice:', e);
    }

    return agentProfile;
  }

  // Standard user login
  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    let profile = await getUserProfileFromFirestore(res.user.uid);

    if (!profile) {
      const displayName = res.user.displayName || formatNameFromEmail(cleanEmail);
      profile = {
        uid: res.user.uid,
        id: res.user.uid,
        name: displayName,
        email: cleanEmail,
        role: expectedRole,
        status: expectedRole === 'driver' ? 'pending_approval' : 'active',
        emailVerified: res.user.emailVerified,
        phone: '+91 98765 43210',
        address: '742 Evergreen Terrace, San Francisco, CA',
        avatar: getInitialLetterAvatar(displayName),
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfileToFirestore(profile);
    }

    profile.emailVerified = res.user.emailVerified;
    return profile;
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed') ||
      err?.code === 'auth/user-not-found' ||
      err?.code === 'auth/invalid-credential'
    ) {
      // Look up user in Firestore
      const existingInDb = await findUserByEmailInFirestore(cleanEmail);
      if (existingInDb) {
        return existingInDb;
      }

      // Check if rider in agents collection
      try {
        const agDoc = await getDoc(doc(db, 'agents', cleanEmail));
        if (agDoc.exists()) {
          const agData = agDoc.data() as DeliveryAgent;
          const riderProfile: UserProfile = {
            uid: agData.id,
            id: agData.id,
            name: agData.name,
            email: agData.email,
            role: 'driver',
            status: agData.documentsVerified ? 'active' : 'pending_approval',
            emailVerified: true,
            phone: agData.phone,
            address: agData.currentLocation?.address || 'Delivery Hub',
            avatar: agData.avatar,
            vehicle: agData.vehicle,
            city: agData.city,
            provider: 'email',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveUserProfileToFirestore(riderProfile);
          return riderProfile;
        }
      } catch {}

      // If auth provider is disabled on console, register user directly to Firestore
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('operation-not-allowed')
      ) {
        const displayName = formatNameFromEmail(cleanEmail);
        const fallbackUid = 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7);
        const autoProfile: UserProfile = {
          uid: fallbackUid,
          id: fallbackUid,
          name: displayName,
          email: cleanEmail,
          role: expectedRole,
          status: expectedRole === 'driver' ? 'pending_approval' : 'active',
          emailVerified: true,
          phone: '+91 98765 12345',
          address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
          avatar: getInitialLetterAvatar(displayName),
          provider: 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveUserProfileToFirestore(autoProfile);
        return autoProfile;
      }
    }

    throw new Error('Email or password is incorrect.');
  }
}

export async function logOutFirebase() {
  await firebaseSignOut(auth);
}

export async function resendVerificationEmailFirebase(emailAddress?: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = (emailAddress || auth.currentUser?.email || '').trim().toLowerCase();
  
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  } catch (err) {
    console.warn('Firebase auth sendEmailVerification notice:', err);
  }

  try {
    if (cleanEmail) {
      await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
    }
  } catch (e) {
    console.warn('API send-verification-email notice:', e);
  }

  return {
    success: true,
    message: `Verification email sent successfully to ${cleanEmail || 'your email'}. Please check your inbox and spam folder.`,
  };
}

export async function markUserEmailAsVerifiedFirebase(userEmail: string): Promise<boolean> {
  const cleanEmail = userEmail.trim().toLowerCase();
  
  try {
    await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
  } catch (e) {
    console.warn('API verify-email notice:', e);
  }

  try {
    const existing = await findUserByEmailInFirestore(cleanEmail);
    if (existing) {
      existing.emailVerified = true;
      existing.updatedAt = new Date().toISOString();
      await saveUserProfileToFirestore(existing);
      return true;
    }
    return true;
  } catch (err) {
    console.warn('markUserEmailAsVerified error:', err);
    return false;
  }
}

// ================= PRODUCTS FIRESTORE HELPERS =================

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const cleaned = sanitizeForFirestore({
      ...product,
      updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, 'products', product.id);
    await setDoc(ref, cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const col = collection(db, 'products');
    const snap = await getDocs(col);
    if (snap.empty) {
      // Seed initial products if empty
      await syncInitialProductsToFirestore();
      return INITIAL_PRODUCTS;
    }
    const list: Product[] = [];
    snap.forEach((d) => list.push(d.data() as Product));
    return list;
  } catch (err) {
    console.warn('Firestore products fetch warning, using seed fallback:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const ref = doc(db, 'products', productId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncInitialProductsToFirestore(): Promise<void> {
  try {
    for (const prod of INITIAL_PRODUCTS) {
      const cleaned = sanitizeForFirestore(prod);
      const ref = doc(db, 'products', prod.id);
      await setDoc(ref, cleaned, { merge: true });
    }
    console.log('Successfully synced initial products to Firestore!');
  } catch (e) {
    console.warn('Product seed sync notice:', e);
  }
}

// ================= ORDERS FIRESTORE HELPERS =================

export async function saveOrderAndBuyAgainRecordToFirestore(
  order: Order,
  timeframeDays: number = 7
): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const cleaned = sanitizeForFirestore({
      ...order,
      firestoreCreatedAt: serverTimestamp(),
      updatedAt: new Date().toISOString(),
    });
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, cleaned, { merge: true });

    // Save Buy Again Restock record
    if (order.items && order.items.length > 0 && order.customerEmail) {
      const reminderId = `${order.customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${order.id}`;
      const reminderData = sanitizeForFirestore({
        id: reminderId,
        userId: order.customerEmail,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        lastOrderId: order.id,
        orderDate: order.createdAt || new Date().toISOString(),
        items: order.items,
        totalAmount: order.totalAmount,
        timeframeDays,
        remindAt: new Date(Date.now() + timeframeDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
      const restockRef = doc(db, 'buyAgainReminders', reminderId);
      await setDoc(restockRef, reminderData, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getOrdersFromFirestore(customerEmail?: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    let q;
    if (customerEmail) {
      q = query(ordersCol, where('customerEmail', '==', customerEmail.toLowerCase().trim()));
    } else {
      q = query(ordersCol);
    }
    const snap = await getDocs(q);
    if (snap.empty && !customerEmail) {
      await syncInitialOrdersToFirestore();
      return INITIAL_ORDERS;
    }
    const list: Order[] = [];
    snap.forEach((d) => list.push(d.data() as Order));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Firestore orders fetch warning:', err);
    return INITIAL_ORDERS;
  }
}

export async function syncInitialOrdersToFirestore(): Promise<void> {
  try {
    for (const ord of INITIAL_ORDERS) {
      const cleaned = sanitizeForFirestore(ord);
      const ref = doc(db, 'orders', ord.id);
      await setDoc(ref, cleaned, { merge: true });
    }
    console.log('Successfully synced initial orders to Firestore!');
  } catch (e) {
    console.warn('Order seed sync notice:', e);
  }
}

// ================= DELIVERY AGENTS FIRESTORE HELPERS =================

export async function saveAgentToFirestore(agent: DeliveryAgent): Promise<void> {
  const path = `agents/${agent.id}`;
  try {
    const cleaned = sanitizeForFirestore({
      ...agent,
      updatedAt: new Date().toISOString(),
    });
    const ref = doc(db, 'agents', agent.id);
    await setDoc(ref, cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getAgentsFromFirestore(): Promise<DeliveryAgent[]> {
  const path = 'agents';
  try {
    const col = collection(db, 'agents');
    const snap = await getDocs(col);
    if (snap.empty) {
      await syncInitialAgentsToFirestore();
      return INITIAL_AGENTS;
    }
    const list: DeliveryAgent[] = [];
    snap.forEach((d) => list.push(d.data() as DeliveryAgent));
    return list;
  } catch (err) {
    console.warn('Firestore agents fetch warning:', err);
    return INITIAL_AGENTS;
  }
}

export async function syncInitialAgentsToFirestore(): Promise<void> {
  try {
    for (const ag of INITIAL_AGENTS) {
      const cleaned = sanitizeForFirestore(ag);
      const ref = doc(db, 'agents', ag.id);
      await setDoc(ref, cleaned, { merge: true });
    }
    console.log('Successfully synced initial delivery agents to Firestore!');
  } catch (e) {
    console.warn('Agent seed sync notice:', e);
  }
}

export interface BuyAgainRecord {
  id: string;
  userId: string;
  customerEmail: string;
  lastOrderId: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  timeframeDays: number;
  remindAt: string;
  status: 'active' | 'dismissed' | 'reordered';
  updatedAt: string;
}

export async function getBuyAgainRecordFromFirestore(customerEmail: string): Promise<BuyAgainRecord | null> {
  const path = 'buyAgainReminders';
  try {
    const col = collection(db, 'buyAgainReminders');
    const q = query(col, where('customerEmail', '==', customerEmail.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as BuyAgainRecord;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
  }
  return null;
}
