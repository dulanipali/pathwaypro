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
    const [loading, setLoading] = useState(true);
    const [isPdf, setIsPdf] = useState(true); // State to track if the file is a PDF or Word doc

    useEffect(() => {
        const fetchTipsAndFile = async () => {
            const id = searchParams.get('id');
            if (id) {
                try {
                    // Fetch the document from Firestore
                    const docRef = doc(db, 'resumes', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.tips) {
                            setTips(data.tips);
                        }
                        if (data.fileUrl) {
                            setFileUrl(data.fileUrl);

                            // Determine if the file is a PDF or Word document
                            if (data.fileUrl.endsWith('.pdf')) {
                                setIsPdf(true);
                            } else if (data.fileUrl.endsWith('.docx')) {
                                setIsPdf(false);
                            }
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
                {/* File Embed Preview (Left) */}
                <Box
                    sx={{
                        width: '45%',  // Adjust as needed
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
                        <Box>
                            {isPdf ? (
                                // Embed the PDF directly with zoom level
                                <iframe 
                                    src={`${fileUrl}#zoom=50`}  // Set zoom level to 133%
                                    width="100%" 
                                    height="600px"  
                                    style={{ border: 'none', borderRadius: '8px' }}
                                    title="Resume Preview"
                                />
                            ) : (
                                // Use Google Docs Viewer for Word documents
                                <iframe 
                                    src={`https://docs.google.com/viewer?url=${fileUrl}&embedded=true`} 
                                    width="100%" 
                                    height="600px"  
                                    style={{ border: 'none', borderRadius: '8px', transform: 'scale(1.33)', transformOrigin: '0 0' }}  // CSS Zoom for Google Docs Viewer
                                    title="Resume Preview"
                                />
                            )}
                            <Typography variant="body1" sx={{ color: 'white', mt: 2 }}>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FF6F42', textDecoration: 'none', fontWeight: 'bold' }}>
                                    View Full Document
                                </a>
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            No resume available.
                        </Typography>
                    )}
                </Box>

                {/* Tips Card (Right) */}
                <Box
                    sx={{
                        width: '45%',  // Adjust as needed
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
                                        listStyleType: '"⟡ "',  // Define bullet point
                                        fontFamily: "'Roboto', sans-serif",  
                                        color: 'white',  // White text for the actual tips
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

            {/* Interview Prep Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button variant="contained" color="primary" onClick={handleInterviewPrep}>
                    Interview Prep
                </Button>
            </Box>
        </Layout>
    );
}
