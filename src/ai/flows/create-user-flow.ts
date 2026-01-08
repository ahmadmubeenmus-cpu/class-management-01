'use server';
/**
 * @fileOverview A secure flow for creating new users.
 * This flow should be called from the client-side to securely create a Firebase
 * Authentication user and their corresponding Firestore document.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}


const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  permissions: z.object({
    canMarkAttendance: z.boolean(),
    canViewRecords: z.boolean(),
    canViewDashboard: z.boolean(),
  }),
});

const CreateUserOutputSchema = z.object({
  uid: z.string(),
  success: z.boolean(),
  message: z.string().optional(),
});

export async function createUser(input: z.infer<typeof CreateUserInputSchema>): Promise<z.infer<typeof CreateUserOutputSchema>> {
  return createUserFlow(input);
}

const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    const auth = getAuth(adminApp);
    const firestore = getFirestore(adminApp);

    try {
      // 1. Create the user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: input.email,
        password: input.password,
        displayName: `${input.firstName} ${input.lastName}`,
      });

      const uid = userRecord.uid;

      // 2. Create the user document in Firestore
      const userDocRef = firestore.collection('users').doc(uid);
      await userDocRef.set({
        id: uid,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.email,
        role: 'user',
        permissions: input.permissions,
      });

      return {
        uid,
        success: true,
      };
    } catch (error: any) {
      // We are re-throwing the error to surface it in the client toast
       if (error.code === 'auth/email-already-exists') {
        throw new Error('A user with this email already exists.');
      }
      throw new Error(error.message || 'An unknown error occurred during user creation.');
    }
  }
);
