'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Modal, IconButton, TextField } from '@mui/material';
import Layout from '../propathway_layout';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useUser } from '@clerk/nextjs';
import CloseIcon from '@mui/icons-material/Close';
import "@fontsource/poppins"; // Add Poppins font

export default function ApplicationInsights() {
    const { user } = useUser();
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingNameIndex, setEditingNameIndex] = useState(null);
    const [insightNames, setInsightNames] = useState([]);

    useEffect(() => {
        const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];
        const fetchResumes = async () => {
            try {
                const q = query(collection(db, 'resumes'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);
                const resumesList = querySnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    name: savedInsightNames[index] || `Insight #${index + 1}`,
                }));
                setResumes(resumesList);
                setInsightNames(resumesList.map((resume, index) => savedInsightNames[index] || `Insight #${index + 1}`));
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };

        if (user?.id) {
            fetchResumes();
        }
    }, [user]);

    const saveInsightNamesToLocalStorage = (updatedNames) => {
        localStorage.setItem('insightNames', JSON.stringify(updatedNames));
    };

    const handleNameChange = (index, newName) => {
        const updatedNames = [...insightNames];
        updatedNames[index] = newName;
        setInsightNames(updatedNames);
        saveInsightNamesToLocalStorage(updatedNames);
    };

    const toggleEditing = (index) => {
        if (editingNameIndex === index) {
            setEditingNameIndex(null);
        } else {
            setEditingNameIndex(index);
        }
    };

    const handleOpen = (resume) => {
        setSelectedResume(resume);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedResume(null);
    };

    return (
        <Layout>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0',
                    marginTop: '-20px',
                    backgroundColor: '#0A1128', // Dark background for the page
                    minHeight: '100vh',
                }}
            >
                {/* Title Section */}
                <Typography
                    variant="h3"
                    sx={{
                        color: '#EB5E28', // Orange accent
                        fontFamily: "'Poppins', sans-serif",
                        marginTop: '0px',
                        paddingTop: '20px',
                        textAlign: 'center',
                    }}
                >
                    Welcome to Application Insights
                </Typography>

                {/* Subtitle Section */}
                <Typography
                    variant="h4"
                    sx={{
                        color: '#EB5E28', // Orange accent
                        fontFamily: "'Poppins', sans-serif",
                        marginTop: '40px',
                        marginBottom: '40px',
                        textAlign: 'center',
                    }}
                >
                    Here you can view your past resume and job uploads, and the personalized tips for each one.
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '90%',
                        maxWidth: '1000px',
                        mx: 'auto',
                        padding: '20px',
                    }}
                >
                    {resumes.length > 0 ? (
                        resumes.map((resume, index) => (
                            <Paper
                                key={resume.id}
                                elevation={6} // Increased elevation for more depth
                                sx={{
                                    width: '100%',
                                    mb: 4,
                                    p: 3,
                                    backgroundColor: '#FFFFFF', // White background for each insight card
                                    borderRadius: '10px', // Rounded corners
                                    color: '#333333', // Dark gray text
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                                    border: '4px solid #EB5E28', // Thicker orange border
                                    textAlign: 'center',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                {editingNameIndex === index ? (
                                    <TextField
                                        variant="outlined"
                                        value={insightNames[index]}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        sx={{
                                            marginBottom: 2,
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '5px',
                                            width: '100%',
                                            input: {
                                                padding: '12px',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#EB5E28', // Orange border
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#FF6F42', // Slightly brighter orange on hover
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#FF6F42', // Brighter orange when focused
                                                },
                                            },
                                            '& label': {
                                                color: '#666', // Softer label color
                                            },
                                        }}
                                    />
                                ) : (
                                    <Typography variant="h6" sx={{ color: '#333333', mb: 2, fontWeight: 'bold' }}>
                                        {insightNames[index]}
                                    </Typography>
                                )}

                                <Button
                                    variant="contained" // Solid button
                                    sx={{
                                        backgroundColor: '#EB5E28', // Orange button by default
                                        color: '#FFFFFF',
                                        mr: 2,
                                        '&:hover': { backgroundColor: '#D9534F' }, // Darker orange on hover
                                    }}
                                    onClick={() => handleOpen({ ...resume, name: insightNames[index] })}
                                >
                                    View {insightNames[index]}
                                </Button>

                                <Button
                                    variant="contained" // Solid button
                                    sx={{
                                        backgroundColor: '#EB5E28', // Orange button by default
                                        color: '#FFFFFF',
                                        '&:hover': { backgroundColor: '#D9534F' }, // Darker orange on hover
                                    }}
                                    onClick={() => toggleEditing(index)}
                                >
                                    {editingNameIndex === index ? 'Save' : 'Edit Name'}
                                </Button>
                            </Paper>
                        ))
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white', textAlign: 'center' }}>
                            No application insights available.
                        </Typography>
                    )}

                    {/* Modal for viewing insight details */}
                    {selectedResume && (
                        <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="insight-modal-title"
                            aria-describedby="insight-modal-description"
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '90%',
                                    maxWidth: '600px',
                                    height: '80%',
                                    bgcolor: '#0A1128', // Same background color as page
                                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Soft shadow for modal
                                    p: 4,
                                    borderRadius: '10px', // Rounded corners for modal
                                    color: '#FFFFFF', // White text for modal
                                    border: '4px solid #EB5E28', // Thicker orange border for modal
                                    overflowY: 'auto',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography id="insight-modal-title" variant="h5" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                        {selectedResume.name} Details
                                    </Typography>
                                    <IconButton onClick={handleClose} sx={{ color: '#FFFFFF' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Job Description Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                        Job Description:
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            backgroundColor: '#FFFFFF', // White background for this section
                                            color: '#333', 
                                            p: 2, 
                                            borderRadius: '5px', // Rounded corners for the section
                                            border: '1px solid #ddd', // Subtle border for definition
                                        }}
                                    >
                                        {selectedResume.jobDescription}
                                    </Typography>
                                </Box>

                                {/* Resume Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                        Resume:
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            backgroundColor: '#FFFFFF', // White background for this section
                                            color: '#333', 
                                            p: 2, 
                                            borderRadius: '5px', // Rounded corners for the section
                                            border: '1px solid #ddd', // Subtle border for definition
                                        }}
                                    >
                                        {selectedResume.resumeText}
                                    </Typography>
                                </Box>

                                {/* Resume Tips Section */}
                                {selectedResume.tips && selectedResume.tips.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                            Resume Tips:
                                        </Typography>
                                        <Box 
                                            sx={{ 
                                                backgroundColor: '#FFFFFF', // White background for this section
                                                p: 2, 
                                                borderRadius: '5px', // Rounded corners for the section
                                                border: '1px solid #ddd', // Subtle border for definition
                                            }}
                                        >
                                            {selectedResume.tips.map((tip, index) => (
                                                <Typography key={index} variant="body2" sx={{ color: '#333333', mb: 1 }}>
                                                    {tip}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Date Saved Section */}
                                {selectedResume.createdAt && (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ color: '#FFFFFF', display: 'block', mt: 2 }}
                                    >
                                        Saved on: {new Date(selectedResume.createdAt.seconds * 1000).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        </Modal>
                    )}
                </Box>
            </Box>
        </Layout>
    );
}
