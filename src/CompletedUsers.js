import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import styled from 'styled-components';
import { collection, getDocs } from 'firebase/firestore';

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

const CompletedUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'completedUsers'));
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

  return (
    <Container>
      <h1>Completed Users</h1>
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {users.map(user => (
        <Card key={user.id}>
          <strong>{user.displayName}</strong>
          <p>First Name: {user.givenName}</p>
          <p>Last Name: {user.surname}</p>
          <p>User Principal Name: {user.userPrincipalName}</p>
          <p>Job Title: {user.jobTitle}</p>
          <p>Department: {user.department}</p>
          <p>Created At: {new Date(user.createdDateTime).toLocaleString()}</p>
          <h4>To-Do List</h4>
          <ul>
            {user.todo && Object.keys(user.todo).map(item => (
              <li key={item}>{item}: {user.todo[item] ? 'Completed' : 'Pending'}</li>
            ))}
          </ul>
        </Card>
      ))}
    </Container>
  );
};

export default CompletedUsers;
