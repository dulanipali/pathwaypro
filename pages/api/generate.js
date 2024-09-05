import OpenAI from 'openai';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';  // Ensure Firebase is imported

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { jobDescription, resumeText, documentId } = req.body;  // Accept the document ID

        if (!jobDescription || !resumeText || !documentId) {
            return res.status(400).json({ error: 'Job description, resume text, and document ID are required' });
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create a completion request to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: `You are a resume expert. Provide specific resume improvement tips. About 6-10 tips.` },
                { role: 'user', content: `Job Description: ${jobDescription}\nResume Text: ${resumeText}\nProvide specific tips on how this resume can be improved to better match the job description.` }
            ],
        });

        // Split the tips and clean up the text
        let tips = completion.choices[0].message.content.split('\n').filter(tip => tip.trim());

        // Remove any numbering and **bold** syntax
        tips = tips.map(tip => tip.replace(/^\d+\.\s*/, '').replace(/\*\*/g, ''));

        // Logging the tips to the console for debugging
        console.log("Generated Tips:", tips);

        if (tips.length === 0) {
            return res.status(200).json({ tips: ["No tips were generated."] });
        }

        // Update the Firestore document with the generated tips
        const docRef = doc(db, 'resumes', documentId);  // Get the document reference
        await updateDoc(docRef, { tips });

        // Send back the generated tips
        return res.status(200).json({ tips });
    } catch (error) {
        console.error('Error generating resume tips:', error);
        return res.status(500).json({ error: 'Failed to generate resume tips' });
    }
}
