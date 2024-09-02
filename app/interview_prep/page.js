'use client'
import Layout from "../propathway_layout";
import { Box, Typography, Button } from "@mui/material";

export default function Calendar() {
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
                        //backgroundColor: '#1A202C',
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
                >   <Typography variant="h6" sx={{ mb: 2 }}>
                        Interview Questions
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
        </Layout >
    )
}