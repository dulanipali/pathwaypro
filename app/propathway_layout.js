import { useState } from 'react';
import { AppBar, Typography, Container, Toolbar, Box, CssBaseline, IconButton, Menu, MenuItem } from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                backgroundColor: '#0A1128',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CssBaseline />

            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon></MenuIcon>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            '& .MuiPaper-root': {
                                backgroundColor: '#0A1128'
                            }
                        }}
                    >
                        <MenuItem onClick={handleCloseNavMenu} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Dashboard</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/track')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Track Applications</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/resumes')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Saved Resumes</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/calendar')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Calendar</Typography>
                        </MenuItem>
                    </Menu>

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

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ flexGrow: 1, mt: 4 }}
            >
                {children}
            </Box>
        </Container>
    );
}
