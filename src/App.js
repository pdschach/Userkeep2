// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { getUsers } from './graph';
import { db } from './firebase';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { collection, doc, setDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import UserList from './UserList';
import CompletedUsers from './CompletedUsers';

// Huisstijlkleuren
const primaryColor = '#008075';
const secondaryColor = '#FAA573';
const accentColor = '#EBAFB9';
const subtleBackgroundColor = '#f8f9fa';
const highlightColor = '#A0ADE0';

const App = () => {
  const { instance, accounts } = useMsal();
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      const request = {
        scopes: ['https://graph.microsoft.com/.default'],
        account: accounts[0],
      };

      instance.acquireTokenSilent(request).then(response => {
        fetchUsers(response.accessToken);
      }).catch(() => {
        instance.acquireTokenPopup(request).then(response => {
          fetchUsers(response.accessToken);
        }).catch(err => {
          console.error("Authentication error:", err);
          setError(err);
        });
      });
    }
  }, [instance, accounts]);

  const fetchUsers = (accessToken) => {
    getUsers(accessToken).then(users => {
      setUsers(users);
    }).catch(err => {
      console.error("Error fetching users:", err);
      setError(err);
    });
  };

  const handleSaveUser = async (user) => {
    try {
      await setDoc(doc(collection(db, 'users'), user.id), {
        ...user,
        todo: {
          'Postvakdelegatie': false,
          'Groepen (Active Directory)': false,
          'Logonscript': false,
          'Ultimo (profiel)': false,
          'Ultimo (user koppeling)': false,
          'Controle profiel': false,
          'Intranet machtigingen': false,
          'brief': false
        }
      });
      alert('Gebruiker is naar To-Do verzonden!');
    } catch (err) {
      console.error("Error saving user: ", err);
      setError(err);
    }
  };

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error("Login error:", e);
      setError(e);
    });
  };

  return (
    <Router>
      <Sidebar>
        <Box sx={{ backgroundColor: subtleBackgroundColor, minHeight: '100vh', padding: 3 }}>
          <Routes>
            <Route path="/" element={
              <Box sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ color: primaryColor }}>Laatst aangemaakte users (30)</Typography>
                {!isAuthenticated && (
                  <Button variant="contained" color="primary" onClick={handleLogin} sx={{ backgroundColor: primaryColor, '&:hover': { backgroundColor: highlightColor } }}>Login</Button>
                )}
                {error && <Typography color="error">Error: {error.message}</Typography>}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                  {users.map(user => (
                    <Card key={user.id} sx={{ width: 300, margin: 2, border: `1px solid ${highlightColor}` }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: primaryColor }}>{user.displayName}</Typography>
                        <Typography variant="body2">First Name: {user.givenName}</Typography>
                        <Typography variant="body2">Last Name: {user.surname}</Typography>
                        <Typography variant="body2">User Principal Name: {user.userPrincipalName}</Typography>
                        <Typography variant="body2">Job Title: {user.jobTitle}</Typography>
                        <Typography variant="body2">Department: {user.department}</Typography>
                        <Typography variant="body2">Created At: {new Date(user.createdDateTime).toLocaleString()}</Typography>
                        <Button variant="contained" color="secondary" onClick={() => handleSaveUser(user)} sx={{ backgroundColor: secondaryColor, '&:hover': { backgroundColor: accentColor }, color: '#fff' }}>Sla op in To-Do</Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            } />
            <Route path="/users" element={<UserList />} />
            <Route path="/completed" element={<CompletedUsers />} />
          </Routes>
        </Box>
      </Sidebar>
    </Router>
  );
};

export default App;
