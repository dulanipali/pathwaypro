import { useState } from 'react';
import {
    AppBar,
    Typography,
    Container,
    Toolbar,
    Box,
    CssBaseline,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { Logout, Menu as MenuIcon, ChevronLeft } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const drawerWidth = 240; // Set the width of the sidebar

export default function Layout({ children }) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [menuOpen, setMenuOpen] = useState(true); // Menu visible by default
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    const toggleMenu = () => {
        setMenuOpen((prevOpen) => !prevOpen); // Toggle menu visibility
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #5680E9, #84CEEB, #5AB9EA, #C1C8E4, #8860D0)',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'row', // Horizontal layout to include the sidebar
            }}
        >
            <CssBaseline />

            {/* Sidebar Drawer */}
            <Drawer
                variant="persistent"
                anchor="left"
                open={menuOpen}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#0A1128',
                        color: 'white',
                        width: drawerWidth, // Sidebar width
                        transition: 'width 0.3s ease', // Smooth transition for opening/closing
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    {/* Hide menu button */}
                    <IconButton onClick={toggleMenu} sx={{ color: 'white' }}>
                        <ChevronLeft />
                    </IconButton>
                </Box>
                <Divider />
                <List>
                    {/* Navigation Menu Items */}
                    {[
                        { text: 'Dashboard', path: '/dashboard' },
                        { text: 'Track Applications', path: '/track' },
                        { text: 'Application Insights', path: '/resumes' },
                        { text: 'Calendar', path: '/calendar' },
                    ].map((item) => (
                        <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                            <ListItemText primary={item.text} sx={{ textAlign: 'left', color: 'white' }} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'margin-left 0.3s ease', // Smooth transition for resizing content
                    marginLeft: menuOpen ? `${drawerWidth}px` : '0px', // Adjust margin based on menu state
                    width: `calc(100% - ${menuOpen ? drawerWidth : 0}px)`, // Adjust width based on menu state
                }}
            >
                <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                    <Toolbar>
                        {/* Show Menu Button */}
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleMenu}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif', color: 'white' }}>
                            ProPathway
                        </Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={() => signOut()}
                            sx={{
                                ml: 2,
                                color: 'white',
                            }}
                        >
                            <Logout />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                {/* Page Content */}
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flexGrow: 1, mt: 4 }}
                >
                    {children}
                </Box>
            </Box>
        </Container>
    );
}
