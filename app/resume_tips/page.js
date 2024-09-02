'use client'
import { useState } from 'react';
import Layout from "../propathway_layout";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from 'next/navigation';

export default function ResumeTips() {
    const [tips, setTips] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGetTips = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobDescription: 'Your saved job description here', // Fetch from your saved data
                    resume: 'Your uploaded resume content here', // Fetch from your saved data
                }),
            });

            const data = await response.json();
            setTips(data.tips || 'No tips available');
        } catch (error) {
            console.error('Failed to fetch resume tips:', error);
            setTips('Failed to fetch resume tips');
        }
        setLoading(false);
    };

    return (
        <Layout>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-around"
                alignItems="center"
                sx={{ width: '80%', maxWidth: '800px' }}
            >
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
                    Uploaded Resume Displayed here
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
                        border: '2px solid #0055A4',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Resume Tips
                    </Typography>
                    {loading ? (
                        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                            Generating tips...
                        </Typography>
                    ) : (
                        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                            {tips}
                        </Typography>
                    )}
                    <Button variant="contained" color="info" sx={{ mt: 2 }} onClick={handleGetTips}>
                        Get Resume Tips
                    </Button>
                </Box>
            </Box>
            <Button
                variant="contained"
                color="info"
                sx={{ mt: 2, margin: '40px' }}
                onClick={() => handleNavigation('/interview_prep')}
            >
                Interview Prep
            </Button>
        </Layout>
    );
}
