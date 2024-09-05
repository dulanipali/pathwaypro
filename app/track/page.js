'use client'
import Layout from "../propathway_layout";
import {
    Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, styled, Box, Dialog, Typography, TextField, Button, Select, InputLabel, MenuItem, IconButton, FormControl

} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '@clerk/nextjs';

// Styled components for table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function TrackApplications() {
    const [isOpen, setIsOpen] = useState(false);
    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [pay, setPay] = useState("");
    const [stage, setStage] = useState("");
    const [status, setStatus] = useState("");
    const [jobApplications, setJobApplications] = useState([]);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchJobApplications = async () => {
            try {
                const q = query(collection(db, 'jobApplications'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);
                const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJobApplications(jobs);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            }
        };

        if (user?.id) {
            fetchJobApplications();
        }
    }, [user]);

    // Function to open the dialog
    const handleOpenDialog = () => {
        setIsOpen(true);
    };

    // Function to close the dialog
    const handleCloseDialog = () => {
        setIsOpen(false);
        setJobTitle("");
        setCompany("");
        setLocation("");
        setPay("");
        setStage("");
        setStatus("");
    };

    // Function to add a new job application to the table
    const handleAddJob = async () => {
        const newJobApp = {
            jobTitle,
            company,
            location,
            pay,
            stage,
            status,
        };
        try {
            await addDoc(collection(db, "jobApplications"), newJobApp);
            setJobApplications([...jobApplications, newJobApp]);
            handleCloseDialog();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    // Function to handle editing a specific cell
    const handleEdit = (index) => {
        setEditRowIndex(index);
    };

    // Function to handle updating the table data after editing
    const handleUpdate = async (index, field, value) => {
        const updatedJobApplications = [...jobApplications];
        updatedJobApplications[index] = {
            ...updatedJobApplications[index],
            [field]: value,
        };
        setJobApplications(updatedJobApplications);

        try {
            const jobDocRef = doc(db, "jobApplications", updatedJobApplications[index].id);
            await updateDoc(jobDocRef, { [field]: value });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    // Function to stop editing
    const handleSave = () => {
        setEditRowIndex(null);
    };


    return (
        <Layout>
            <Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenDialog}
                    sx={{ marginBottom: 2 }}
                >
                    Add Job
                </Button>

                {/* Job Applications Table */}
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Job Title</StyledTableCell>
                                <StyledTableCell align="right">Company</StyledTableCell>
                                <StyledTableCell align="right">Location</StyledTableCell>
                                <StyledTableCell align="right">Pay</StyledTableCell>
                                <StyledTableCell align="right">Stage</StyledTableCell>
                                <StyledTableCell align="right">Status</StyledTableCell>
                                <StyledTableCell align="right">Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobApplications.map((jobApp, index) => (
                                <StyledTableRow key={index}>
                                    {editRowIndex === index ? (
                                        <>
                                            <StyledTableCell component="th" scope="row">
                                                <TextField
                                                    fullWidth
                                                    value={jobApp.jobTitle}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'jobTitle', e.target.value)
                                                    }
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                <TextField
                                                    fullWidth
                                                    value={jobApp.company}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'company', e.target.value)
                                                    }
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                <TextField
                                                    fullWidth
                                                    value={jobApp.location}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'location', e.target.value)
                                                    }
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                <TextField
                                                    fullWidth
                                                    value={jobApp.pay}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'pay', e.target.value)
                                                    }
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                <Select
                                                    value={jobApp.stage}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'stage', e.target.value)
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem value={'In Progress'}>In Progress</MenuItem>
                                                    <MenuItem value={'Applied'}>Applied</MenuItem>
                                                    <MenuItem value={'Interview'}>Interview</MenuItem>
                                                    <MenuItem value={'Follow up'}>Follow up</MenuItem>
                                                </Select>
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                <Select
                                                    value={jobApp.status}
                                                    onChange={(e) =>
                                                        handleUpdate(index, 'status', e.target.value)
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem value={'Active'}>Active</MenuItem>
                                                    <MenuItem value={'Rejected'}>Rejected</MenuItem>
                                                </Select>
                                            </StyledTableCell>
                                        </>
                                    ) : (
                                        <>
                                            <StyledTableCell component="th" scope="row">
                                                {jobApp.jobTitle}
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                {jobApp.company}
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                {jobApp.location}
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                {jobApp.pay}
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                {jobApp.stage}
                                            </StyledTableCell>

                                            <StyledTableCell align="right">
                                                {jobApp.status}
                                            </StyledTableCell>
                                        </>
                                    )}

                                    <StyledTableCell align="right">
                                        {editRowIndex === index ? (
                                            <IconButton onClick={handleSave}>
                                                <DoneIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={() => handleEdit(index)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Add Job Dialog */}
                <Dialog open={isOpen} onClose={handleCloseDialog}>
                    <Box p={3}>
                        <Typography variant="h6" gutterBottom>
                            Add New Job Application
                        </Typography>

                        <TextField
                            label="Job Title"
                            fullWidth
                            margin="normal"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                        />
                        <TextField
                            label="Company"
                            fullWidth
                            margin="normal"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required
                        />
                        <TextField
                            label="Location"
                            fullWidth
                            margin="normal"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <TextField
                            label="Pay"
                            fullWidth
                            margin="normal"
                            value={pay}
                            onChange={(e) => setPay(e.target.value)}
                        />
                        <InputLabel id="stage-select-stage-label">Stage</InputLabel>
                        <Select
                            labelId="select-stage-label"
                            id="select-stage"
                            value={stage}
                            label="Stage"
                            onChange={(e) => setStage(e.target.value)}
                            fullWidth
                            required
                        >
                            <MenuItem value={'In Progress'}>In Progress</MenuItem>
                            <MenuItem value={'Applied'}>Applied</MenuItem>
                            <MenuItem value={'Interview'}>Interview</MenuItem>
                            <MenuItem value={'Follow up'}>Follow up</MenuItem>
                        </Select>
                        <InputLabel id="select-status-label">Status</InputLabel>
                        <Select
                            labelId="select-status-label"
                            id="select-status"
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                            fullWidth
                            required
                        >
                            <MenuItem value={'Active'}>Active</MenuItem>
                            <MenuItem value={'Rejected'}>Rejected</MenuItem>
                        </Select>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleAddJob} color="primary">
                                Add
                            </Button>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </Layout>
    );
}
