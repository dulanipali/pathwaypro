'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, CssBaseline } from "@mui/material";
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
                    backgroundColor: '#0A1128',
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
                    height: '80vh',
                    padding: 0,
                    margin: 0,
                }}
            >
                <Box sx={{
                    backgroundColor: '#0A1128',
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
                            color: 'white',
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
