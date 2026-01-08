'use server';
/**
 * @fileoverview A server-side flow for securely deleting a user from Firebase.
 * This flow handles deleting the user from both Firebase Authentication and their
 * corresponding document in the Firestore 'users' collection.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Define the input schema for the deleteUser flow
export const DeleteUserInputSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

// Define the output schema for the deleteUser flow
export const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


// Initialize Firebase Admin SDK if it hasn't been already.
// This ensures we have a single, configured instance.
let adminApp: App;
if (!getApps().length) {
    adminApp = initializeApp();
} else {
    adminApp = getApps()[0]!;
}


// Exported wrapper function to be called from the client
export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  return deleteUserFlow(input);
}


const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
  },
  async (input) => {
    const { userId } = input;

    try {
      const auth = getAuth(adminApp);
      const firestore = getFirestore(adminApp);

      // Step 1: Delete the user from Firebase Authentication
      await auth.deleteUser(userId);

      // Step 2: Delete the user's document from Firestore if it exists
      const userDocRef = firestore.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      if(userDoc.exists) {
        await userDocRef.delete();
      }

      return {
        success: true,
        message: `Successfully deleted user ${userId}.`,
      };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An unexpected error occurred while deleting the user.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found in Firebase Authentication. They may have already been deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
);
