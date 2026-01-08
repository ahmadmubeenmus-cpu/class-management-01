'use server';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Student } from '@/lib/types';

// Helper function to initialize Firebase Admin SDK
function getAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0]!;
    }
    return initializeApp();
}

export async function POST(req: NextRequest) {
  const adminApp = getAdminApp();
  const firestore = getFirestore(adminApp);

  try {
    const { uid, password } = await req.json();

    if (!uid || !password) {
      return NextResponse.json({ error: 'UID and password are required' }, { status: 400 });
    }

    const studentsRef = firestore.collection('students');
    const querySnapshot = await studentsRef.where('uid', '==', uid).limit(1).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const studentDoc = querySnapshot.docs[0];
    const studentData = studentDoc.data() as Student;

    // NOTE: This is a simple string comparison. In a real-world production app,
    // you should use a secure hashing library (like bcrypt) to store and compare passwords.
    if (studentData.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...studentInfo } = studentData;

    return NextResponse.json({ success: true, student: studentInfo }, { status: 200 });

  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
