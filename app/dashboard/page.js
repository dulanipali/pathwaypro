'use client'
import { useState } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { ContentCopy, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user } = useUser();
    const [jobDescription, setJobDescription] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSaveDescription = async () => {
        try {
            const response = await axios.post('/api/jobdescription', {
                jobDescription,
                userId: user.id,
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Failed to save job description');
        }
    };

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <Layout>
            <Typography variant="h4" sx={{ color: 'white', fontFamily: "'Lato', sans-serif", mb: 4 }}>
                Hi {user?.firstName}, Welcome to ProPathway!
            </Typography>
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
                    <ContentCopy sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        [Paste your job description here]
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
                    <Button variant="contained" color="warning" sx={{ mt: 2 }} onClick={handleSaveDescription}>
                        Save Description
                    </Button>
                    {message && (
                        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                            {message}
                        </Typography>
                    )}
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
                    <CloudUpload sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Upload your resume here
                    </Typography>
                    <Button
                        variant="contained"
                        color="info"
                        sx={{ mt: 2 }}
                        onClick={() => handleNavigation('/resume_tips')}
                    >
                        Optimize Resume
                    </Button>
                </Box>
            </Box>
        </Layout>
    );
}
