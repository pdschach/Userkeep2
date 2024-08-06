// UserList.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  ContentCopy,
} from '@mui/icons-material';

// Huisstijlkleuren
const primaryColor = '#008075'; // Groen voor complete en voltooid
const accentColor = '#EBAFB9'; // Roze-rood voor delete en te doen
const subtleBackgroundColor = '#f8f9fa'; // Subtiele achtergrondkleur
const highlightColor = '#A0ADE0';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users: ', err);
        setError(err);
      }
    };

    fetchUsers();
  }, []);

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
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
        To-Do Gebruikers
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
                <Typography variant="h6" sx={{ color: primaryColor }}>{user.displayName}</Typography>
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

export default UserList;
