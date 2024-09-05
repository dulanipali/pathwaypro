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
    const [editingNameIndex, setEditingNameIndex] = useState(null); // Track the index of the editing insight
    const [insightNames, setInsightNames] = useState([]); // Add state to store insight names

    // Retrieve saved insight names from localStorage when the component mounts
    useEffect(() => {
        const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];
        const fetchResumes = async () => {
            try {
                const q = query(collection(db, 'resumes'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);
                const resumesList = querySnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    name: savedInsightNames[index] || `Insight #${index + 1}`, // Use localStorage name or default
                }));
                setResumes(resumesList);
                setInsightNames(resumesList.map((resume, index) => savedInsightNames[index] || `Insight #${index + 1}`)); // Initialize with localStorage or default names
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };

        if (user?.id) {
            fetchResumes();
        }
    }, [user]);

    // Save updated insight names to localStorage
    const saveInsightNamesToLocalStorage = (updatedNames) => {
        localStorage.setItem('insightNames', JSON.stringify(updatedNames));
    };

    const handleNameChange = (index, newName) => {
        const updatedNames = [...insightNames];
        updatedNames[index] = newName;
        setInsightNames(updatedNames);
        saveInsightNamesToLocalStorage(updatedNames); // Save the updated names to localStorage
    };

    const toggleEditing = (index) => {
        if (editingNameIndex === index) {
            setEditingNameIndex(null); // Stop editing
        } else {
            setEditingNameIndex(index); // Start editing
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
                    marginTop: '-20px', // Move the title higher
                }}
            >
                {/* New Title Section */}
                <Typography
                    variant="h3"
                    sx={{
                        color: '#EB5E28', // Orange
                        fontFamily: "'Poppins', sans-serif",
                        marginTop: '0px',  // Positioned at the top
                        paddingTop: '20px', // No padding above
                        textAlign: 'center',
                    }}
                >
                    Welcome to Application Insights
                </Typography>

                {/* Existing Title with more space between */}
                <Typography
                    variant="h4"
                    sx={{
                        color: '#EB5E28',
                        fontFamily: "'Poppins', sans-serif",
                        marginTop: '40px',  // More space between the titles
                        marginBottom: '40px', // Space below the title
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
                                elevation={4}
                                sx={{
                                    width: '100%',
                                    mb: 4,
                                    p: 3,
                                    backgroundColor: '#1A202C',
                                    borderRadius: '10px',
                                    color: 'white',
                                    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)',
                                    border: '2px solid #EB5E28',
                                    textAlign: 'center',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                {/* Editable Insight Name */}
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
                                            backgroundColor: 'white',
                                            borderRadius: '5px',
                                            width: '100%',
                                            input: {
                                                padding: '12px', // Add padding inside the input
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#EB5E28', // Set border color to match the theme
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#FF6F42', // Border color on hover
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#FF6F42', // Border color when focused
                                                },
                                            },
                                            '& label': {
                                                color: '#FF6F42', // Label color
                                            },
                                        }}
                                    />
                                ) : (
                                    <Typography variant="h6" sx={{ color: '#FF6F42', mb: 2 }}>
                                        {insightNames[index]}
                                    </Typography>
                                )}

                                <Button
                                    variant="outlined"
                                    sx={{ color: '#EB5E28', borderColor: '#EB5E28', mr: 2 }}
                                    onClick={() => handleOpen({ ...resume, name: insightNames[index] })}
                                >
                                    View {insightNames[index]}
                                </Button>

                                <Button
                                    variant="outlined"
                                    sx={{ color: '#FF6F42', borderColor: '#FF6F42' }}
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
                                    bgcolor: '#1A202C',
                                    boxShadow: 24,
                                    p: 4,
                                    borderRadius: '10px',
                                    color: 'white',
                                    border: '2px solid #EB5E28',
                                    overflowY: 'auto',
                                    fontFamily: "'Poppins', sans-serif" // Apply Poppins to entire modal content
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography id="insight-modal-title" variant="h5" sx={{ color: '#FF6F42', fontFamily: "'Poppins', sans-serif" }}>
                                        {selectedResume.name} Details
                                    </Typography>
                                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#FF6F42' }}>
                                        Job Description:
                                    </Typography>
                                    <Typography variant="body1" sx={{ backgroundColor: '#f4f4f4', color: 'black', p: 2, borderRadius: '5px' }}>
                                        {selectedResume.jobDescription}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#FF6F42' }}>
                                        Resume:
                                    </Typography>
                                    <Typography variant="body1" sx={{ backgroundColor: '#f4f4f4', color: 'black', p: 2, borderRadius: '5px' }}>
                                        {selectedResume.resumeText}
                                    </Typography>
                                </Box>

                                {selectedResume.tips && selectedResume.tips.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#FF6F42' }}>
                                            Resume Tips:
                                        </Typography>
                                        <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: '5px', mt: 1 }}>
                                            {selectedResume.tips.map((tip, index) => (
                                                <Typography key={index} variant="body2" sx={{ color: 'black', mb: 1 }}>
                                                    {tip}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {selectedResume.createdAt && (
                                    <Typography variant="caption" sx={{ color: '#FF6F42', display: 'block', mt: 2 }}>
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
