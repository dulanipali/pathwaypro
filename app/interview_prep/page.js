'use client'
import { useEffect, useState } from 'react';
import Layout from "../propathway_layout";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import axios from 'axios';
import { useSearchParams } from 'next/navigation'; // Import hook to read URL parameters

export default function Calendar() {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const searchParams = useSearchParams();
    const jobDescription = searchParams.get('jobDescription'); // Get job description from query params

    useEffect(() => {
        if (jobDescription) {
            fetchQuestions(jobDescription);
        }
    }, [jobDescription]);

    // Fetch interview questions based on job description
    const fetchQuestions = async (jobDescription) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-interview-questions', {
                jobDescription,
            });
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Failed to fetch interview questions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-around"
                alignItems="center"
                sx={{
                    width: '80%',
                    maxWidth: '800px',
                    border: '2px solid #0055A4',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    padding: '20px',
                }}
            >
                <Box
                    sx={{
                        padding: '20px',
                        width: '50%',
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    <Typography variant="h3">Can you answer these questions?</Typography>
                    <Button variant="contained">Study</Button>
                    <Button variant="contained">Test</Button>
                </Box>
                <Box
                    sx={{
                        backgroundColor: '#1A202C',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '45%',
                        textAlign: 'center',
                        color: 'white',
                        border: '2px solid #EB5E28',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Interview Questions
                    </Typography>
                    {loading ? (
                        <CircularProgress sx={{ color: 'white' }} />
                    ) : (
                        <ul style={{ textAlign: 'left', padding: 0, listStyleType: 'none', color: 'white' }}>
                            {questions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                        </ul>
                    )}
                </Box>
            </Box>
            
        </Layout>
    );
}