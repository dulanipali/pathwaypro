'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import Layout from '../propathway_layout';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';

export default function ResumeTipsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tips, setTips] = useState([]);
    const [fileUrl, setFileUrl] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPdf, setIsPdf] = useState(false); 
    const [open, setOpen] = useState(false);
    const [saveName, setSaveName] = useState('');

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

    const handleSaveClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSaveTips = async () => {
        const id = searchParams.get('id');
        if (id && saveName) {
            try {
                // Update Firestore document
                const docRef = doc(db, 'resumes', id);
                await updateDoc(docRef, { saveName, tips });
                console.log("Tips saved with name:", saveName);
        
                // Retrieve current names from localStorage
                const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];
                const updatedNames = savedInsightNames.map((name, index) => {
                    if (resumes[index]?.id === id) return saveName;
                    return name;
                });
        
                // Save updated names back to localStorage
                localStorage.setItem('insightNames', JSON.stringify(updatedNames));
            } catch (error) {
                console.error("Error saving tips:", error);
            }
        }
        setOpen(false);
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

                    {/* Save Tips Button */}
                    <Button
                        variant="contained"
                        sx={{ mt: 3, backgroundColor: '#EB5E28', color: '#FFF', '&:hover': { backgroundColor: '#FF6F42' } }}
                        onClick={handleSaveClick}
                    >
                        Save Tips
                    </Button>
                </Box>
            </Box>

            {/* Dialog for Saving Tips */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Tips</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the name you would like to save these tips under:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Save Name"
                        type="text"
                        fullWidth
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveTips} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
