'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, CssBaseline } from "@mui/material";
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@clerk/nextjs'; // Import Clerk's useAuth hook
import { useRouter } from 'next/navigation'; // Import useRouter to programmatically navigate

export default function Home() {
    const { isSignedIn } = useAuth(); // Check if the user is signed in
    const router = useRouter(); // Use router for programmatic navigation

    const handleGetStarted = () => {
        if (isSignedIn) {
            router.push('/dashboard'); // If user is signed in, navigate to assistant page
        } else {
            router.push('/sign-in'); // If user is not signed in, navigate to sign-in page
        }
    }

    return (
        <Container
            maxWidth={false}
            sx={{
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                margin: 0,
                overflowX: 'hidden',
            }}
        >
            <Head>
                <title>ProPathway</title>
                <meta name="description" content="Rate my professor assistant for professor recommendations" />
                <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
            </Head>

            <CssBaseline />

            <AppBar
                position="static"
                sx={{
                    backgroundColor: '#0A1128', // Changed to dark blue
                    boxShadow: 'none',
                    minWidth: '100vw',
                }}
            >
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', fontFamily: "'Lato', sans-serif" }}>
                        ProPathway
                    </Typography>
                    <Link href="/sign-in" passHref>
                        <Button sx={{
                            mx: 1,
                            color: 'white',
                            '&:hover': { backgroundColor: '#0055A4' }, // Changed hover color to a blue shade
                            transition: 'background-color 0.3s ease',
                            borderRadius: '20px',
                        }}>Login</Button>
                    </Link>
                    <Link href="/sign-up" passHref>
                        <Button
                            sx={{
                                mx: 1,
                                color: 'white',
                                '&:hover': { backgroundColor: '#0055A4' }, // Changed hover color to a blue shade
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
                sx={{
                    flexGrow: 1,
                    flexDirection: 'column',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflowX: 'hidden',
                    width: '100vw',
                    height: '100vh',
                    padding: 0,
                    margin: 0,
                }}
            >
                <Box sx={{
                    backgroundColor: '#0A1128', // Changed to dark blue
                    width: '100vw',
                    height: '100vh',
                    py: 8,
                    px: 4,
                    margin: 0,
                }}>
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            animation: `fadeIn 2s ease`,
                            fontFamily: "'Lato', sans-serif",
                            color: 'white', // Changed text color to white for visibility
                        }}
                    >
                        ProPathway
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 4,
                            fontFamily: "'Lato', sans-serif",
                            color: 'white', // Changed text color to white for visibility
                        }}
                    >
                     
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#FF6F42', // Keeping this color for contrast
                            '&:hover': { backgroundColor: '#EB5E28' }, // Darker shade for hover
                            fontSize: '1.2rem',
                            px: 4,
                            py: 1,
                            borderRadius: '20px',
                            fontFamily: "'Lato', sans-serif",
                        }}
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </Box>
            </Box>
            <Box
                sx={{
                    backgroundColor: '#0A1128', // Changed to dark blue
                    color: '#fff',
                    py: 2,
                    textAlign: 'center',
                    minWidth: '100vw',
                    margin: 0,
                }}
            >
                <Typography variant="body2">
                    © 2024 ProPathway. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
}
