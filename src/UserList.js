// UserList.js
import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { getUserGroups, getUserMailboxes } from './graph'; // Voeg functie toe om mailboxes op te halen
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Checkbox,
  TextField,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Check,
  Delete,
  ContentCopy,
  Group as GroupIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import UserGroupsDialog from './UserGroupsDialog';

// Huisstijlkleuren
const primaryColor = '#008075';
const accentColor = '#EBAFB9';
const subtleBackgroundColor = '#f8f9fa';
const secondaryColor = '#FAA573';
const highlightColor = '#A0ADE0';

const UserList = () => {
  const { instance, accounts } = useMsal();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mailboxDialogOpen, setMailboxDialogOpen] = useState(false);
  const [mailboxes, setMailboxes] = useState([]);
  const [loadingMailboxes, setLoadingMailboxes] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        console.error('Error fetching users: ', err);
        setError(err);
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = async (userId, field, value) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        [`todo.${field}`]: value,
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, todo: { ...user.todo, [field]: value } } : user
      ));
      setFilteredUsers(filteredUsers.map(user =>
        user.id === userId ? { ...user, todo: { ...user.todo, [field]: value } } : user
      ));
    } catch (err) {
      console.error('Error updating todo: ', err);
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

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user: ', err);
      setError(err);
    }
  };

  const handleCompleteUser = async (user) => {
    try {
      const completedDate = new Date().toISOString(); // Huidige datum en tijd in ISO-formaat

      // Voeg completedDate toe aan het gebruikersdocument
      const completedUser = {
        ...user,
        completedDate,
      };

      // Sla de gebruiker op in de 'completedUsers' collectie met de voltooidatum
      await setDoc(doc(collection(db, 'completedUsers'), user.id), completedUser);

      // Verwijder de gebruiker uit de 'users' collectie
      await deleteDoc(doc(db, 'users', user.id));

      // Verwijder de gebruiker uit de lokale state
      setUsers(users.filter(u => u.id !== user.id));
      setFilteredUsers(filteredUsers.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Error completing user: ', err);
      setError(err);
    }
  };

  const handleShowGroups = async (user) => {
    try {
      const accessToken = await instance.acquireTokenSilent({
        scopes: ['User.Read.All', 'GroupMember.Read.All'],
        account: accounts[0],
      });

      const userGroups = await getUserGroups(user.id, accessToken.accessToken);
      setSelectedUser(user);
      setGroups(userGroups);
      setShowGroups(true);
    } catch (err) {
      console.error('Error fetching groups: ', err);
      setError(err);
    }
  };

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const renderTodoSummary = (user) => {
    const completedTasks = Object.entries(user.todo || {})
      .filter(([key, value]) => value)
      .map(([key]) => key);

    const pendingTasks = Object.entries(user.todo || {})
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      completed: completedTasks,
      pending: pendingTasks,
    };
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = users.filter(user =>
      user.userPrincipalName.toLowerCase().includes(searchValue)
    );
    setFilteredUsers(filtered);
  };

  const handleShowMailboxes = async (user) => {
    setLoadingMailboxes(true);
    try {
      const accessToken = await instance.acquireTokenSilent({
        scopes: ['Mail.ReadWrite'],
        account: accounts[0],
      });

      const userMailboxes = await getUserMailboxes(user.id, accessToken.accessToken);
      setMailboxes(userMailboxes);
      setSelectedUser(user);
      setMailboxDialogOpen(true);
    } catch (err) {
      console.error('Error fetching mailboxes:', err);
      setError(err);
    } finally {
      setLoadingMailboxes(false);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: subtleBackgroundColor, minHeight: '100vh' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: primaryColor }}>
        To-Do
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Search by User Principal Name..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ marginBottom: 3, backgroundColor: '#fff', borderRadius: 1 }}
      />
      {error && <Typography color="error">{error.message}</Typography>}
      {filteredUsers.map(user => {
        const summary = renderTodoSummary(user);
        return (
          <Card key={user.id} sx={{ marginBottom: 2, border: `1px solid ${highlightColor}` }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => toggleExpandUser(user.id)} sx={{ color: primaryColor }}>
                    {expandedUserId === user.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  <Typography variant="h6" sx={{ color: primaryColor }}>{user.displayName}</Typography>
                  {summary.pending.length > 0 && (
                    <Typography variant="body2" sx={{ marginLeft: 1, color: accentColor }}>
                      Te Doen: {summary.pending.length}
                    </Typography>
                  )}
                  {summary.completed.length > 0 && (
                    <Typography variant="body2" sx={{ marginLeft: 1, color: primaryColor }}>
                      Voltooid: {summary.completed.length}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => handleCompleteUser(user)}
                    startIcon={<Check />}
                    sx={{
                      marginRight: 1,
                      backgroundColor: primaryColor,
                      '&:hover': {
                        backgroundColor: highlightColor,
                      },
                      color: '#fff',
                    }}
                  >
                    Naar Voltooid
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
                  <Box sx={{ paddingTop: 2 }}>
                    {['Postvakdelegatie', 'Groepen (Active Directory)', 'Logonscript', 'Ultimo (profiel)', 'Ultimo (user koppeling)', 'Controle profiel', 'Intranet machtigingen', 'Brief'].map(item => (
                      <Box display="flex" alignItems="center" key={item}>
                        <Checkbox
                          checked={user.todo && user.todo[item]}
                          onChange={(e) => handleCheckboxChange(user.id, item, e.target.checked)}
                        />
                        <Typography variant="body2">{item}</Typography>
                        {item === 'Groepen (Active Directory)' && (
                          <IconButton onClick={(e) => { e.stopPropagation(); handleShowGroups(user); }}>
                            <GroupIcon />
                          </IconButton>
                        )}
                        {item === 'Postvakdelegatie' && (
                          <IconButton onClick={(e) => { e.stopPropagation(); handleShowMailboxes(user); }}>
                            <MailIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}
      {copiedText && <Typography sx={{ color: 'green' }}>Copied: {copiedText}</Typography>}
      <UserGroupsDialog
        open={showGroups}
        onClose={() => setShowGroups(false)}
        groups={groups}
        selectedUser={selectedUser}
      />
      <Dialog open={mailboxDialogOpen} onClose={() => setMailboxDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Postvakken voor {selectedUser?.displayName}</DialogTitle>
        <DialogContent>
          {loadingMailboxes ? (
            <CircularProgress />
          ) : (
            <List>
              {mailboxes.map(mailbox => (
                <ListItem key={mailbox.id}>
                  <ListItemText primary={mailbox.displayName} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserList;
