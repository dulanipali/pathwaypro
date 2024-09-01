import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from '@clerk/nextjs/server'; // Import the correct method

export async function POST(req) {
    try {
        // Fetch current user using Clerk's getAuth method
        const { userId } = await getAuth(req);

        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { jobDescription } = await req.json();

        if (!jobDescription) {
            return NextResponse.json({ message: 'Job description is required' }, { status: 400 });
        }

        const docRef = await addDoc(collection(db, 'jobDescriptions'), {
            userId,
            jobDescription,
            createdAt: new Date(),
        });

        return NextResponse.json({ message: 'Job description saved successfully', id: docRef.id }, { status: 200 });
    } catch (error) {
        console.error('Error adding document:', error);
        return NextResponse.json({ message: 'Error saving job description', error }, { status: 500 });
    }
}
