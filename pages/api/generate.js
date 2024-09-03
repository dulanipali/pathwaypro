import OpenAI from 'openai';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { jobDescription, resumeText } = req.body;

        if (!jobDescription || !resumeText) {
            return res.status(400).json({ error: 'Job description and resume text are required' });
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create a completion request to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: `You are a resume expert. Provide specific resume improvement tips. Only a few short sentences.` },
                { role: 'user', content: `Job Description: ${jobDescription}\nResume Text: ${resumeText}\nProvide specific tips on how this resume can be improved to better match the job description.` }
            ],
        });

        const tips = completion.choices[0].message.content.split('\n').filter(tip => tip.trim());

        // Logging the tips to the console for debugging
        console.log("Generated Tips:", tips);

        if (tips.length === 0) {
            return res.status(200).json({ tips: ["No tips were generated."] });
        }

        // Send back the generated tips
        return res.status(200).json({ tips });
    } catch (error) {
        console.error('Error generating resume tips:', error);
        return res.status(500).json({ error: 'Failed to generate resume tips' });
    }
}
