import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import styled from 'styled-components';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { FaClipboard, FaTrash, FaCheck } from 'react-icons/fa';

// Kleuren
const primaryColor = '#5e72e4';
const secondaryColor = '#11cdef';
const complementaryColor = '#f5365c';

const Container = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
`;

const Card = styled.div`
  background-color: white;
  border: 1px solid ${secondaryColor};
  border-radius: 8px;
  margin: 16px 0;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #344767;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  margin-right: 8px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const Button = styled.button`
  background-color: ${primaryColor};
  border: none;
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 8px;
  &:hover {
    background-color: ${complementaryColor};
  }
`;

const UserList = () => {
  const [users, setUsers] = useState([]);
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
        console.error("Error fetching users: ", err);
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
    } catch (err) {
      console.error("Error updating todo: ", err);
      setError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error("Failed to copy: ", err);
      setError(err);
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user: ", err);
      setError(err);
    }
  };

  const handleCompleteUser = async (user) => {
    try {
      await setDoc(doc(collection(db, 'completedUsers'), user.id), user);
      await deleteDoc(doc(db, 'users', user.id));
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      console.error("Error completing user: ", err);
      setError(err);
    }
  };

  return (
    <Container>
      <h1>Saved Users and Their To-Do Lists</h1>
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {users.map(user => (
        <Card key={user.id}>
          <strong>{user.displayName}</strong>
          <InfoContainer>
            <InfoText>First Name: {user.givenName}</InfoText>
            <Button onClick={() => copyToClipboard(user.givenName)}>
              <FaClipboard />
            </Button>
          </InfoContainer>
          <InfoContainer>
            <InfoText>Last Name: {user.surname}</InfoText>
            <Button onClick={() => copyToClipboard(user.surname)}>
              <FaClipboard />
            </Button>
          </InfoContainer>
          <InfoContainer>
            <InfoText>User Principal Name: {user.userPrincipalName}</InfoText>
            <Button onClick={() => copyToClipboard(user.userPrincipalName)}>
              <FaClipboard />
            </Button>
          </InfoContainer>
          <InfoContainer>
            <InfoText>Job Title: {user.jobTitle}</InfoText>
            <Button onClick={() => copyToClipboard(user.jobTitle)}>
              <FaClipboard />
            </Button>
          </InfoContainer>
          <InfoContainer>
            <InfoText>Department: {user.department}</InfoText>
            <Button onClick={() => copyToClipboard(user.department)}>
              <FaClipboard />
            </Button>
          </InfoContainer>
          <p>Created At: {new Date(user.createdDateTime).toLocaleString()}</p>
          <CheckboxContainer>
            {['Postvakdelegatie', 'Groepen (Active Directory)', 'Logonscript', 'Ultimo (profiel)', 'Ultimo (user koppeling)', 'Controle profiel', 'Intranet machtigingen', 'brief'].map(item => (
              <CheckboxLabel key={item}>
                <Checkbox
                  type="checkbox"
                  checked={user.todo && user.todo[item]}
                  onChange={(e) => handleCheckboxChange(user.id, item, e.target.checked)}
                />
                {item}
              </CheckboxLabel>
            ))}
          </CheckboxContainer>
          <Button onClick={() => handleDeleteUser(user.id)}>
            <FaTrash /> Delete
          </Button>
          <Button onClick={() => handleCompleteUser(user)}>
            <FaCheck /> Complete
          </Button>
          {copiedText && <p style={{ color: 'green' }}>Copied: {copiedText}</p>}
        </Card>
      ))}
    </Container>
  );
};

export default UserList;
