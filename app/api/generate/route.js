import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(req) {
    try {
        const { jobDescription, resume } = await req.json();

        if (!jobDescription || !resume) {
            return NextResponse.json({ error: 'Job description and resume are required' }, { status: 400 });
        }

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY, // Ensure you have this in your .env.local file
        });
        const openai = new OpenAIApi(configuration);

        const prompt = `I have the following job description: ${jobDescription}\nAnd this resume: ${resume}\nCan you provide specific tips on how this resume can be improved to better match the job description?`;

        const response = await openai.createCompletion({
            model: "gpt-4", 
            prompt,
            max_tokens: 500,
        });

        const tips = response.data.choices[0].text.trim();

        return NextResponse.json({ tips }, { status: 200 });
    } catch (error) {
        console.error('Error generating resume tips:', error);
        return NextResponse.json({ error: 'Failed to generate resume tips' }, { status: 500 });
    }
}
