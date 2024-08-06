// src/UserGroupsDialog.js
import React from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Close, Group as GroupIcon } from '@mui/icons-material';

const UserGroupsDialog = ({ open, onClose, groups, selectedUser }) => {
  if (!open || !selectedUser) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 2,
        zIndex: 1000,
        width: '80%',
        maxWidth: 600,
        backgroundColor: '#fff',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Groepen voor {selectedUser.displayName}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {groups.map((group, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary={group} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserGroupsDialog;
