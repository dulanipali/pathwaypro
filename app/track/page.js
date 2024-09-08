'use client'
import Layout from "../propathway_layout";
import {
    Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, styled, Box, Dialog, Typography, TextField, Button, Select, InputLabel, MenuItem, IconButton, FormControl, DialogActions, DialogContent
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
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
    const [jobDate, setJobDate] = useState(null); // For date field when status is In Progress or Interview
    const [jobApplications, setJobApplications] = useState([]);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [errorPopupOpen, setErrorPopupOpen] = useState(false);
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

    const handleOpenDialog = () => {
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
        setJobTitle("");
        setCompany("");
        setLocation("");
        setPay("");
        setStage("");
        setStatus("");
        setJobDate(null);
    };

    const handleAddJob = async () => {
        if (!jobTitle || !company || !stage || !status) {
            setErrorPopupOpen(true); // Show error popup
            return;
        }

        const newJobApp = {
            jobTitle,
            company,
            location,
            pay,
            stage,
            status,
            jobDate, // Add date field if applicable
            userId: user.id,
        };

        try {
            const docRef = await addDoc(collection(db, "jobApplications"), newJobApp);
            setJobApplications([...jobApplications, { ...newJobApp, id: docRef.id }]);
            handleCloseDialog();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleEdit = (index) => {
        setEditRowIndex(index);
    };

    const handleUpdate = async (index) => {
        const jobApp = jobApplications[index];
        if (!jobApp.jobTitle || !jobApp.company || !jobApp.stage || !jobApp.status) {
            setErrorPopupOpen(true); // Show error popup if any required fields are empty
            return;
        }

        try {
            const jobDocRef = doc(db, "jobApplications", jobApp.id);
            await updateDoc(jobDocRef, {
                jobTitle: jobApp.jobTitle,
                company: jobApp.company,
                location: jobApp.location,
                pay: jobApp.pay,
                stage: jobApp.stage,
                status: jobApp.status,
                jobDate: jobApp.jobDate, // Update job date if applicable
            });
            setEditRowIndex(null);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const updatedJobApplications = [...jobApplications];
        updatedJobApplications[index] = {
            ...updatedJobApplications[index],
            [field]: value,
        };
        setJobApplications(updatedJobApplications);
    };

    const handleDelete = async (index) => {
        const jobToDelete = jobApplications[index];
        try {
            await deleteDoc(doc(db, "jobApplications", jobToDelete.id));
            const updatedJobApplications = jobApplications.filter((_, i) => i !== index);
            setJobApplications(updatedJobApplications);
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleCloseErrorPopup = () => {
        setErrorPopupOpen(false);
    };

    return (
        <Layout>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                gap={2}
            >
                <Typography variant="h4" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
                    Track your job applications
                </Typography>
                <Typography sx={{ color: 'white' }}>Fill in the required fields and track the status.</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenDialog}
                    sx={{ marginBottom: 2 }}
                >
                    Add Job
                </Button>

                <Box minHeight='300px' width='80vw' sx={{ backgroundColor: "white", borderRadius: '10px' }}>
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
                                    <StyledTableCell align="right">Date</StyledTableCell>
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
                                                            handleFieldChange(index, 'jobTitle', e.target.value)
                                                        }
                                                    />
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    <TextField
                                                        fullWidth
                                                        value={jobApp.company}
                                                        onChange={(e) =>
                                                            handleFieldChange(index, 'company', e.target.value)
                                                        }
                                                    />
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    <TextField
                                                        fullWidth
                                                        value={jobApp.location}
                                                        onChange={(e) =>
                                                            handleFieldChange(index, 'location', e.target.value)
                                                        }
                                                    />
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    <TextField
                                                        fullWidth
                                                        value={jobApp.pay}
                                                        onChange={(e) =>
                                                            handleFieldChange(index, 'pay', e.target.value)
                                                        }
                                                    />
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    <Select
                                                        value={jobApp.stage}
                                                        onChange={(e) =>
                                                            handleFieldChange(index, 'stage', e.target.value)
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
                                                            handleFieldChange(index, 'status', e.target.value)
                                                        }
                                                        fullWidth
                                                    >
                                                        <MenuItem value={'Active'}>Active</MenuItem>
                                                        <MenuItem value={'Closed'}>Closed</MenuItem>
                                                    </Select>
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    {(jobApp.stage === 'In Progress' || jobApp.stage === 'Interview') && (
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DemoContainer components={['DatePicker']}>
                                                                <DatePicker
                                                                    label="Choose Date"
                                                                    value={jobApp.jobDate}
                                                                    onChange={(newValue) => handleFieldChange(index, 'jobDate', newValue)}
                                                                    renderInput={(params) => <TextField {...params} />}
                                                                />
                                                            </DemoContainer>
                                                        </LocalizationProvider>
                                                    )}
                                                </StyledTableCell>

                                                <StyledTableCell align="right">
                                                    <IconButton onClick={() => handleUpdate(index)}>
                                                        <DoneIcon />
                                                    </IconButton>
                                                </StyledTableCell>
                                            </>
                                        ) : (
                                            <>
                                                <StyledTableCell component="th" scope="row">
                                                    {jobApp.jobTitle}
                                                </StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.company}</StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.location}</StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.pay}</StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.stage}</StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.status}</StyledTableCell>
                                                <StyledTableCell align="right">{jobApp.jobDate?.toDateString() || ''}</StyledTableCell>
                                                <StyledTableCell align="right">
                                                    <IconButton onClick={() => handleEdit(index)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </StyledTableCell>
                                            </>
                                        )}
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Dialog open={isOpen} onClose={handleCloseDialog}>
                    <DialogContent>
                        <Typography variant="h6" gutterBottom>
                            Add New Job Application
                        </Typography>
                        <TextField
                            label="Job Title"
                            fullWidth
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Company"
                            fullWidth
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Location"
                            fullWidth
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            label="Pay"
                            fullWidth
                            value={pay}
                            onChange={(e) => setPay(e.target.value)}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Stage</InputLabel>
                            <Select
                                value={stage}
                                required
                                onChange={(e) => setStage(e.target.value)}
                            >
                                <MenuItem value={'In Progress'}>In Progress</MenuItem>
                                <MenuItem value={'Applied'}>Applied</MenuItem>
                                <MenuItem value={'Interview'}>Interview</MenuItem>
                                <MenuItem value={'Follow up'}>Follow up</MenuItem>
                            </Select>
                        </FormControl>
                        {(stage === 'In Progress' || stage === 'Interview') && (
                            <TextField
                                label={(stage == 'In Progress' ? "Apply by Date" : "Interview Date")}
                                type="date"
                                value={jobDate}
                                onChange={(e) => handleFieldChange(index, 'jobDate', e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                required
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value={'Active'}>Active</MenuItem>
                                <MenuItem value={'Closed'}>Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleAddJob} color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Error Dialog for empty fields */}
                <Dialog open={errorPopupOpen} onClose={handleCloseErrorPopup}>
                    <DialogContent>
                        <Typography color="error">Please fill in all required fields.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseErrorPopup} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout >
    );
}
