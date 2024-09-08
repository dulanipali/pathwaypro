// File: /pages/api/generate-interview-questions.js

import OpenAI from 'openai';

export default async function handler(req, res) {
    try {
        // Check if the request method is POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Extract job description from the request body
        const { jobDescription } = req.body;

        // Validate required fields
        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        // Initialize OpenAI client with the API key from environment variables
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create a completion request to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: `You are an expert interview question generator.` },
                { role: 'user', content: `Based on the following job description, generate a list of relevant interview questions for a candidate:\n\nJob Description: ${jobDescription}` }
            ],
        });

        // Extract and clean the generated questions
        let questions = completion.choices[0].message.content.split('\n').filter(question => question.trim());

        // Remove numbering or unnecessary symbols
        questions = questions.map(question => question.replace(/^\d+\.\s*/, '').replace(/\*\*/g, ''));

        // Logging the questions to the console for debugging
        console.log("Generated Questions:", questions);

        if (questions.length === 0) {
            return res.status(200).json({ questions: ["No questions were generated."] });
        }

        // Send back the generated questions
        return res.status(200).json({ questions });
    } catch (error) {
        console.error('Error generating interview questions:', error);
        return res.status(500).json({ error: 'Failed to generate interview questions' });
    }
}