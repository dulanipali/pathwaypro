'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, CssBaseline, Paper, Grid, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Link from 'next/link';
import Head from 'next/head';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InstagramIcon from '@mui/icons-material/Instagram';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
    const { user, isSignedIn } = useUser();
    const router = useRouter();

    const handleGetStarted = () => {
        isSignedIn ? router.push('/dashboard') : router.push('/sign-in');
    };

    const handlePremium = async () => {
        const stripe = await stripePromise;
        const response = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan: 'pro' }),
        });
        const session = await response.json();

        if (session.id) {
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
            if (error) console.error('Stripe Checkout Error:', error);
        }
    };

    return (
        <Container maxWidth={false} sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0, overflowX: 'hidden' }}>
            <Head>
                <title>ProPathway</title>
                <meta name="description" content="Job Application Tracker to help organize job search process" />
                <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
            </Head>

            <CssBaseline />

            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', minWidth: '100vw' }}>
                <Toolbar>
                    <Paper elevation={0} sx={{ flexGrow: 1, backgroundColor: '#0A1128' }}>
                        <img src="logo.png" height="40px" width="200px" alt="ProPathway Logo" />
                    </Paper>
                    <Button sx={{ mx: 1, color: 'white', '&:hover': { backgroundColor: '#0055A4' }, transition: 'background-color 0.3s ease', borderRadius: '20px', fontFamily: "'Lato', sans-serif" }} onClick={() => {
                        document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                    }}>
                        Features
                    </Button>

                    <Button sx={{ mx: 1, color: 'white', '&:hover': { backgroundColor: '#0055A4' }, transition: 'background-color 0.3s ease', borderRadius: '20px', fontFamily: "'Lato', sans-serif" }} onClick={() => {
                        document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
                    }}>
                        FAQ
                    </Button>

                    <Link href="/sign-up" passHref>
                        <Button sx={{ mx: 1, color: 'white', '&:hover': { backgroundColor: '#0055A4' }, transition: 'background-color 0.3s ease', borderRadius: '20px', fontFamily: "'Lato', sans-serif" }}>
                            Contact Us
                        </Button>
                    </Link>
                    <Link href="/sign-in" passHref>
                        <Button sx={{ mx: 1, color: 'white', '&:hover': { backgroundColor: '#0055A4' }, transition: 'background-color 0.3s ease', borderRadius: '20px' }}>
                            Login
                        </Button>
                    </Link>
                    <Link href="/sign-up" passHref>
                        <Button sx={{ mx: 1, color: 'white', '&:hover': { backgroundColor: '#0055A4' }, transition: 'background-color 0.3s ease', borderRadius: '20px', fontFamily: "'Lato', sans-serif" }}>
                            Sign Up
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100vw', padding: 0, margin: 0 }}>
                <Box sx={{
                    backgroundColor: '#0A1128',
                    width: '100vw',
                    height: '60vh',
                    py: 8,
                    px: 4,
                    margin: 0,
                    position: 'relative',
                }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', animation: `fadeIn 2s ease`, fontFamily: "'Lato', sans-serif", color: '#FF6F42' }}>
                        ProPathway
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, fontFamily: "'Lato', sans-serif", color: 'white' }}>
                        The Ultimate Job Application Tracker
                    </Typography>
                    <Button variant="contained" sx={{ backgroundColor: '#FF6F42', '&:hover': { backgroundColor: '#EB5E28' }, fontSize: '1.2rem', px: 4, py: 1, borderRadius: '20px', fontFamily: "'Lato', sans-serif", mb: 2 }} onClick={handleGetStarted}>
                        Get Started
                    </Button>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', lineHeight: 0 }}>
                        <svg viewBox="0 -100 1440 320" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#fff" fillOpacity="1" d="M0,224L80,202.7C160,181,320,139,480,138.7C640,139,800,181,960,192C1120,203,1280,181,1360,170.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                        </svg>
                    </Box>
                </Box>
            </Box>
            <Box id="how-to-section" sx={{ width: '100vw', py: 8, px: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, fontFamily: "'Lato', sans-serif" }}>
                    How to Use
                </Typography>
                <Button variant="outlined" sx={{ color: '#FF6F42', borderColor: '#FF6F42', '&:hover': { backgroundColor: '#EB5E28', color: 'white' }, fontSize: '1.2rem', px: 4, py: 1, borderRadius: '20px', fontFamily: "'Lato', sans-serif", mb: 2 }} onClick={handlePremium}>
                    Get Started with Premium
                </Button>
            </Box>
            <Box id="features-section" sx={{ width: '100vw', py: 8, px: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, fontFamily: "'Lato', sans-serif" }}>
                    Features
                </Typography>
                <Grid container spacing={4}>
                    {[
                        { title: "Track Applications", description: "Easily monitor the status of all your job applications in one place." },
                        { title: "Set Reminders", description: "Never miss a follow-up or deadline with customizable reminders." },
                        { title: "AI-Driven Insights", description: "Get personalized job recommendations and actionable insights using AI." },
                        { title: "Organize Deadlines", description: "View all your important deadlines in a clear, organized way." },
                        { title: "Follow-up Suggestions", description: "Receive recommendations on when and how to follow up after an application." },
                        { title: "Job History", description: "Keep a historical log of all jobs applied to for reference during future applications." },
                    ].map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper elevation={3} sx={{
                                padding: 3, textAlign: 'center', transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)', boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)' }
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{feature.title}</Typography>
                                <Typography variant="body1">{feature.description}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box id="faq-section" sx={{ py: 4, minWidth: '100vw', margin: 0, paddingX: '20%' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>FAQ</Typography>
                {[
                    { question: "What is ProPathway?", answer: "ProPathway is your go-to tool for efficiently managing job applications and follow-ups." },
                    { question: "Why would I need this?", answer: "If you're applying for jobs and need help staying organized, ProPathway simplifies the process." },
                    { question: "How much does it cost?", answer: "For a limited time, you can access all our features for free!" },
                ].map((faq, index) => (
                    <Accordion key={index} sx={{ '&:hover': { color: '#FF6F42' }, transition: 'color 0.3s ease' }}>
                        <AccordionSummary expandIcon={<ArrowDownwardIcon sx={{ '&:hover': { color: '#FF6F42' }, transition: 'color 0.3s ease' }} />} aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                            <Typography>{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
            <Box sx={{ backgroundColor: '#0A1128', color: '#fff', py: 4, textAlign: 'center', minWidth: '100vw', margin: 0 }}>
                <Paper elevation={0} sx={{ flexGrow: 1, backgroundColor: '#0A1128' }}>
                    <img src="logo.png" height="40px" width="200px" alt="ProPathway Logo" />
                </Paper>
                <InstagramIcon sx={{ mx: 0.5, '&:hover': { color: '#FF6F42' }, transition: 'color 0.3s ease' }} />
                <MailOutlineIcon sx={{ mx: 0.5, '&:hover': { color: '#FF6F42' }, transition: 'color 0.3s ease' }} />
                <Typography variant="body2" sx={{ mt: 1, '&:hover': { color: '#FF6F42' }, transition: 'color 0.3s ease' }}>Privacy</Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    © 2024 ProPathway. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
}
