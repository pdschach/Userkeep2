// UserList.js
import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { getUserGroups, getUserMailboxes } from './graph';
import { Box, TextField, Typography } from '@mui/material';
import UserCard from './UserCard';
import UserGroupsDialog from './UserGroupsDialog';
import MailboxAccessDialog from './MailboxAccessDialog';
import BriefDialog from './BriefDialog';

const primaryColor = '#008075';
const accentColor = '#EBAFB9';
const subtleBackgroundColor = '#f8f9fa';
const highlightColor = '#A0ADE0';

const UserList = () => {
  const { instance, accounts } = useMsal();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showGroups, setShowGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mailboxDialogOpen, setMailboxDialogOpen] = useState(false);
  const [mailboxes, setMailboxes] = useState([]);
  const [loadingMailboxes, setLoadingMailboxes] = useState(false);
  const [briefDialogOpen, setBriefDialogOpen] = useState(false);
  const [briefContent, setBriefContent] = useState('');

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

  const handleShowMailboxes = async (user) => {
    setLoadingMailboxes(true);
    try {
      const accessToken = await instance.acquireTokenSilent({
        scopes: ['Mail.Read', 'Mail.ReadWrite', 'Mail.ReadWrite.Shared', 'MailboxSettings.Read'],
        account: accounts[0],
      });

      const userMailboxes = await getUserMailboxes(user.userPrincipalName, accessToken.accessToken);
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

  const handleGenerateBrief = (user) => {
    const briefText = `
      Geachte heer/mevrouw ${user.surname},

      Hierbij bevestigen wij uw deelname aan het project. We danken u voor uw inzet en toewijding.

      Met vriendelijke groet,
      Uw Organisatie
    `;
    setBriefContent(briefText);
    setBriefDialogOpen(true);
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = users.filter(user =>
      user.userPrincipalName.toLowerCase().includes(searchValue)
    );
    setFilteredUsers(filtered);
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
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          handleCheckboxChange={handleCheckboxChange}
          handleCompleteUser={handleCompleteUser}
          handleShowGroups={handleShowGroups}
          handleShowMailboxes={handleShowMailboxes}
          handleGenerateBrief={handleGenerateBrief}
        />
      ))}
      <UserGroupsDialog
        open={showGroups}
        onClose={() => setShowGroups(false)}
        groups={groups}
        selectedUser={selectedUser}
      />
      <MailboxAccessDialog
        open={mailboxDialogOpen}
        onClose={() => setMailboxDialogOpen(false)}
        user={selectedUser}
        accessToken={accounts[0]?.idToken}
      />
      <BriefDialog
        open={briefDialogOpen}
        onClose={() => setBriefDialogOpen(false)}
        content={briefContent}
      />
    </Box>
  );
};

export default UserList;
