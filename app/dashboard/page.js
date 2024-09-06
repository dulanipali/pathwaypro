'use client';
import { useState } from 'react';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { ContentCopy, UploadFile } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../propathway_layout';
import { useRouter } from 'next/navigation';
import { collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { db, storage } from '../../firebase';  // Import Firebase Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";  // Import Firebase Storage methods
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';  
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';  
import mammoth from 'mammoth';  

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function DashboardPage() {
    const { user } = useUser();
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [fileUrl, setFileUrl] = useState('');  // State to hold the file URL
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Save resume and job description to Firebase
    const saveResumeToFirebase = async (resumeText, jobDescription, fileUrl) => {
        try {
            const docRef = await addDoc(collection(db, 'resumes'), {
                userId: user?.id,
                resumeText,
                jobDescription,
                fileUrl,  // Save the file URL in Firestore
                createdAt: new Date()
            });
            console.log("Resume and job description saved to Firebase with ID:", docRef.id);
            return docRef;
        } catch (error) {
            console.error("Error saving resume and job description to Firebase:", error);
            throw error;
        }
    };

    // Handle file upload for PDF/Word document and upload to Firebase Storage
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type;
        const storageRef = ref(storage, `resumes/${user?.id}/${file.name}`);  // Create a reference in Firebase Storage

        try {
            // Upload the file to Firebase Storage
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);  // Get the file's URL
            setFileUrl(fileUrl);  // Save the URL to state for saving to Firestore

            // Extract text from the file
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
                    setResumeText(text);  // Set extracted text for API submission
                };
                fileReader.readAsArrayBuffer(file);
            } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const fileReader = new FileReader();
                fileReader.onload = async function() {
                    const arrayBuffer = this.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    setResumeText(result.value);  // Set extracted text for API submission
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                alert("Please upload a PDF or Word document.");
            }
        } catch (error) {
            console.error("Error uploading file to Firebase Storage:", error);
        }
    };

    // Generate tips based on job description and resume text
    const generateTips = async () => {
        if (!resumeText || !jobDescription) {
            alert("Please enter a job description and paste your resume text.");
            return;
        }

        // Save resume text, job description, and file URL to Firestore
        const docRef = await saveResumeToFirebase(resumeText, jobDescription, fileUrl);

        const formData = {
            jobDescription,
            resumeText,  // Send extracted text to API
            documentId: docRef.id
        };

        try {
            setLoading(true);
            const response = await axios.post('/api/generate', formData);
            setLoading(false);

            const tips = response.data.tips;
            if (tips) {
                // Save tips to Firestore in the same document
                await updateDoc(doc(db, 'resumes', docRef.id), { tips });

                // Redirect to ResumeTipsPage with the document ID
                router.push(`/resume_tips?id=${docRef.id}`);
            } else {
                alert("No tips were generated. Please try again.");
            }
        } catch (error) {
            console.error('Failed to generate tips:', error);
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Typography 
                variant="h4" 
                sx={{ 
                    color: 'white', 
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 'bold',
                    mb: 4
                }}
            >
                Hi {user?.firstName}, Welcome to <span style={{ color: '#EB5E28' }}>ProPathway!</span>
            </Typography>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ width: '80%', maxWidth: '800px', mx: 'auto' }}
            >
                <Box
                    sx={{
                        backgroundColor: '#1A202C',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        border: '2px solid #EB5E28',
                        mb: 4
                    }}
                >
                    <ContentCopy sx={{ fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Paste your job description here
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
                    />
                </Box>
                
                <Box
                    sx={{
                        backgroundColor: '#1A202C',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        border: '2px solid #0055A4',
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
                        rows={6}
                        variant="outlined"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
                    />
                </Box>
            </Box>
            <Button
                variant="contained"
                sx={{ mt: 4, backgroundColor: '#EB5E28', color: '#FFFFFF', '&:hover': { backgroundColor: '#D14928' } }}
                onClick={generateTips}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Generate Resume Tips'}
            </Button>
        </Layout>
    );
}
