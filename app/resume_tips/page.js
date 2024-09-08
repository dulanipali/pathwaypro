'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import Layout from '../propathway_layout';
import { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase';

export default function ResumeTipsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tips, setTips] = useState([]);
    const [fileUrl, setFileUrl] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPdf, setIsPdf] = useState(false); // Track if the file is a PDF

    useEffect(() => {
        const fetchTipsAndFile = async () => {
            const id = searchParams.get('id');
            if (id) {
                try {
                    const docRef = doc(db, 'resumes', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.tips) {
                            setTips(data.tips);
                        }
                        if (data.fileUrl) {
                            setFileUrl(data.fileUrl);
                            setIsPdf(true);
                        }
                        if (data.resumeText) {
                            setResumeText(data.resumeText);
                        }
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching tips or file URL:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("No document ID found in query");
                setLoading(false);
            }
        };

        fetchTipsAndFile();
    }, [searchParams]);

    const handleInterviewPrep = () => {
        router.push('/interview_prep');
    };

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 4, mt: 4 }}>
                {/* Resume Preview or Plain Text */}
                <Box
                    sx={{
                        width: '40%',
                        backgroundColor: '#0A1128',
                        p: 3,
                        borderRadius: '10px',
                        border: '2px solid #FF6F42',
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#FF6F42',
                            mb: 2,
                            textAlign: 'center',
                            fontFamily: "'Playfair Display', serif"
                        }}
                    >
                        Your Uploaded Resume
                    </Typography>
                    {loading ? (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            Loading resume...
                        </Typography>
                    ) : fileUrl ? (
                        <iframe
                            src={`${fileUrl}#zoom=50`}
                            width="100%"
                            height="600px"
                            style={{ border: 'none', borderRadius: '8px' }}
                            title="Resume Preview"
                        />
                    ) : resumeText ? (
                        <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-wrap' }}>
                            {resumeText}
                        </Typography>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            No resume available.
                        </Typography>
                    )}
                </Box>

                {/* Tips Section */}
                <Box
                    sx={{
                        width: '40%',
                        backgroundColor: '#0A1128',
                        p: 3,
                        borderRadius: '10px',
                        border: '2px solid #FF6F42',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#FF6F42',
                            mb: 2,
                            textAlign: 'center',
                            fontFamily: "'Playfair Display', serif"
                        }}
                    >
                        Tips
                    </Typography>
                    {loading ? (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            Loading tips...
                        </Typography>
                    ) : tips && tips.length > 0 ? (
                        <Box component="ul" sx={{ pl: 2, color: 'white' }}>
                            {tips.map((tip, index) => (
                                <Typography
                                    key={index}
                                    component="li"
                                    variant="body1"
                                    sx={{
                                        listStyleType: '"⟡ "',
                                        fontFamily: "'Roboto', sans-serif",
                                        color: 'white',
                                        mb: 1
                                    }}
                                >
                                    {tip}
                                </Typography>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            No tips available.
                        </Typography>
                    )}
                </Box>
            </Box>
        </Layout>
    );
}
