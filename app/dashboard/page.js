'use client';
import { useState } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { ContentCopy } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase';  // Import Firebase

export default function DashboardPage() {
    const { user } = useUser();
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const saveResumeToFirebase = async (resumeText, jobDescription) => {
        try {
            const docRef = await addDoc(collection(db, 'resumes'), {
                userId: user?.id,
                resumeText,
                jobDescription,
                createdAt: new Date()
            });
            console.log("Resume and job description saved to Firebase with ID:", docRef.id);
            return docRef;  // Return the document reference
        } catch (error) {
            console.error("Error saving resume and job description to Firebase:", error);
            throw error;
        }
    };
    
    
    const generateTips = async () => {
        if (!resumeText || !jobDescription) {
            alert("Please enter a job description and paste your resume text.");
            return;
        }
    
        // Save both resume text and job description to Firebase and get the document reference
        const docRef = await saveResumeToFirebase(resumeText, jobDescription);
    
        const formData = {
            jobDescription,
            resumeText,
            documentId: docRef.id  // Pass the document ID to the API
        };
    
        try {
            setLoading(true);
            const response = await axios.post('/api/generate', formData);
            setLoading(false);
    
            const tips = response.data.tips;
            if (tips) {
                router.push(`/resume_tips?tips=${encodeURIComponent(JSON.stringify(tips))}`);
            } else {
                alert("No tips were generated. Please try again.");
            }
        } catch (error) {
            console.error('Failed to generate tips:', error);
            setLoading(false);
        }
    };
    
    

    return (
        <Layout>
            <Typography variant="h4" sx={{ color: 'white', fontFamily: "'Lato', sans-serif", mb: 4 }}>
                Hi {user?.firstName}, Welcome to ProPathway!
            </Typography>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ width: '80%', maxWidth: '800px', mx: 'auto' }}
            >
                <Box
                    sx={{
                        backgroundColor: '#1A202C',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        border: '2px solid #EB5E28',
                        mb: 4
                    }}
                >
                    <ContentCopy sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Paste your job description here
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
                    />
                </Box>
                <Box
                    sx={{
                        backgroundColor: '#1A202C',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        border: '2px solid #0055A4',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Paste your resume text here
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        variant="outlined"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
                    />
                </Box>
            </Box>
            <Button
                variant="contained"
                color="info"
                sx={{ mt: 4 }}
                onClick={generateTips}
                disabled={loading}
            >
                {loading ? 'Generating Tips...' : 'Generate Resume Tips'}
            </Button>
        </Layout>
    );
}
