'use client';

import { AppBar, Typography, Container, Button, Toolbar, Box } from '@mui/material';
import Link from 'next/link';
import { SignUp, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpPage() {
    const router = useRouter();
    const { isLoaded, signUp } = useSignUp();

    useEffect(() => {
        if (isLoaded && signUp) {
            if (signUp.status === 'complete') {
                router.push('/dashboard');
            }
        }
    }, [isLoaded, signUp, router]);

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                backgroundColor: '#0A1128', // Changed to dark blue
                padding: '0',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Changed to dark blue */}
            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                <Toolbar>
                    {/* Text color changed to white */}
                    <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif', color: 'white' }}>
                        ProPathway
                    </Typography>
                    <Link href="/sign-in" passHref>
                        <Button
                            sx={{
                                mx: 1,
                                color: 'white',
                                '&:hover': { backgroundColor: '#0055A4' }, // Changed to a lighter shade of blue
                                transition: 'background-color 0.3s ease',
                                borderRadius: '20px',
                                fontFamily: "'Lato', sans-serif",
                            }} >Login</Button>
                    </Link>
                </Toolbar>
            </AppBar>

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 8, flexGrow: 1 }}
            >
                {/* Changed text color to white for visibility */}
                <Typography variant="h4" sx={{ color: 'white', mb: 4, fontFamily: "'Lato', sans-serif" }}>
                    Sign Up
                </Typography>
                <Box
                    sx={{
                        backgroundColor: '#1A202C', // Changed to a lighter shade of blue
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <SignUp
                        path="/sign-up"
                        routing="path"
                        signInUrl="/sign-in"
                        afterSignUpUrl="/dashboard"  // Redirects to the Free Dashboard
                    />
                </Box>
            </Box>
        </Container>
    );
}
