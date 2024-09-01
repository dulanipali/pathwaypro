'use client';
import { AppBar, Typography, Container, Button, Toolbar, Box, CssBaseline } from '@mui/material';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
                justifyContent: 'center',  
                alignItems: 'center',  
            }}
        >
            <CssBaseline />

            {/* Changed to dark blue */}
            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                <Toolbar>
                    {/* Text color changed to white */}
                    <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif', color: 'white' }}>
                        ProPathway
                    </Typography>
                    <Link href="/sign-up" passHref> 
                        <Button
                            color="inherit"
                            sx={{
                                mx: 1,
                                color: 'white',
                                '&:hover': { backgroundColor: '#0055A4' }, 
                                transition: 'background-color 0.3s ease',
                                borderRadius: '20px',
                                fontFamily: "'Lato', sans-serif",
                            }}
                        >
                            Sign Up
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 8, flexGrow: 1, width: '100%' }}
            >
                {/* Text color changed to white */}
                <Typography variant="h4" sx={{ color: 'white', mb: 4, fontFamily: "'Lato', sans-serif" }}>
                    Sign In
                </Typography>
                <Box
                    sx={{
                        backgroundColor: '#1A202C', 
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        maxWidth: '400px',
                        display: 'flex',
                        justifyContent: 'center', 
                    }}
                >
                    <SignIn afterSignInUrl="/dashboard" /> 
                </Box>
            </Box>
        </Container>
    );
}
