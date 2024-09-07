import { useState } from 'react';
import { AppBar, Typography, Container, Toolbar, Box, CssBaseline, IconButton, Menu, MenuItem, Paper, Button } from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { dark, shadesOfPurple } from '@clerk/themes'
import EventIcon from '@mui/icons-material/Event';

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
                background: "linear-gradient(170deg, #0A1128 32.27%, #001F54 51.49%, #034078 71.03%, #0A1128 99.51%)",
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CssBaseline />

            <AppBar position="static" sx={{ backgroundColor: '#0A1128', boxShadow: 'none', width: '100%' }}>
                <Toolbar >
                    {/*<IconButton
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
                        <MenuItem onClick={() => handleNavigation('/dashboard')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Dashboard</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/track')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Track Applications</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/resumes')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Application Insights</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/calendar')} sx={{ color: 'white', textAlign: 'left' }}>
                            <Typography>Calendar</Typography>
                        </MenuItem>
                    </Menu>*/}
                    <Paper elevation={0} sx={{ flexGrow: 1, backgroundColor: '#0A1128' }}>
                        <img src="logo.png" height="40px" width="200px" />
                    </Paper>
                    {/* Navigation Items */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="inherit" onClick={() => handleNavigation('/dashboard')} sx={{ color: 'white' }}>
                            Dashboard
                        </Button>
                        <Button color="inherit" onClick={() => handleNavigation('/track')} sx={{ color: 'white' }}>
                            Track Applications
                        </Button>
                        <Button color="inherit" onClick={() => handleNavigation('/resumes')} sx={{ color: 'white' }}>
                            Application Insights
                        </Button>
                        <Button color="inherit" onClick={() => handleNavigation('/calendar')} sx={{ color: 'white' }}>
                            Calendar
                        </Button>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => handleNavigation('/calendar')}
                        sx={{
                            ml: 2,
                            color: 'white',
                        }}
                    >
                        <EventIcon />
                    </IconButton>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => signOut()}
                        sx={{
                            ml: 2,
                            color: 'white',
                            paddingRight: '30px',
                        }}
                    >
                        <Logout />
                    </IconButton>
                    <UserButton
                        appearance={{
                            baseTheme: [dark],
                            variables: { colorBackground: '#0A1128' }
                        }}
                    />
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
