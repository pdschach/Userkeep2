// CompletedUsers.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'; // Voeg 'setDoc' toe hier
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Restore,
  Delete,
  ContentCopy,
  Close,
} from '@mui/icons-material';

// Huisstijlkleuren
const primaryColor = '#008075'; // Groen voor restore en voltooid
const accentColor = '#EBAFB9'; // Roze-rood voor delete en te doen
const secondaryColor = '#FAA573'; // Kleur definitie toegevoegd
const subtleBackgroundColor = '#f8f9fa'; // Subtiele achtergrondkleur
const highlightColor = '#A0ADE0';

const CompletedUsers = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    const fetchCompletedUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'completedUsers'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching completed users: ', err);
        setError(err);
      }
    };

    fetchCompletedUsers();
  }, []);

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleRestoreUser = async (user) => {
    try {
      await setDoc(doc(collection(db, 'users'), user.id), user);
      await deleteDoc(doc(db, 'completedUsers', user.id));
      setUsers(users.filter(u => u.id !== user.id));
      alert('User restored successfully!');
    } catch (err) {
      console.error('Error restoring user: ', err);
      setError(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'completedUsers', userId));
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user: ', err);
      setError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setError(err);
    });
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: subtleBackgroundColor, minHeight: '100vh' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: primaryColor }}>
        Voltooide Gebruikers
      </Typography>
      {error && <Typography color="error">{error.message}</Typography>}
      {users.map(user => (
        <Card key={user.id} sx={{ marginBottom: 2, border: `1px solid ${highlightColor}` }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => toggleExpandUser(user.id)} sx={{ color: primaryColor }}>
                  {expandedUserId === user.id ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <Typography variant="h6" sx={{ color: primaryColor }}>
                  {user.displayName}
                </Typography>
                <Typography variant="body2" sx={{ marginLeft: 2, color: highlightColor }}>
                  Voltooid op: {new Date(user.completedDate).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  onClick={() => handleRestoreUser(user)}
                  startIcon={<Restore />}
                  sx={{
                    marginRight: 1,
                    backgroundColor: primaryColor,
                    '&:hover': {
                      backgroundColor: highlightColor,
                    },
                    color: '#fff',
                  }}
                >
                  Herstel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleDeleteUser(user.id)}
                  startIcon={<Delete />}
                  sx={{
                    backgroundColor: accentColor,
                    '&:hover': {
                      backgroundColor: secondaryColor,
                    },
                    color: '#fff',
                  }}
                >
                  Verwijder
                </Button>
              </Box>
            </Box>
            <Collapse in={expandedUserId === user.id} timeout="auto" unmountOnExit>
              <Box sx={{ borderTop: 1, borderColor: 'divider', paddingTop: 2 }}>
                <List>
                  {['givenName', 'surname', 'userPrincipalName', 'jobTitle', 'department'].map((field, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={field.replace(/([A-Z])/g, ' $1')} secondary={user[field]} />
                      <IconButton onClick={() => copyToClipboard(user[field])}>
                        <ContentCopy />
                      </IconButton>
                    </ListItem>
                  ))}
                  <ListItem>
                    <ListItemText primary="Created At" secondary={new Date(user.createdDateTime).toLocaleString()} />
                  </ListItem>
                </List>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}
      {copiedText && <Typography sx={{ color: 'green' }}>Copied: {copiedText}</Typography>}
    </Box>
  );
};

export default CompletedUsers;
