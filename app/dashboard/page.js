'use client'
import { useState } from 'react';
import { AppBar, Typography, Container, Toolbar, Box, CssBaseline, Button, IconButton, TextField } from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { ContentCopy, CloudUpload, Logout } from '@mui/icons-material';
import axios from 'axios';

export default function DashboardPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [jobDescription, setJobDescription] = useState('');
    const [message, setMessage] = useState('');

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

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                backgroundColor: '#0A1128',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CssBaseline />

            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif', color: 'white' }}>
                        ProPathway
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => signOut()}
                        sx={{
                            ml: 2,
                            color: 'white',
                        }}
                    >
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ flexGrow: 1, mt: 4 }}
            >
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
                        <Button variant="contained" color="info" sx={{ mt: 2 }}>
                            Optimize Resume
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
