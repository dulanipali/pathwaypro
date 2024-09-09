'use client';
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useUser } from '@clerk/nextjs'; // Import the user hook from Clerk

import { db } from '../../firebase'; // Ensure Firebase is initialized correctly
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'; // Firestore methods
import Layout from "../propathway_layout";
import { lightBlue } from "@mui/material/colors";

const tokens = {
  orange: '#EB5E28',
  lightBlue: '#1282A2',
  darkBlue: '#001F54',
  textPrimary: '#000000',
  textSecondary: '#4A4A4A',
};

const Calendar = () => {
  const { user } = useUser(); // Get the current user from Clerk
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null); // New state for editing

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return; // Do not fetch events if user is not logged in

      const q = query(collection(db, 'events'), where('userId', '==', user.id)); // Filter events by user ID
      const querySnapshot = await getDocs(q);
      const eventsFromFirestore = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start.toDate(), // Convert Firestore timestamp to JS Date object
        allDay: doc.data().allDay,
      }));
      setCurrentEvents(eventsFromFirestore);
    };

    fetchEvents();
  }, [user]); // Depend on the user object

  const handleDateClick = (selected) => {
    setSelectedDate(selected.date);
    setNewEventTitle("");
    setEditingEventId(null); // Ensure no event is being edited
    setIsOpen(true);
  };

  const handleEventClick = (selected) => {
    setEditingEventId(selected.event.id); // Set event ID for editing
    setNewEventTitle(selected.event.title); // Pre-fill the title for editing
    setSelectedDate(selected.event.start);
    setIsOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEventId) return;

    try {
      await deleteDoc(doc(db, 'events', deletingEventId));

      setCurrentEvents(currentEvents.filter((event) => event.id !== deletingEventId));

      setIsOpen(false);
      setDeletingEventId(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleAddOrUpdateEvent = async () => {
    if (!selectedDate || !newEventTitle) return;

    const eventData = {
      title: newEventTitle,
      start: selectedDate,
      allDay: true,
      userId: user.id, // Add user ID to the event data
    };

    try {
      if (editingEventId) {
        // Update the existing event
        await updateDoc(doc(db, 'events', editingEventId), eventData);

        setCurrentEvents(currentEvents.map(event =>
          event.id === editingEventId ? { ...eventData, id: editingEventId } : event
        ));
      } else {
        // Add a new event
        const docRef = await addDoc(collection(db, 'events'), eventData);
        setCurrentEvents([...currentEvents, { ...eventData, id: docRef.id }]);
      }
      setIsOpen(false);
      setEditingEventId(null); // Clear editing state
    } catch (e) {
      console.error("Error adding/updating document: ", e);
    }
  };

  const openHelpDialog = () => {
    setHelpDialogOpen(true);
  };

  const closeHelpDialog = () => {
    setHelpDialogOpen(false);
  };

  return (
    <Layout>
      <Box display="flex" sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', padding: '0' }}>
        {/* CALENDAR SIDEBAR */}
        <Box
          sx={{
            width: "20%",
            backgroundColor: tokens.darkBlue,
            padding: "15px",
            borderRadius: "8px",
            color: tokens.textPrimary,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ marginBottom: '20px', color: '#FFFFFF' }}>Events</Typography>
            <List>
              {currentEvents.map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    backgroundColor: tokens.orange,
                    margin: "10px 0",
                    borderRadius: "4px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px',
                    "&:hover": {
                      backgroundColor: tokens.textSecondary,
                    },
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    primaryTypographyProps={{ sx: { color: tokens.textPrimary, fontSize: '16px' } }}
                    secondary={
                      <Typography sx={{ color: tokens.textPrimary, fontSize: '14px' }}>
                        {new Date(event.start).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    }
                  />
                  <Button
                    variant="outlined"
                    sx={{ color: tokens.textPrimary, borderColor: tokens.textPrimary, marginTop: '10px', alignSelf: 'center' }}
                    onClick={() => {
                      setDeletingEventId(event.id);
                      setIsOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
          {/* Help Button */}
          <Box sx={{ marginTop: '20px' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: tokens.orange,
                color: '#FFFFFF',
                width: '100%',
                position: 'fixed',
                bottom: 16, // Distance from the bottom of the screen
                right: 16,   // Distance from the left of the screen
                minWidth: 'auto',
                width: '50px',
                '&:hover': {
                  borderColor: '#FF6F42',
                  backgroundColor: '#FF6F61',
                  color: '#FFFFFF',
                },
                zIndex: 1000 // Ensure it stays on top of other elements
              }}
              onClick={openHelpDialog}
            >
              <HelpOutlineIcon fontSize="large" />
            </Button>
          </Box>
        </Box>

        {/* CALENDAR */}
        <Box sx={{ flexGrow: 1, height: '100%', borderRadius: '8px', backgroundColor: '#FFFFFF', padding: '15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <FullCalendar
            height="100%"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            titleFormat={{ year: 'numeric', month: 'long' }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={currentEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick} // Handle event click to edit
            eventDidMount={(info) => {
              info.el.style.backgroundColor = tokens.orange;
              info.el.style.color = '#FFFFFF';
            }}
            customButtons={{
              title: {
                text: "Title",
                click: function () {
                  console.log("Custom Title");
                }
              }
            }}
            dayHeaderContent={({ date }) => (
              <Typography sx={{ color: tokens.textPrimary }}>
                {new Date(date).toLocaleDateString("en-US", { weekday: 'short' })}
              </Typography>
            )}
            dayCellContent={({ date }) => (
              <Typography sx={{ color: tokens.textPrimary }}>
                {new Date(date).getDate()}
              </Typography>
            )}
          />
        </Box>

        {/* DELETE EVENT DIALOG */}
        <Dialog open={isOpen && deletingEventId !== null} onClose={() => setIsOpen(false)}>
          <DialogTitle>Confirm Delete Event</DialogTitle>
          <DialogContent sx={{ padding: '20px' }}>
            <Typography>Are you sure you want to delete this event?
              ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteEvent} sx={{ color: tokens.orange }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ADD/EDIT EVENT DIALOG */}
        <Dialog open={isOpen && (editingEventId !== null || deletingEventId === null)} onClose={() => setIsOpen(false)}>
          <Box p="20px" sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              {editingEventId ? "Edit Event" : "Add New Event"}
            </Typography>
            <TextField
              label="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: tokens.orange, color: '#FFFFFF', marginTop: '15px' }}
              onClick={handleAddOrUpdateEvent}
            >
              {editingEventId ? "Update Event" : "Add Event"}
            </Button>
          </Box>
        </Dialog>

        {/* HELP DIALOG */}
        <Dialog open={helpDialogOpen} onClose={closeHelpDialog}>
          <DialogTitle>How to Use Calendar</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Welcome to the Calendar! Here’s how you can use it:
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>1. Adding an Event:</strong> Click on any date on the calendar. A dialog will open where you can enter the event name. Click `&quot;`Add Event`&quot;` to save it.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>2. Viewing Events:</strong> Events are listed on the left sidebar under `&quot;`Events`&quot;`. You can see all events scheduled on the calendar.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>3. Editing an Event:</strong> Click on an event in the calendar or sidebar to edit it. Modify the details and click `&quot;`Update Event`&quot;` to save changes.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>4. Deleting an Event:</strong> To delete an event, click on the event in the sidebar and confirm deletion in the dialog that appears.
            </Typography>
            <Typography variant="body2">
              If you need more help, feel free to reach out to the support team!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeHelpDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Calendar;
