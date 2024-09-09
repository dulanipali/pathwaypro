'use client';
import { useState } from 'react';
import { Typography, Box, Button, TextField, CircularProgress, Snackbar, Alert, AppBar, Tabs, Tab, Modal } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import ContentCopy from '@mui/icons-material/ContentCopy';
import UploadFile from '@mui/icons-material/UploadFile';
import Info from '@mui/icons-material/Info';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function DashboardPage() {
    const { user } = useUser();
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const [instructionsOpen, setInstructionsOpen] = useState(false);

    const router = useRouter();

    const handleInstructionsOpen = () => {
        setInstructionsOpen(true);
    };

    const handleInstructionsClose = () => {
        setInstructionsOpen(false);
    };

    const handleTabChange = (_, newValue) => {
        setTab(newValue);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const showError = (message) => {
        setError(message);
        setSnackbarOpen(true);
    };

    const saveResumeToFirebase = async (jobDescription, fileUrl, resumeText, tips = [], prep = []) => {
        try {
            const docRef = await addDoc(collection(db, 'resumes'), {
                userId: user?.id,
                jobDescription,
                fileUrl,
                resumeText, // Save the pasted resume text here
                prep,
                tips,
                createdAt: new Date()
            });
            return docRef;
        } catch (error) {
            throw error;
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            showError("No file selected.");
            return;
        }

        const fileType = file.type;
        const storageRef = ref(storage, `resumes/${user?.id}/${file.name}`);

        try {
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            setFileUrl(fileUrl);

            if (fileType === "application/pdf") {
                const fileReader = new FileReader();
                fileReader.onload = async function () {
                    const pdfData = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        text += `${pageText}\n`;
                    }
                    setResumeText(text);
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                showError("Please upload a PDF document.");
            }
        } catch (error) {
            showError("Error uploading file");
            console.error("Error uploading file:", error);
        }
    };

    const generateTips = async () => {
        if (!resumeText && !jobDescription) {
            showError("Please enter a job description and upload or paste your resume.");
            return;
        } else if (!resumeText) {
            showError("Please upload or paste your resume.");
            return;
        } else if (!jobDescription) {
            showError("Please enter a job description.");
            return;
        }

        try {
            setLoading(true);

            // Save both resumeText and fileUrl to Firebase
            const docRef = await saveResumeToFirebase(jobDescription, fileUrl, resumeText, [], []);

            const tipsResponse = await axios.post('/api/generate', {
                jobDescription,
                resumeText,
                documentId: docRef.id
            });

            const tips = tipsResponse.data.tips;

            const prepResponse = await axios.post('/api/generate-interview-questions', {
                jobDescription,
            });

            const prep = prepResponse.data.questions;

            await updateDoc(docRef, { tips, prep });

            router.push(`/resume_tips?id=${docRef.id}`);
        } catch (error) {
            setLoading(false);
            showError("Failed to generate tips and interview questions. Please try again.");
        }
    };

    const handleInterviewPrepNavigation = () => {
        router.push(`/interview_prep?jobDescription=${encodeURIComponent(jobDescription)}`);
    };
    const generateInterviewPrepQuestions = async () => {
        if (!jobDescription) {
            showError("Please enter a job description.");
            return;
        }
        try {
            setLoading(true);
            // Ensure that `prep` field is handled correctly here
            const docRef = await saveResumeToFirebase(jobDescription, fileUrl, [], []);
            const response = await axios.post('/api/generate-interview-questions', {
                jobDescription,
            });
            const questions = response.data.questions;
            await updateDoc(docRef, { prep: questions });
            router.push(`/interview_prep?id=${docRef.id}`);
        } catch (error) {
            setLoading(false);
            showError(`Failed to generate interview questions. Please try again. ${error.message}`);
        }
    };

    return (
        <div style={{ backgroundColor: '#2D4159', minHeight: '100vh', overflow: 'hidden' }}>
            <Layout>
                <AppBar position="static" sx={{ borderRadius: 1, backgroundColor: '#001F54' }}>
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            '.MuiTabs-flexContainer': { justifyContent: 'space-around' },
                            '.MuiTab-root': { fontSize: '16px', color: 'white' }, //text
                            '.Mui-selected': { color: '#FF6F61' },
                            '.MuiTabs-indicator': { backgroundColor: '#FF6F61' }, //underline
                        }}>
                        <Tab label="Resume Tips" />
                        <Tab label="Interview Prep" />
                    </Tabs>
                </AppBar>
                {tab === 0 && (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ width: '90%', maxWidth: '1200px', mt: 4, mb: 6 }}>
                        <Box display="flex" justifyContent="space-around" sx={{ mb: 4, width: '100%' }}>
                            <Box sx={{ padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', width: '48%', textAlign: 'center', color: 'white', border: '2px solid #0677A1' }}>
                                <ContentCopy sx={{ fontSize: 40, mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Paste your job description here
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={jobDescription}
                                    placeholder={"Full job description: Responsibilities, Qualifications etc.."}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={generateTips}
                                    sx={{ mt: 4, backgroundColor: '#0677A1', color: '#FFFFFF', '&:hover': { backgroundColor: '#78244C' } }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Generate Tips'}
                                </Button>
                            </Box>
                            <Box sx={{ padding: '20px', width: '48%', textAlign: 'center', textAlign: 'center', color: 'white', alignItems: 'center' }}>
                                <Box sx={{ padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center', color: 'white', border: '2px solid #895061', alignItems: 'center' }}>
                                    <UploadFile sx={{ fontSize: 40, mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Upload your resume (PDF only)
                                    </Typography>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        style={{ marginBottom: '16px', color: 'white' }}
                                    />
                                </Box>
                                <Typography variant="h6" sx={{ m: 2 }}>
                                    OR</Typography>
                                <Box sx={{ padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center', color: 'white', border: '2px solid #895061' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Paste/Edit your resume
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={10}
                                        variant="outlined"
                                        value={resumeText}
                                        placeholder='Paste your resume here or upload and remove personal details from the pdf'
                                        onChange={(e) => setResumeText(e.target.value)}
                                        sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
                {tab === 1 && (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ width: '90%', maxWidth: '1200px', mt: 4, mb: 6 }}>

                        <Box display="flex" justifyContent="space-around" sx={{ mb: 4, width: '100%' }}>
                            <Box
                                sx={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '100%',
                                    textAlign: 'center',
                                    color: 'white',
                                    border: '2px solid #0677A1',
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Paste your job description here
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={jobDescription}
                                    placeholder={"Full job description: Responsibilities, Qualifications etc.."}

                                    onChange={(e) => setJobDescription(e.target.value)}
                                    sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                />
                                <Button
                                    variant="contained"
                                    sx={{ mt: 4, backgroundColor: '#0677A1', color: '#FFFFFF', '&:hover': { backgroundColor: '#78244C' } }}
                                    onClick={generateInterviewPrepQuestions}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Generate Tips'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
                <Button
                    variant="outlined"
                    onClick={handleInstructionsOpen}
                    sx={{
                        position: 'fixed',
                        bottom: 16, // Distance from the bottom of the screen
                        right: 16,   // Distance from the left of the screen
                        minWidth: 'auto',
                        width: '35px',
                        color: '#FF6F61',
                        borderColor: '#EB5E28',
                        '&:hover': {
                            borderColor: '#FF6F42',
                            backgroundColor: '#FF6F61',
                            color: '#FFFFFF',
                        },
                        zIndex: 1000 // Ensure it stays on top of other elements
                    }}
                >
                    <Info />
                </Button>

                <Modal open={instructionsOpen} onClose={handleInstructionsClose}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            bgcolor: '#FFFFFF',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: '8px',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EB5E28', mb: 2 }}>
                            How to Generate Tips
                        </Typography>
                        <Typography>Switch between Resume Tips and Interview Tips</Typography>
                        <Typography variant="body1" sx={{ color: '#000000', mt: 2, textDecoration: 'underline' }}>
                            Resume Tips
                        </Typography>
                        <ul style={{ color: '#000000' }}>
                            <li><strong>Job Description</strong>: Find a job description you are interested in and paste it.</li>
                            <li><strong>Uploading Resume</strong>: Paste your resume OR Upload a PDF of your resume and remove your personal information.</li>
                        </ul>
                        <Typography variant="body1" sx={{ color: '#000000', mt: 2, textDecoration: 'underline' }}>
                            Interview Tips
                        </Typography>
                        <ul style={{ color: '#000000' }}>
                            <li><strong>Job Description</strong>: Find a job description you are interested in and paste it.</li>
                            <li><strong>Uploading Resume</strong>: Paste your resume OR Upload a PDF of your resume and remove your personal information.</li>
                        </ul>
                    </Box>
                </Modal>
            </Layout>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </div >
    );
}