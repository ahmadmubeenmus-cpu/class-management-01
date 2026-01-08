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


// Helper function to initialize Firebase Admin SDK
function getAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0]!;
    }
    return initializeApp();
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
    const adminApp = getAdminApp();
    const auth = getAuth(adminApp);
    const firestore = getFirestore(adminApp);

    try {
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
        // If user not in Auth, still try to delete from Firestore
        try {
            const userDocRef = firestore.collection('users').doc(userId);
            await userDocRef.delete();
            return {
                success: true,
                message: `User not found in Authentication, but deleted from Firestore.`,
            };
        } catch (dbError) {
             errorMessage = "User not found in Auth, and failed to delete from Firestore.";
        }

      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // We must throw an error to signal failure to the caller
      throw new Error(errorMessage);
    }
  }
);
