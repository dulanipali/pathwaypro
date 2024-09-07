'use client';
import { useState } from 'react';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import ContentCopy from '@mui/icons-material/ContentCopy';
import UploadFile from '@mui/icons-material/UploadFile';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
            return docRef;
        } catch (error) {
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
            console.error("Error uploading file:", error);
        }
    };

    const generateTips = async () => {
        if (!resumeText || !jobDescription) {
            alert("Please enter a job description and upload your resume.");
            return;
        }

        try {
            setLoading(true);

            const docRef = await saveResumeToFirebase(jobDescription, fileUrl, []);
            
            const response = await axios.post('/api/generate', {
                jobDescription,
                resumeText,
                documentId: docRef.id
            });
            
            const tips = response.data.tips;
            await updateDoc(docRef, { tips });

            router.push(`/resume_tips?id=${docRef.id}`);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleInterviewPrepNavigation = () => {
        router.push(`/interview_prep?jobDescription=${encodeURIComponent(jobDescription)}`);
    };

    return (
        <div style={{ backgroundColor: '#2D4159', minHeight: '100vh', overflow: 'hidden' }}>
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
                    Hi {user?.firstName}, Welcome to <span style={{ color: '#0677A1' }}>ProPathway!</span>
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
                            sx={{ 
                                backgroundColor: section === 'resumeTips' ? '#0677A1' : 'transparent', 
                                color: '#FFFFFF', 
                                '&:hover': { backgroundColor: '#78244C' } 
                            }}
                            onClick={() => setSection('resumeTips')}
                        >
                            Resume Tips
                        </Button>
                        <Button
                            variant={section === 'interviewTips' ? 'contained' : 'outlined'}
                            sx={{ 
                                backgroundColor: section === 'interviewTips' ? '#895061' : 'transparent', 
                                color: '#FFFFFF', 
                                '&:hover': { backgroundColor: '#59253A' } 
                            }}
                            onClick={() => setSection('interviewTips')}
                        >
                            Interview Prep
                        </Button>
                    </Box>
    
                    {section === 'resumeTips' && (
                        <Box
                            display="flex"
                            justifyContent="space-around"
                            sx={{ mb: 4, width: '100%' }}
                        >
                            <Box
                                sx={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '48%',
                                    textAlign: 'center',
                                    color: 'white',
                                    border: '2px solid #0677A1',
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
                                    sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                />
                            </Box>
    
                            <Box
                                sx={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '48%',
                                    textAlign: 'center',
                                    color: 'white',
                                    border: '2px solid #895061',
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
                                    sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                />
                            </Box>
                        </Box>
                    )}
    
                    {section === 'interviewTips' && (
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
                                onChange={(e) => setJobDescription(e.target.value)}
                                sx={{ backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                            />
                            <Button
                                variant="contained"
                                sx={{ mt: 4, backgroundColor: '#0677A1', color: '#FFFFFF', '&:hover': { backgroundColor: '#78244C' } }}
                                onClick={handleInterviewPrepNavigation}
                            >
                                Get Interview Prep Tips
                            </Button>
                        </Box>
                    )}
    
                    <Button
                        variant="contained"
                        onClick={generateTips}
                        sx={{ mt: 4, backgroundColor: '#0677A1', color: '#FFFFFF', '&:hover': { backgroundColor: '#78244C' } }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Generate Tips'}
                    </Button>
                </Box>
            </Layout>
        </div>
    );
}
