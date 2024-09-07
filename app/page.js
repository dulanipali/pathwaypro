'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, CssBaseline, Paper, Grid } from "@mui/material";
import Link from 'next/link';
import Head from 'next/head';
import { useUser } from '@clerk/nextjs'; // Changed from useAuth to useUser
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
    const { user, isSignedIn } = useUser(); // Updated to useUser
    const router = useRouter();

    // Redirect based on the user's signed-in status
    const handleGetStarted = () => {
        if (isSignedIn) {
            router.push('/dashboard'); // Redirect to dashboard if signed in
        } else {
            router.push('/sign-in'); // Otherwise, redirect to sign-in
        }
    };

    // Handle Stripe Premium Plan Checkout
    const handlePremium = async () => {
        const stripe = await stripePromise;

        const response = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan: 'pro',
            }),
        });

        const session = await response.json();

        if (session.id) {
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
            if (error) {
                console.error('Stripe Checkout Error:', error);
            }
        }
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                minHeight: '100vh',
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
                    backgroundColor: '#0A1128',
                    boxShadow: 'none',
                    minWidth: '100vw',
                }}
            >
                <Toolbar>
                    <Paper elevation={0} sx={{ flexGrow: 1, backgroundColor: '#0A1128' }}>
                        <img src="logo.png" height="40px" width="200px" />
                    </Paper>
                    <Link href="/sign-in" passHref>
                        <Button sx={{
                            mx: 1,
                            color: 'white',
                            '&:hover': { backgroundColor: '#0055A4' },
                            transition: 'background-color 0.3s ease',
                            borderRadius: '20px',
                        }}>Login</Button>
                    </Link>
                    <Link href="/sign-up" passHref>
                        <Button
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
                sx={{
                    flexGrow: 1,
                    flexDirection: 'column',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflowX: 'hidden',
                    width: '100vw',
                    //height: '80vh',
                    padding: 0,
                    margin: 0,
                }}
            >
                <Box sx={{
                    backgroundColor: '#0A1128',
                    //                background: "linear-gradient(170deg, #0A1128 32.27%, #001F54 51.49%, #034078 71.03%, #0A1128 99.51%)",

                    width: '100vw',
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
                            color: '#FF6F42',
                        }}
                    >
                        ProPathway
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 4,
                            fontFamily: "'Lato', sans-serif",
                            color: 'white',
                        }}
                    >
                        The Ultimate Job Application Tracker
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#FF6F42',
                            '&:hover': { backgroundColor: '#EB5E28' },
                            fontSize: '1.2rem',
                            px: 4,
                            py: 1,
                            borderRadius: '20px',
                            fontFamily: "'Lato', sans-serif",
                            mb: 2,
                        }}
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </Box>
            </Box>

            {/* Features Section */}
            <Box
                sx={{
                    //backgroundColor: '#F7F9FC',
                    width: '100vw',
                    py: 8,
                    px: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, fontFamily: "'Lato', sans-serif" }}>
                    Features
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Track Applications</Typography>
                            <Typography variant="body1">Easily monitor the status of all your job applications in one place.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Set Reminders</Typography>
                            <Typography variant="body1">Never miss a follow-up or deadline with customizable reminders.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>AI-Driven Insights</Typography>
                            <Typography variant="body1">Get personalized job recommendations and actionable insights using AI.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Organize Deadlines</Typography>
                            <Typography variant="body1">View all your important deadlines in a clear, organized way.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Follow-up Suggestions</Typography>
                            <Typography variant="body1">Receive recommendations on when and how to follow up after an application.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Job History</Typography>
                            <Typography variant="body1">Keep a historical log of all jobs applied to for reference during future applications.</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Box
                sx={{
                    backgroundColor: '#0A1128',
                    color: '#fff',
                    py: 4,
                    textAlign: 'center',
                    minWidth: '100vw',
                    margin: 0,
                }}
            >
                <Button
                    variant="outlined"
                    sx={{
                        color: '#FF6F42',
                        borderColor: '#FF6F42',
                        '&:hover': { backgroundColor: '#EB5E28', color: 'white' },
                        fontSize: '1.2rem',
                        px: 4,
                        py: 1,
                        borderRadius: '20px',
                        fontFamily: "'Lato', sans-serif",
                        mb: 2,
                    }}
                    onClick={handlePremium}
                >
                    Get Started with Premium
                </Button>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    © 2024 ProPathway. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
}
