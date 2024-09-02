import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from '@clerk/nextjs/server'; 

export async function POST(req) {
    try {
        // Fetch current user using Clerk's getAuth method
        const { userId } = await getAuth(req);

        console.log("Retrieved User ID:", userId);

        if (!userId) {
            console.error("User is not authenticated");
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { jobDescription } = await req.json();

        console.log("Received Job Description:", jobDescription);

        if (!jobDescription) {
            console.error("Job description is missing");
            return NextResponse.json({ message: 'Job description is required' }, { status: 400 });
        }

        console.log("Attempting to add document to Firestore...");
        const docRef = await addDoc(collection(db, 'jobDescriptions'), {
            userId,
            jobDescription,
            createdAt: new Date(),
        });

        console.log("Document successfully added with ID:", docRef.id);
        return NextResponse.json({ message: 'Job description saved successfully', id: docRef.id }, { status: 200 });
    } catch (error) {
        console.error('Error adding document:', error);
        return NextResponse.json({ message: 'Error saving job description', error }, { status: 500 });
    }
}
