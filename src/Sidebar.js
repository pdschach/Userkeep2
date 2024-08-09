// Sidebar.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Settings as SettingsIcon, Dashboard, Group, CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import SettingsDialog from './SettingsDialog'; // Import SettingsDialog

const drawerWidth = 240;

const primaryColor = '#008075';
const subtleBackgroundColor = '#f8f9fa';
const appBarColor = '#e0e0e0';
const highlightColor = '#A0ADE0';

const Sidebar = ({ children }) => {
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [template, setTemplate] = useState(`
    Beste {{username}},

    Welkom in PC Sint-Amandus.

    Hier vind je je e-mailadres en aanmeldgegevens voor Windows...

    Je nieuwe e-mailadres is: {{email}}

    ...

    Dienst IT & medewerkers Zorgdossier
  `);

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  const handleSaveTemplate = (newTemplate) => {
    setTemplate(newTemplate);
    // Hier kun je het nieuwe template opslaan in lokale opslag of database
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: appBarColor }}>
        <Toolbar>
          <ListItemIcon>
            <Home sx={{ color: primaryColor, fontSize: 36 }} />
          </ListItemIcon>
          <Typography variant="h6" noWrap component="div" sx={{ color: primaryColor, marginLeft: 1, flexGrow: 1 }}>
            Onboard-O-Matic
          </Typography>
          <IconButton color="inherit" onClick={handleOpenSettings}>
            <SettingsIcon />
          </IconButton>
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
          paddingTop: (theme) => theme.spacing(8),
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <SettingsDialog open={settingsDialogOpen} onClose={handleCloseSettings} template={template} onSave={handleSaveTemplate} />
    </Box>
  );
};

export default Sidebar;
