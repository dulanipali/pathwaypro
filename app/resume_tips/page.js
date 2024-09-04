'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import Layout from '../propathway_layout';
import { useState, useEffect } from 'react';

export default function ResumeTipsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tips, setTips] = useState([]);

    useEffect(() => {
        const tipsParam = searchParams.get('tips');
        if (tipsParam) {
            const decodedTips = JSON.parse(decodeURIComponent(tipsParam));
            console.log("Parsed Tips:", decodedTips);
            setTips(decodedTips);
        } else {
            console.log("No tips found in query");
        }
    }, [searchParams]);

    const handleInterviewPrep = () => {
        router.push('/interview_prep');
    };

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 4 }}>
                <Box
                    sx={{
                        width: '80%',
                        backgroundColor: '#0A1128',
                        p: 3,
                        borderRadius: '10px',
                        border: '2px solid #FF6F42',  // Border color to match your design
                    }}
                >
                    <Typography variant="h5" sx={{ color: '#FF6F42', mb: 2, textAlign: 'center' }}>Tips</Typography>
                    {tips && tips.length > 0 ? (
                        <Box component="ul" sx={{ pl: 2, color: 'white' }}>
                            {tips.map((tip, index) => (
                                <Typography
                                    key={index}
                                    component="li"
                                    variant="body1"
                                    sx={{
                                        color: 'white',
                                        mb: 1,
                                    }}
                                >
                                    {tip}
                                </Typography>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            No tips available.
                        </Typography>
                    )}
                </Box>
                <Button variant="contained" color="primary" onClick={handleInterviewPrep} sx={{ mt: 4 }}>
                    Interview Prep
                </Button>
            </Box>
        </Layout>
    );
}