import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { getUsers } from './graph';
import { db } from './firebase';
import styled from 'styled-components';
import { collection, doc, setDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import UserList from './UserList';
import CompletedUsers from './CompletedUsers';

// Kleuren
const primaryColor = '#5e72e4';
const secondaryColor = '#11cdef';
const complementaryColor = '#f5365c';

const Container = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 16px;
  background-color: #f8f9fa;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const Card = styled.div`
  background-color: white;
  border: 1px solid ${secondaryColor};
  border-radius: 8px;
  width: 300px;
  margin: 16px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #344767;
`;

const Button = styled.button`
  background-color: ${primaryColor};
  border: none;
  border-radius: 4px;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  &:hover {
    background-color: ${complementaryColor};
  }
`;

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
      alert('User saved successfully!');
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
      <Container>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/users" element={<UserList />} />
            <Route path="/completed" element={<CompletedUsers />} />
            <Route path="/" element={
              <>
                <h1>New Users Created in the Last Week</h1>
                {!isAuthenticated && (
                  <Button onClick={handleLogin}>Login</Button>
                )}
                {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
                <CardContainer>
                  {users.map(user => (
                    <Card key={user.id}>
                      <strong>{user.displayName}</strong>
                      <p>First Name: {user.givenName}</p>
                      <p>Last Name: {user.surname}</p>
                      <p>User Principal Name: {user.userPrincipalName}</p>
                      <p>Job Title: {user.jobTitle}</p>
                      <p>Department: {user.department}</p>
                      <p>Created At: {new Date(user.createdDateTime).toLocaleString()}</p>
                      <Button onClick={() => handleSaveUser(user)}>Save</Button>
                    </Card>
                  ))}
                </CardContainer>
              </>
            } />
          </Routes>
        </MainContent>
      </Container>
    </Router>
  );
};

export default App;
