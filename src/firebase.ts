// Mock Firebase for Demo Purposes
export const auth = {
  currentUser: null as any,
  signOut: async () => {
    auth.currentUser = null;
    if (authUpdateListener) authUpdateListener(null);
  }
};

let authUpdateListener: ((user: any) => void) | null = null;

export const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  authUpdateListener = callback;
  callback(auth.currentUser);
  return () => { authUpdateListener = null; };
};

export const signInWithPopup = async (authInstance: any, provider: any) => {
  const mockUser = {
    uid: 'demo-user-123',
    email: 'demo@techintel.ai',
    displayName: 'Demo User',
    photoURL: 'https://picsum.photos/seed/demo/200/200',
    emailVerified: true,
    providerData: []
  };
  auth.currentUser = mockUser;
  if (authUpdateListener) authUpdateListener(mockUser);
  return { user: mockUser };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  const mockUser = {
    uid: 'demo-user-123',
    email: email,
    displayName: email.split('@')[0],
    photoURL: 'https://picsum.photos/seed/demo/200/200',
    emailVerified: true,
    providerData: []
  };
  auth.currentUser = mockUser;
  if (authUpdateListener) authUpdateListener(mockUser);
  return { user: mockUser };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  const mockUser = {
    uid: 'demo-user-123',
    email: email,
    displayName: email.split('@')[0],
    photoURL: 'https://picsum.photos/seed/demo/200/200',
    emailVerified: true,
    providerData: []
  };
  auth.currentUser = mockUser;
  if (authUpdateListener) authUpdateListener(mockUser);
  return { user: mockUser };
};

export const updateProfile = async (user: any, data: any) => {
  if (auth.currentUser) {
    auth.currentUser.displayName = data.displayName;
    if (authUpdateListener) authUpdateListener(auth.currentUser);
  }
};

export const googleProvider = {};
export const db = {} as any;

// Mock Firestore functions
export const collection = (...args: any[]) => ({});
export const doc = (...args: any[]) => ({});
export const setDoc = async (...args: any[]) => {};
export const getDoc = async (...args: any[]) => ({ exists: () => false, data: () => ({}) });
export const addDoc = async (...args: any[]) => ({ id: 'mock-id' });
export const query = (...args: any[]) => ({});
export const where = (...args: any[]) => ({});
export const orderBy = (...args: any[]) => ({});
export const onSnapshot = (ref: any, callback: any) => {
  // Simulate fetching history for demo user
  if (auth.currentUser?.uid === 'demo-user-123') {
    setTimeout(() => {
      callback({
        docs: [
          {
            id: 'demo-1',
            data: () => ({
              technology: 'Quantum Computing',
              trl: 4,
              hypeCycle: 'Innovation Trigger',
              timestamp: { toDate: () => new Date(Date.now() - 86400000) },
              summary: 'Quantum computing uses quantum-mechanical phenomena such as superposition and entanglement to perform computation.'
            })
          },
          {
            id: 'demo-2',
            data: () => ({
              technology: 'Solid-State Batteries',
              trl: 6,
              hypeCycle: 'Peak of Inflated Expectations',
              timestamp: { toDate: () => new Date(Date.now() - 172800000) },
              summary: 'Solid-state batteries use solid electrodes and a solid electrolyte, instead of the liquid or polymer gel electrolytes found in lithium-ion batteries.'
            })
          },
          {
            id: 'demo-3',
            data: () => ({
              technology: 'Generative AI',
              trl: 8,
              hypeCycle: 'Plateau of Productivity',
              timestamp: { toDate: () => new Date(Date.now() - 259200000) },
              summary: 'Generative AI refers to artificial intelligence systems capable of generating text, images, or other media in response to prompts.'
            })
          }
        ]
      });
    }, 500);
  } else {
    callback({ docs: [] });
  }
  return () => {};
};
export const Timestamp = { now: () => new Date() };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn('Mock Firestore Error (Demo Mode):', error);
}

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
