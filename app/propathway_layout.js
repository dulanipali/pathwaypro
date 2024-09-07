import { AppBar, Typography, Container, Toolbar, Box, CssBaseline, IconButton, Button } from '@mui/material';
import { useUser, useClerk } from '@clerk/nextjs';
import { Logout } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const { user } = useUser();
  const { signOut } = useClerk();
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
        background: 'linear-gradient(135deg, #0677A1, #C1C8E4,#8860D0,#84CEEB)',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CssBaseline />

      {/* AppBar with Direct Navigation Items */}
      <AppBar
        position="static"
        sx={{ backgroundColor: '#464866', boxShadow: 'none', width: '100%' }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Roboto, sans-serif', color: 'white' }}
          >
            ProPathway
          </Typography>

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

          {/* Logout Button */}
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

      {/* Main Content Area */}
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
