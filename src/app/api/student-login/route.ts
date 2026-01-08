import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Student } from '@/lib/types';


let adminApp: App;
if (!getApps().length) {
    // This will use Application Default Credentials in a GCP environment.
    adminApp = initializeApp();
} else {
  adminApp = getApps()[0]!;
}

const firestore = getFirestore(adminApp);

export async function POST(req: NextRequest) {
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

    // In a real app, passwords should be hashed. This is a simple comparison for demonstration.
    if (studentData.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send the password back to the client
    const { password: _, ...studentInfo } = studentData;

    // Set a session cookie or token here for subsequent requests
    // For simplicity, we are returning student info. In a real app, use a secure session mechanism.
    return NextResponse.json({ success: true, student: studentInfo }, { status: 200 });

  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
