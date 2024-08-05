// Sidebar.js
import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, Box, Divider } from '@mui/material';
import { Dashboard, Group, CheckCircle, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

// Huisstijlkleuren
const primaryColor = '#008075'; // Groen voor actieve elementen
const subtleBackgroundColor = '#f8f9fa'; // Subtiele achtergrondkleur voor main content
const appBarColor = '#e0e0e0'; // Subtiele kleur voor de AppBar
const highlightColor = '#A0ADE0'; // Voor randen en highlights

const Sidebar = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: appBarColor }}>
        <Toolbar>
          <ListItemIcon>
            <Home sx={{ color: primaryColor, fontSize: 36 }} />
          </ListItemIcon>
          <Typography variant="h6" noWrap component="div" sx={{ color: primaryColor, marginLeft: 1 }}>
            Onboard-O-Matic
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          height: '100vh',
          position: 'fixed',
          backgroundColor: subtleBackgroundColor,
          overflowY: 'auto',
          borderRight: `1px solid ${highlightColor}`,
          paddingTop: (theme) => theme.spacing(8),
        }}
        aria-label="sidebar"
      >
        <Divider />
        <List>
          <ListItem>
            <ListItemText primary="Onboard-O-Matic" secondary="Because IT deserves an easy button!" sx={{ color: primaryColor }} />
          </ListItem>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button sx={{ '&:hover': { backgroundColor: highlightColor } }}>
              <ListItemIcon>
                <Dashboard sx={{ color: primaryColor }} />
              </ListItemIcon>
              <ListItemText primary="Laatst aangemaakte users (Entra)" sx={{ color: primaryColor }} />
            </ListItem>
          </Link>
          <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button sx={{ '&:hover': { backgroundColor: highlightColor } }}>
              <ListItemIcon>
                <Group sx={{ color: primaryColor }} />
              </ListItemIcon>
              <ListItemText primary="Gebruikerslijst To-Do" sx={{ color: primaryColor }} />
            </ListItem>
          </Link>
          <Link to="/completed" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button sx={{ '&:hover': { backgroundColor: highlightColor } }}>
              <ListItemIcon>
                <CheckCircle sx={{ color: primaryColor }} />
              </ListItemIcon>
              <ListItemText primary="Voltooide Gebruikers" sx={{ color: primaryColor }} />
            </ListItem>
          </Link>
        </List>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: `${drawerWidth}px`,
          backgroundColor: subtleBackgroundColor,
          minHeight: '100vh',
          paddingTop: (theme) => theme.spacing(8), // Zorg ervoor dat het hoofdgedeelte onder de AppBar begint
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
