'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Modal, IconButton, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Visibility, Edit, Delete, Info } from '@mui/icons-material'; // Importing icons
import Layout from '../propathway_layout';
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore"; // Import deleteDoc from Firebase
import { db } from '../../firebase';
import { useUser } from '@clerk/nextjs';
import CloseIcon from '@mui/icons-material/Close';
import "@fontsource/poppins"; // Add Poppins font

export default function ApplicationInsights() {
    const { user } = useUser();
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [insightNames, setInsightNames] = useState([]);
    const [instructionsOpen, setInstructionsOpen] = useState(false); // For the Instructions modal

    useEffect(() => {
        const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];

        const fetchResumes = async () => {
            try {
                const q = query(collection(db, 'resumes'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);

                const resumesList = querySnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    name: savedInsightNames[index] || `Insight #${index + 1}`, // Apply default name if not in local storage
                    createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
                }));
                setResumes(resumesList);
                setInsightNames(resumesList.map((resume, index) => savedInsightNames[index] || `Insight #${index + 1}`)); // Default or stored names
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

    const handleOpen = (resume) => {
        setSelectedResume(resume);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedResume(null);
    };

    const handleEditModalOpen = (resume) => {
        setSelectedResume(resume);
        setEditingName(insightNames[resumes.indexOf(resume)]); // Set current name for editing
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedResume(null);
    };

    const handleSaveName = () => {
        const updatedNames = [...insightNames];
        const index = resumes.indexOf(selectedResume);
        updatedNames[index] = editingName;

        setInsightNames(updatedNames);
        saveInsightNamesToLocalStorage(updatedNames); // Save to local storage

        setEditModalOpen(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "resumes", id));  // Delete the document from Firestore
            const indexToDelete = resumes.findIndex(resume => resume.id === id);

            // Remove the deleted resume and its corresponding name
            const updatedResumes = resumes.filter(resume => resume.id !== id);
            const updatedInsightNames = insightNames.filter((_, index) => index !== indexToDelete);

            setResumes(updatedResumes);  // Update the local state for resumes
            setInsightNames(updatedInsightNames);  // Update the local state for names
            saveInsightNamesToLocalStorage(updatedInsightNames); // Save updated names to local storage

            setEditModalOpen(false); // Close modal after deleting
            console.log('Document deleted successfully');
        } catch (error) {
            console.error("Error deleting document: ", error);  // Log if there's an error
        }
    };

    const handleInstructionsOpen = () => {
        setInstructionsOpen(true);
    };

    const handleInstructionsClose = () => {
        setInstructionsOpen(false);
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
                    backgroundColor: '#0A1128',
                    minHeight: '100vh',
                }}
            >
                {/* Title Section */}
                <Typography
                    variant="h3"
                    sx={{
                        color: '#EB5E28', 
                        fontFamily: "'Poppins', sans-serif",
                        paddingTop: '20px',
                        textAlign: 'center',
                    }}
                >
                    Welcome to Application Insights
                </Typography>

                {/* Instructions Button */}
                <Button
                    variant="outlined"
                    startIcon={<Info />}
                    onClick={handleInstructionsOpen}
                    sx={{ mt: 2, color: '#FFFFFF', borderColor: '#EB5E28', '&:hover': { borderColor: '#FF6F42' } }}
                >
                    Instructions
                </Button>

                {/* Instructions Modal */}
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
                            How to Use Application Insights
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#000000' }}> {/* Changed to black */}
                            This page displays all your uploaded resumes, job descriptions and tips with the following features:
                        </Typography>
                        <ul>
                            <li><strong>View</strong>: Click the "View" button to see the details of the resume, including tips and the uploaded file.</li>
                            <li><strong>Edit</strong>: Click the "Edit" button to rename your resume insight or delete it.</li>
                        </ul>
                    </Box>
                </Modal>

                {/* Table Section */}
                {resumes.length > 0 ? (
                    <TableContainer component={Paper} sx={{ maxWidth: '90%', marginTop: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Date Created</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>View</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {resumes.map((resume, index) => (
                                    <TableRow key={resume.id}>
                                        <TableCell sx={{ fontSize: '16px', backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            {insightNames[index]}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '16px', backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            {resume.createdAt.toLocaleDateString()}
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Visibility />}
                                                sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF' }}
                                                onClick={() => handleOpen(resume)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Edit />}
                                                sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF' }}
                                                onClick={() => handleEditModalOpen(resume)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="h6" sx={{ color: '#FFFFFF', mt: 4 }}>
                        No insights available.
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
                                bgcolor: '#0A1128',
                                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
                                p: 4,
                                borderRadius: '10px',
                                color: '#FFFFFF',
                                border: '4px solid #EB5E28',
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
                                        backgroundColor: '#FFFFFF', 
                                        color: '#333', 
                                        p: 2, 
                                        borderRadius: '5px', 
                                        border: '1px solid #ddd',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {selectedResume.jobDescription}
                                </Typography>
                            </Box>

                            {/* Resume URL Section */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                    Resume:
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        backgroundColor: '#FFFFFF', 
                                        color: '#333', 
                                        p: 2, 
                                        borderRadius: '5px',
                                        border: '1px solid #ddd', 
                                    }}
                                >
                                    <a href={selectedResume.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#EB5E28', textDecoration: 'underline', fontWeight: 'bold' }}>
                                        View Resume
                                    </a>
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
                                            backgroundColor: '#FFFFFF', 
                                            p: 2, 
                                            borderRadius: '5px', 
                                            border: '1px solid #ddd', 
                                        }}
                                    >
                                        <ul style={{ color: '#333', paddingLeft: '20px' }}>
                                            {selectedResume.tips.map((tip, index) => (
                                                <li key={index} style={{ marginBottom: '8px' }}>
                                                    <Typography variant="body2">{tip}</Typography>
                                                </li>
                                            ))}
                                        </ul>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Modal>
                )}

                {/* Edit Modal */}
                {selectedResume && (
                    <Modal
                        open={editModalOpen}
                        onClose={handleEditModalClose}
                        aria-labelledby="edit-modal-title"
                        aria-describedby="edit-modal-description"
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                maxWidth: '600px',
                                bgcolor: '#0A1128',
                                p: 4,
                                borderRadius: '10px',
                                color: '#FFFFFF',
                                border: '4px solid #EB5E28',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography id="edit-modal-title" variant="h5" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                    Edit {selectedResume.name}
                                </Typography>
                                <IconButton onClick={handleEditModalClose} sx={{ color: '#FFFFFF' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Edit Name Field */}
                            <TextField
                                variant="outlined"
                                label="Edit Name"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                fullWidth
                                sx={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '5px',
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#EB5E28',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#FF6F42',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#FF6F42',
                                        },
                                    },
                                }}
                            />

                            {/* Save and Delete Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF', mr: 2 }}
                                    onClick={handleSaveName}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#D9534F', color: '#FFFFFF' }}
                                    onClick={() => handleDelete(selectedResume.id)}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                )}
            </Box>
        </Layout>
    );
}
