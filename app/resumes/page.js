'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Modal, IconButton, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { Visibility, Edit, Delete, Info } from '@mui/icons-material';
import Layout from '../propathway_layout';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db, storage } from '../../firebase';
import { useUser } from '@clerk/nextjs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CloseIcon from '@mui/icons-material/Close';
import "@fontsource/poppins";

export default function ApplicationInsights() {
    const { user } = useUser();
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [insightNames, setInsightNames] = useState([]);
    const [instructionsOpen, setInstructionsOpen] = useState(false);
    const [newResumeText, setNewResumeText] = useState('');
    const [newResumeFile, setNewResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newResumes, setNewResumes] = useState([]);

    useEffect(() => {
        const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];

        const fetchResumes = async () => {
            try {
                // Retrieve the latest saved names from localStorage
                const savedInsightNames = JSON.parse(localStorage.getItem('insightNames')) || [];
                console.log("Retrieved names from localStorage:", savedInsightNames); // Debugging

                // Fetch resumes from Firestore
                const q = query(collection(db, 'resumes'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);

                // Map the fetched resumes to include the saved names
                const resumesList = querySnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    name: savedInsightNames[index] || `Insight #${index + 1}`, // Use saved name or default
                    createdAt: doc.data().createdAt.toDate(),
                }));

                // Update state with the fetched resumes
                setResumes(resumesList);
                setInsightNames(resumesList.map((resume, index) => savedInsightNames[index] || `Insight #${index + 1}`));
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };


        const fetchNewResumes = async () => {
            if (user?.id) {
                try {
                    const newResumesQuery = query(collection(db, 'newResumes'), where("userId", "==", user?.id));
                    const querySnapshot = await getDocs(newResumesQuery);
                    setNewResumes(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                } catch (error) {
                    console.error("Error fetching new resumes:", error);
                }
            }
        };

        if (user?.id) {
            fetchResumes();
            fetchNewResumes();
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
        setEditingName(insightNames[resumes.indexOf(resume)]);
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
        saveInsightNamesToLocalStorage(updatedNames);

        setEditModalOpen(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "resumes", id));
            const indexToDelete = resumes.findIndex(resume => resume.id === id);

            const updatedResumes = resumes.filter(resume => resume.id !== id);
            const updatedInsightNames = insightNames.filter((_, index) => index !== indexToDelete);

            setResumes(updatedResumes);
            setInsightNames(updatedInsightNames);
            saveInsightNamesToLocalStorage(updatedInsightNames);

            setEditModalOpen(false);
            console.log('Document deleted successfully');
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleNewResumeUpload = async () => {
        if (!newResumeText && !newResumeFile) {
            alert("Please paste a resume or upload a file.");
            return;
        }

        setLoading(true);

        try {
            let fileUrl = '';
            if (newResumeFile) {
                const fileRef = ref(storage, `newResumes/${user?.id}/${newResumeFile.name}`);
                await uploadBytes(fileRef, newResumeFile);
                fileUrl = await getDownloadURL(fileRef);
            }

            const newResumeData = {
                userId: user?.id,
                resumeText: newResumeText || '',
                fileUrl: fileUrl || '',
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'newResumes'), newResumeData);

            setNewResumeText('');
            setNewResumeFile(null);
            setOpen(false);

            const newResumesQuery = query(collection(db, 'newResumes'), where("userId", "==", user?.id));
            const querySnapshot = await getDocs(newResumesQuery);
            setNewResumes(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error uploading new resume:", error);
        }

        setLoading(false);
    };

    const handleResumeFileChange = (e) => {
        const file = e.target.files[0];
        setNewResumeFile(file);
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
                    minHeight: '100vh',
                }}
            >
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

                <Button
                    variant="outlined"
                    startIcon={<Info />}
                    onClick={handleInstructionsOpen}
                    sx={{ mt: 2, color: '#FFFFFF', borderColor: '#EB5E28', '&:hover': { borderColor: '#FF6F42' } }}
                >
                    Instructions
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
                            How to Use Application Insights
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#000000' }}>
                            This page displays all your uploaded resumes, job descriptions, and tips with the following features:
                        </Typography>
                        <ul style={{ color: '#000000' }}>
                            <li><strong>Job Description/Prep</strong>: Click the `&quot;`Job Description/Prep`&quot;` button to see the job description, or `&quot;`Resume/Tips`&quot;` to view the resume and tips.</li>
                            <li><strong>Edit</strong>: Click the `&quot;`Edit`&quot;` icon to rename or delete your resume insight.</li>
                        </ul>
                    </Box>
                </Modal>

                {resumes.length > 0 ? (
                    <TableContainer component={Paper} sx={{ maxWidth: '90%', marginTop: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Date Created</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Job Description/Prep</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Resume/Tips</TableCell>
                                    <TableCell sx={{ backgroundColor: '#D3D3D3', color: '#0A1128', fontSize: '18px', fontWeight: 'bold' }}>Actions</TableCell>
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
                                                onClick={() => handleOpen({ ...resume, viewType: 'description' })}
                                            >
                                                Job Description/Prep
                                            </Button>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Visibility />}
                                                sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF' }}
                                                onClick={() => handleOpen({ ...resume, viewType: 'resume' })}
                                            >
                                                Resume/Tips
                                            </Button>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#FFFFFF', color: '#0A1128' }}>
                                            <IconButton
                                                onClick={() => handleEditModalOpen(resume)}
                                                sx={{ color: '#EB5E28' }}
                                            >
                                                <Edit />
                                            </IconButton>
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

                {/* Modal for Job Description/Prep */}
                {selectedResume && selectedResume.viewType === 'description' && (
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
                                    {selectedResume.name} - Job Description/Prep
                                </Typography>
                                <IconButton onClick={handleClose} sx={{ color: '#FFFFFF' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold', mb: 1 }}>
                                    Job Description:
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        backgroundColor: '#F7F7F7',
                                        color: '#333',
                                        p: 2,
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        whiteSpace: 'pre-line',
                                        lineHeight: '1.6',
                                        fontFamily: "'Poppins', sans-serif",
                                    }}
                                >
                                    {selectedResume.jobDescription}
                                </Typography>
                                {selectedResume.prep && selectedResume.prep.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                            Interview Prep:
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
                                                {selectedResume.prep.map((prep, index) => (
                                                    <li key={index} style={{ marginBottom: '8px' }}>
                                                        <Typography variant="body2">{prep}</Typography>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Modal>
                )}

                {/* Modal for Resume/Tips */}
                {selectedResume && selectedResume.viewType === 'resume' && (
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
                                    {selectedResume.name} - Update Resume
                                </Typography>
                                <IconButton onClick={handleClose} sx={{ color: '#FFFFFF' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold', mb: 1 }}>
                                    Paste new resume or upload a PDF:
                                </Typography>

                                {/* Resume Text Input */}
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    variant="outlined"
                                    value={newResumeText}
                                    placeholder="Paste your resume as plain text here..."
                                    onChange={(e) => setNewResumeText(e.target.value)}
                                    sx={{ mb: 2, backgroundColor: '#FAF9F6', borderRadius: '5px' }}
                                />

                                {/* Resume File Upload */}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleResumeFileChange}
                                    style={{ marginBottom: '16px', color: 'white' }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                onClick={handleNewResumeUpload}
                                sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Resume'}
                            </Button>

                            {/* Display New Resume */}
                            {newResumes.map((newResume, index) => (
                                <Box sx={{ mt: 4 }} key={index}>
                                    {newResume.resumeText ? (
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold', mb: 1 }}>
                                                Pasted Resume:
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
                                                {newResume.resumeText}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold', mb: 1 }}>
                                                Uploaded Resume (PDF):
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ backgroundColor: '#FFFFFF', p: 2, borderRadius: '5px', border: '1px solid #ddd' }}
                                            >
                                                <a href={newResume.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                                                    color: '#EB5E28', textDecoration:
                                                        'underline', fontWeight: 'bold'
                                                }}>
                                                    View Uploaded Resume
                                                </a>
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))}

                            {/* Display Tips */}
                            {selectedResume.tips && selectedResume.tips.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#EB5E28', fontWeight: 'bold' }}>
                                        Resume Tips:
                                    </Typography>
                                    <Box sx={{ backgroundColor: '#FFFFFF', p: 2, borderRadius: '5px', border: '1px solid #ddd' }}>
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

                {selectedResume && (
                    <Modal open={editModalOpen} onClose={handleEditModalClose}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80%',
                                maxWidth: '500px',
                                bgcolor: '#FFFFFF',
                                boxShadow: 24,
                                p: 4,
                                borderRadius: '8px',
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EB5E28', mb: 2 }}>
                                Edit Insight Name
                            </Typography>
                            <TextField
                                fullWidth
                                label="Insight Name"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={handleEditModalClose}
                                    variant="outlined"
                                    sx={{ mr: 2, color: '#EB5E28', borderColor: '#EB5E28' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveName}
                                    variant="contained"
                                    sx={{ backgroundColor: '#EB5E28', color: '#FFFFFF' }}
                                >
                                    Save
                                </Button>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    onClick={() => handleDelete(selectedResume.id)}
                                    variant="contained"
                                    color="error"
                                    sx={{ backgroundColor: '#E53935', color: '#FFFFFF' }}
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
