'use client';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../propathway_layout';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useUser } from '@clerk/nextjs';

export default function SavedResumes() {
    const { user } = useUser();
    const [resumes, setResumes] = useState([]);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const q = query(collection(db, 'resumes'), where("userId", "==", user?.id));
                const querySnapshot = await getDocs(q);
                const resumesList = querySnapshot.docs.map(doc => doc.data());
                setResumes(resumesList);
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };

        if (user?.id) {
            fetchResumes();
        }
    }, [user]);

    return (
        <Layout>
            <Typography variant="h4" sx={{ color: 'white', fontFamily: "'Lato', sans-serif", mb: 4 }}>
                Saved Resumes
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '80%',
                    maxWidth: '800px',
                    mx: 'auto',
                    backgroundColor: '#1A202C',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                {resumes.length > 0 ? (
                    resumes.map((resume, index) => (
                        <Box key={index} sx={{ mb: 4, width: '100%', textAlign: 'left' }}>
                            <Typography variant="body1" sx={{ backgroundColor: 'white', color: 'black', p: 2, borderRadius: '5px' }}>
                                {resume.resumeText}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#FF6F42', mt: 2, display: 'block' }}>
                                Saved on: {new Date(resume.createdAt.seconds * 1000).toLocaleString()}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1" sx={{ color: 'white' }}>
                        No resumes saved.
                    </Typography>
                )}
            </Box>
        </Layout>
    );
}
