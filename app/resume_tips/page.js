'use client'
import Layout from "../propathway_layout";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from 'next/navigation';


export default function ResumeTips() {
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
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
                >   <Typography variant="h6" sx={{ mb: 2 }}>
                        Resume Tips
                    </Typography>
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
    )
}