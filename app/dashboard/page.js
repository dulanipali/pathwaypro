'use client';
import { useState } from 'react';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { ContentCopy, UploadFile } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';  
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';  
import mammoth from 'mammoth';  

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function DashboardPage() {
    const { user } = useUser();
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [section, setSection] = useState('resumeTips');
    const router = useRouter();

    const saveResumeToFirebase = async (jobDescription, fileUrl, tips) => {
        try {
            const docRef = await addDoc(collection(db, 'resumes'), {
                userId: user?.id,
                jobDescription,
                fileUrl,
                tips,
                createdAt: new Date()
            });
            console.log("Resume and job description saved to Firebase with ID:", docRef.id);
            return docRef;
        } catch (error) {
            console.error("Error saving resume and job description to Firebase:", error);
            throw error;
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type;
        const storageRef = ref(storage, `resumes/${user?.id}/${file.name}`);

        try {
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            setFileUrl(fileUrl);

            if (fileType === "application/pdf") {
                const fileReader = new FileReader();
                fileReader.onload = async function() {
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
            } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const fileReader = new FileReader();
                fileReader.onload = async function() {
                    const arrayBuffer = this.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    setResumeText(result.value);
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                alert("Please upload a PDF or Word document.");
            }
        } catch (error) {
            console.error("Error uploading file to Firebase Storage:", error);
        }
    };

    const generateTips = async () => {
        if (!resumeText || !jobDescription) {
            alert("Please enter a job description and upload your resume.");
            return;
        }

        try {
            setLoading(true);

            const formData = {
                jobDescription,
                resumeText
            };

            const docRef = await saveResumeToFirebase(jobDescription, fileUrl, []);
            
            const response = await axios.post('/api/generate', {
                jobDescription,
                resumeText,
                documentId: docRef.id
            });
            
            const tips = response.data.tips;
            
            await updateDoc(docRef, { tips });

            router.push(`/resume_tips?id=${docRef.id}`);
            setLoading(false);
        } catch (error) {
            console.error('Failed to generate tips:', error);
            setLoading(false);
        }
    };

    const handleInterviewPrepNavigation = () => {
        router.push(`/interview_prep?jobDescription=${encodeURIComponent(jobDescription)}`);
    };

    return (
        <div style={{ backgroundColor: 'green', minHeight: '100vh', overflow: 'hidden' }}>
            <Layout>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        color: '#FFFFFF', 
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 'bold',
                        mb: 4
                    }}
                >
                    Hi {user?.firstName}, Welcome to <span style={{ color: '#5680E9' }}>ProPathway!</span>
                </Typography>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ width: '90%', maxWidth: '1200px', mx: 'auto' }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-around"
                        sx={{ mb: 4, width: '100%' }}
                    >
                        <Button
                            variant={section === 'resumeTips' ? 'contained' : 'outlined'}
                            sx={{ backgroundColor: section === 'resumeTips' ? '#5680E9' : 'transparent', color: '#FFFFFF', '&:hover': { backgroundColor: '#84CEEB' } }}
                            onClick={() => setSection('resumeTips')}
                        >
                            Resume Tips
                        </Button>
                        <Button
                            variant={section === 'interviewTips' ? 'contained' : 'outlined'}
                            sx={{ backgroundColor: section === 'interviewTips' ? '#8860D0' : 'transparent', color: '#FFFFFF', '&:hover': { backgroundColor: '#5AB9EA' } }}
                            onClick={() => setSection('interviewTips')}
                        >
                            Interview Prep
                        </Button>
                    </Box>

                    {section === 'resumeTips' && (
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            sx={{ width: '100%', mb: 4 }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: '#1A202C',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '48%',
                                    textAlign: 'center',
                                    color: 'white',
                                    border: '2px solid #5680E9',
                                }}
                            >
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
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    sx={{ backgroundColor: 'white', borderRadius: '5px' }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    backgroundColor: '#1A202C',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '48%',
                                    textAlign: 'center',
                                    color: 'white',
                                    border: '2px solid #8860D0',
                                }}
                            >
                                <UploadFile sx={{ fontSize: 40, mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Upload your resume (PDF or Word):
                                </Typography>
                                <input
                                    type="file"
                                    accept=".pdf, .docx"
                                    onChange={handleFileUpload}
                                    style={{ marginBottom: '16px', color: 'white' }}
                                />
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Paste your resume here, or feel free to edit out any personal information from your uploaded resume before generating tips.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    sx={{ backgroundColor: 'white', borderRadius: '5px' }}
                                />
                            </Box>
                        </Box>
                    )}

                    {section === 'interviewTips' && (
                        <Box
                            sx={{
                                backgroundColor: '#1A202C',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                width: '100%',
                                textAlign: 'center',
                                color: 'white',
                                border: '2px solid #5680E9',
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
                                onChange={(e) => setJobDescription(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: '5px' }}
                            />
                            <Button
                                variant="contained"
                                sx={{ mt: 2, backgroundColor: '#5680E9', color: '#FFFFFF', '&:hover': { backgroundColor: '#84CEEB' } }}
                                onClick={handleInterviewPrepNavigation}
                            >
                                Generate Interview Questions
                            </Button>
                        </Box>
                    )}

                    {loading && <CircularProgress sx={{ color: '#84CEEB', mt: 4 }} />}
                    <Button
                        variant="contained"
                        sx={{
                            mt: 4,
                            backgroundColor: '#5680E9',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#84CEEB' }
                        }}
                        onClick={generateTips}
                        disabled={loading}
                    >
                        Generate Resume Tips
                    </Button>
                </Box>
            </Layout>
        </div>
    );
}
