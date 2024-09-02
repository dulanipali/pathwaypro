'use client'
import Layout from "../propathway_layout";
import Scheduler from "react-mui-scheduler";
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

export default function Calendar() {
    const [events, setEvents] = useState([
        {
            id: "event-1",
            label: "Medical consultation",
            groupLabel: "Dr Shaun Murphy",
            user: "Dr Shaun Murphy",
            color: "#f28f6a",
            startHour: "04:00 AM",
            endHour: "05:00 AM",
            date: "2024-09-05",
            createdAt: new Date(),
            createdBy: "Kristina Mayer"
        },
        // More initial events if necessary
    ]);

    const [state] = useState({
        options: {
            transitionMode: "zoom", // or fade
            startWeekOn: "mon",     // or sun
            defaultMode: "month",   // or week | day | timeline
            minWidth: 540,
            maxWidth: 540,
            minHeight: 540,
            maxHeight: 540
        },
        alertProps: {
            open: true,
            color: "info",          // info | success | warning | error
            severity: "info",       // info | success | warning | error
            message: "🚀 Let's start with awesome react-mui-scheduler 🔥 🔥 🔥",
            showActionButton: true,
            showNotification: true,
            delay: 1500
        },
        toolbarProps: {
            showSearchBar: true,
            showSwitchModeButtons: true,
            showDatePicker: true
        }
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        label: '',
        groupLabel: '',
        user: '',
        color: '#f28f6a', // Default color, can be customized
        startHour: '',
        endHour: '',
        date: ''
    });

    const handleEventsChange = (updatedEvents) => {
        // We won't use this for now, but it's here if needed in the future
    };

    const handleAddEvent = () => {
        setEvents([
            ...events,
            {
                ...newEvent,
                id: `event-${events.length + 1}`,
                createdAt: new Date(),
                createdBy: "Current User" // Replace with actual user data if needed
            }
        ]);
        setIsDialogOpen(false);
        setNewEvent({ label: '', groupLabel: '', user: '', color: '#f28f6a', startHour: '', endHour: '', date: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <Layout>
            <Button variant="contained" onClick={() => setIsDialogOpen(true)}>Add Event</Button>
            
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Event Label"
                        name="label"
                        fullWidth
                        value={newEvent.label}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="Group Label"
                        name="groupLabel"
                        fullWidth
                        value={newEvent.groupLabel}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="User"
                        name="user"
                        fullWidth
                        value={newEvent.user}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="Start Hour (e.g., 09:00 AM)"
                        name="startHour"
                        fullWidth
                        value={newEvent.startHour}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="End Hour (e.g., 10:00 AM)"
                        name="endHour"
                        fullWidth
                        value={newEvent.endHour}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="Date (e.g., 2024-09-05)"
                        name="date"
                        fullWidth
                        value={newEvent.date}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogActions>
            </Dialog>

            <Scheduler
                locale="en"
                events={events}
                legacyStyle={false}
                options={state?.options}
                alertProps={state?.alertProps}
                toolbarProps={state?.toolbarProps}
                onEventsChange={handleEventsChange}
            />
        </Layout>
    );
}
